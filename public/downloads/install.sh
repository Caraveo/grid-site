#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  GRID CLI installer — official binary from grid-compute.com
#
#  What this script does:
#    1. Detects your OS + CPU (macOS Intel / Apple Silicon, Linux x86_64)
#    2. Downloads the matching Phase-1 `grid` binary over HTTPS
#    3. Verifies it looks like a real GRID CLI (runs `grid auth --help`)
#    4. Installs to ~/.local/bin/grid (or --prefix / --system)
#    5. Optionally adds that directory to your PATH in .zshrc / .bashrc
#
#  What it does NOT do:
#    · Does not run as root unless you choose --system and sudo is required
#    · Does not send telemetry or open outbound connections except the download
#    · Does not modify Docker, launchd, or start a node daemon
#    · Does not touch your wallet / chain.json / operator keys
#
#  One-liner:
#    curl -fsSL https://grid-compute.com/downloads/install.sh | bash
#
#  Options (after bash -s -- …):
#    --force         Reinstall even if Phase-1 grid is already present
#    --system        Prefer /usr/local/bin (uses sudo if needed)
#    --prefix=DIR    Install directory (default: ~/.local/bin)
#    --uninstall     Remove managed grid binary
#    --yes           Non-interactive (skip optional PATH prompt nuances)
#    -h | --help
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ORIGIN="${GRID_ORIGIN:-https://grid-compute.com}"
INSTALL_DIR="${GRID_INSTALL_DIR:-$HOME/.local/bin}"
PREFIX="${GRID_PREFIX:-}"
FORCE=0
SYSTEM=0
UNINSTALL=0
YES=0
VERSION_HINT="0.2.20"
ASSET_REV="20260729-v0220-engine"

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --system) SYSTEM=1 ;;
    --uninstall) UNINSTALL=1 ;;
    --yes|-y) YES=1 ;;
    --prefix=*) PREFIX="${arg#*=}" ;;
    -h|--help)
      cat <<EOF

  GRID CLI installer  ·  v${VERSION_HINT}+  ·  ${ORIGIN}

  Installs the official Phase-1 node binary so you can host compute, mine
  security PoR, register names, and talk to the public mesh registry.

  Usage:
    curl -fsSL ${ORIGIN}/downloads/install.sh | bash
    curl -fsSL ${ORIGIN}/downloads/install.sh | bash -s -- --force
    curl -fsSL ${ORIGIN}/downloads/install.sh | bash -s -- --prefix=\$HOME/bin

  Options:
    --force         Reinstall / upgrade even if grid already works
    --system        Prefer /usr/local/bin (may prompt for sudo)
    --prefix=DIR    Install binary into DIR (default: ~/.local/bin)
    --uninstall     Remove the managed grid binary
    --yes           Non-interactive defaults
    -h, --help      This help

  After install:
    hash -r && which grid && grid -V
    grid status          # node + blockchain size + security check
    grid auth --help     # passkey / operator protection
    grid init --name my-node --class S
    grid node            # P2P peer + host + mine

  Docs:  https://docs.grid-compute.com
  Site:  ${ORIGIN}

EOF
      exit 0
      ;;
    *)
      printf 'error: unknown option: %s\n' "$arg" >&2
      exit 1
      ;;
  esac
done

# ── pretty terminal ──────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'
  RED=$'\033[31m'; CYAN=$'\033[36m'; RESET=$'\033[0m'
else
  BOLD=""; DIM=""; GREEN=""; YELLOW=""; RED=""; CYAN=""; RESET=""
fi
info()  { printf '%s→%s %s\n' "$DIM" "$RESET" "$*" >&2; }
ok()    { printf '%s✓%s %s\n' "$GREEN" "$RESET" "$*" >&2; }
warn()  { printf '%s!%s %s\n' "$YELLOW" "$RESET" "$*" >&2; }
die()   { printf '%serror:%s %s\n' "$RED" "$RESET" "$*" >&2; exit 1; }
step()  { printf '\n%s▸%s %s%s%s\n' "$CYAN" "$RESET" "$BOLD" "$*" "$RESET" >&2; }

banner() {
  cat >&2 <<EOF

${BOLD}${CYAN}      /\\
     /  \\
    / ## \\     G R I D
    \\    /     useful mining · bitcoin TSL
     \\  /
      \\/${RESET}

${DIM}  Official CLI installer · ${ORIGIN}
  Phase 1 · host · mine · registry · wallet${RESET}

EOF
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1 (install it and re-run)"
}

is_phase1_binary() {
  local bin="$1"
  [[ -x "$bin" ]] || return 1
  # Phase-1 CLI always exposes auth / status / registry
  if "$bin" auth --help >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

resolve_bin_dir() {
  if [[ -n "$PREFIX" ]]; then
    echo "$PREFIX"
  elif [[ "$SYSTEM" -eq 1 ]]; then
    echo "/usr/local/bin"
  else
    echo "$INSTALL_DIR"
  fi
}

ensure_dir_writable() {
  local dir="$1"
  if [[ -d "$dir" && -w "$dir" ]]; then
    return 0
  fi
  if mkdir -p "$dir" 2>/dev/null && [[ -w "$dir" ]]; then
    return 0
  fi
  return 1
}

install_file() {
  local src="$1"
  local dest="$2"
  local dest_dir
  dest_dir="$(dirname "$dest")"

  if ensure_dir_writable "$dest_dir"; then
    install -m 755 "$src" "$dest"
    return 0
  fi

  if command -v sudo >/dev/null 2>&1; then
    warn "Need elevated rights to write $dest"
    if sudo mkdir -p "$dest_dir" && sudo install -m 755 "$src" "$dest"; then
      return 0
    fi
  fi
  return 1
}

ensure_path_export() {
  local dest_dir="$1"
  case ":$PATH:" in
    *":$dest_dir:"*) return 0 ;;
  esac

  warn "$dest_dir is not on your PATH"
  info "Add this to your shell config, then open a new terminal:"
  echo
  echo "  export PATH=\"$dest_dir:\$PATH\""
  echo

  local rc=""
  if [[ -n "${ZSH_VERSION:-}" ]] || [[ "${SHELL:-}" == *zsh* ]]; then
    rc="$HOME/.zshrc"
  elif [[ -n "${BASH_VERSION:-}" ]] || [[ "${SHELL:-}" == *bash* ]]; then
    rc="$HOME/.bashrc"
  fi

  if [[ -n "$rc" ]]; then
    local line="export PATH=\"$dest_dir:\$PATH\"  # GRID CLI"
    if [[ -f "$rc" ]] && grep -qF "$dest_dir" "$rc" 2>/dev/null; then
      info "PATH already referenced in $rc"
    else
      if [[ "$dest_dir" == "$HOME/.local/bin" || "$dest_dir" == "$HOME/bin" || "$YES" -eq 1 ]]; then
        printf '\n# GRID CLI\n%s\n' "$line" >> "$rc"
        ok "Appended PATH export to $rc"
        export PATH="$dest_dir:$PATH"
      fi
    fi
  fi
}

os_arch() {
  local os arch
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  case "$arch" in
    x86_64|amd64) arch="x86_64" ;;
    aarch64|arm64) arch="aarch64" ;;
    *) die "unsupported CPU architecture: $arch" ;;
  esac
  case "$os" in
    linux) os="linux" ;;
    darwin) os="darwin" ;;
    *) die "unsupported OS: $os — see ${ORIGIN}/#download for packages" ;;
  esac
  case "${os}-${arch}" in
    darwin-x86_64|darwin-aarch64|linux-x86_64) echo "${os}-${arch}" ;;
    linux-aarch64) die "Linux ARM64 is not published yet — use a Linux x86_64 host or download a supported release" ;;
    *) die "unsupported platform: ${os}-${arch}" ;;
  esac
}

asset_name() {
  # Hosted as: grid-darwin-x86_64, grid-darwin-aarch64, grid-linux-x86_64, …
  echo "grid-$(os_arch)"
}

human_platform() {
  case "$(os_arch)" in
    darwin-x86_64) echo "macOS · Intel (x86_64)" ;;
    darwin-aarch64) echo "macOS · Apple Silicon (aarch64)" ;;
    linux-x86_64) echo "Linux · x86_64" ;;
    *) echo "$(os_arch)" ;;
  esac
}

# ── uninstall ────────────────────────────────────────────────────────────────
if [[ "$UNINSTALL" -eq 1 ]]; then
  banner
  step "Uninstall"
  bin_dir="$(resolve_bin_dir)"
  dest="$bin_dir/grid"
  if [[ -f "$dest" ]]; then
    rm -f "$dest" || { command -v sudo >/dev/null && sudo rm -f "$dest"; }
    ok "Removed $dest"
  else
    info "No grid binary at $dest"
  fi
  info "Note: ~/.grid config, keys, and chain.json were left untouched."
  exit 0
fi

# ── install ──────────────────────────────────────────────────────────────────
banner
need_cmd curl
need_cmd install
need_cmd uname
need_cmd mktemp
need_cmd chmod

step "Detect platform"
plat="$(human_platform)"
ok "$plat"

bin_dir="$(resolve_bin_dir)"
dest="$bin_dir/grid"
info "Install target: $dest"

step "Check for existing install"
if [[ "$FORCE" -eq 0 ]] && is_phase1_binary "$dest"; then
  ok "Phase-1 grid already installed at $dest"
  "$dest" -V 2>/dev/null || true
  info "Re-run with --force to upgrade."
  exit 0
fi

if [[ "$FORCE" -eq 0 ]]; then
  existing="$(command -v grid 2>/dev/null || true)"
  if [[ -n "$existing" ]] && is_phase1_binary "$existing"; then
    ok "Phase-1 grid already on PATH: $existing"
    "$existing" -V 2>/dev/null || true
    info "Re-run with --force to replace: curl -fsSL ${ORIGIN}/downloads/install.sh | bash -s -- --force"
    exit 0
  fi
  if [[ -n "$existing" ]]; then
    warn "Found non-Phase-1 binary at $existing (will not remove automatically)"
  fi
fi

asset="$(asset_name)"
url="${ORIGIN}/downloads/cli/${asset}?rev=${ASSET_REV}"
tmp="$(mktemp "${TMPDIR:-/tmp}/grid-cli.XXXXXX")"
sums="$(mktemp "${TMPDIR:-/tmp}/grid-sums.XXXXXX")"
sig="$(mktemp "${TMPDIR:-/tmp}/grid-sig.XXXXXX")"
pub="$(mktemp "${TMPDIR:-/tmp}/grid-pub.XXXXXX")"
trap 'rm -f "$tmp" "$sums" "$sig" "$pub"' EXIT

step "Download"
info "Asset:  $asset"
info "URL:    $url"
if ! curl -fsSL --proto '=https' --tlsv1.2 "$url" -o "$tmp"; then
  die "download failed — no prebuilt binary for $(os_arch) yet.
  Browse ${ORIGIN}/#download or build from source: https://docs.grid-compute.com"
fi

# basic size sanity (empty / HTML error pages)
bytes="$(wc -c <"$tmp" | tr -d ' ')"
if [[ "${bytes:-0}" -lt 1000000 ]]; then
  die "downloaded file is too small (${bytes} bytes) — expected a multi-MB binary. URL may be missing."
fi
ok "Downloaded $(printf '%s' "$bytes" | awk '{printf "%.1f MiB", $1/1024/1024}')"
chmod +x "$tmp"

step "Verify signed release"
need_cmd openssl
curl -fsSL --proto '=https' --tlsv1.2 "${ORIGIN}/downloads/cli/SHA256SUMS?rev=${ASSET_REV}" -o "$sums"
curl -fsSL --proto '=https' --tlsv1.2 "${ORIGIN}/downloads/cli/SHA256SUMS.sig?rev=${ASSET_REV}" -o "$sig"
curl -fsSL --proto '=https' --tlsv1.2 "${ORIGIN}/downloads/cli/release-signing-public.pem?rev=${ASSET_REV}" -o "$pub"
fingerprint="$(openssl pkey -pubin -in "$pub" -outform DER 2>/dev/null | openssl dgst -sha256 | awk '{print $NF}')"
[[ "$fingerprint" == "4f1d04b12256e848642c6fcde56ed9b95f4917d64c23a8965f5f63f7ace09735" ]] ||
  die "release signing key fingerprint changed — installation stopped"
if ! openssl dgst -sha256 -verify "$pub" -signature "$sig" "$sums" >/dev/null 2>&1; then
  die "release manifest signature is invalid — installation stopped"
fi
expected="$(awk -v asset="$asset" '$2 == asset || $2 == "*" asset { print $1 }' "$sums")"
[[ -n "$expected" ]] || die "release manifest has no checksum for $asset"
if command -v shasum >/dev/null 2>&1; then
  actual="$(shasum -a 256 "$tmp" | awk '{print $1}')"
else
  need_cmd sha256sum
  actual="$(sha256sum "$tmp" | awk '{print $1}')"
fi
[[ "$actual" == "$expected" ]] || die "binary checksum mismatch — installation stopped"
ok "Signature and SHA-256 checksum verified"

step "Verify binary"
if ! is_phase1_binary "$tmp"; then
  die "downloaded file is not a Phase-1 grid binary (missing 'grid auth')"
fi
ver="$("$tmp" -V 2>/dev/null | head -1 || true)"
ok "Looks good${ver:+ · $ver}"

# Back up non-phase1 binaries that collide on name
if [[ -x "$dest" ]] && ! is_phase1_binary "$dest"; then
  bak="${dest}.legacy.bak"
  info "Backing up legacy binary → $bak"
  mv -f "$dest" "$bak" 2>/dev/null || true
fi

step "Install"
info "Writing → $dest"
if ! install_file "$tmp" "$dest"; then
  die "could not write $dest
  Try:  bash -s -- --prefix=\$HOME/bin
    or: bash -s -- --system"
fi
ok "Installed $dest"

step "PATH"
ensure_path_export "$bin_dir"

step "Done"
ok "GRID CLI is ready"
echo >&2
if is_phase1_binary "$dest"; then
  "$dest" -V 2>/dev/null || true
fi

cat >&2 <<EOF

${BOLD}What you installed${RESET}
  ${DIM}A single ${RESET}${BOLD}grid${RESET}${DIM} binary — the Phase-1 node CLI.${RESET}
  ${DIM}Host useful containers, mine PoR, claim names, wallet, registry.${RESET}

${BOLD}Next steps${RESET}
  ${CYAN}hash -r && which grid && grid -V${RESET}
  ${CYAN}grid status${RESET}                 ${DIM}# node + blockchain size + security check${RESET}
  ${CYAN}grid auth --help${RESET}            ${DIM}# protect operator keys (passkey)${RESET}
  ${CYAN}grid init --name my-node --class S${RESET}
  ${CYAN}grid solana create${RESET}           ${DIM}# create a devnet GRID reward wallet${RESET}
  ${CYAN}grid mine${RESET}                    ${DIM}# verified PoR → automatic Solana rewards${RESET}
  ${CYAN}grid node${RESET}                   ${DIM}# P2P peer + host + mine${RESET}
  ${CYAN}grid registry${RESET}               ${DIM}# public mesh from grid-compute.com${RESET}

${BOLD}Upgrade later${RESET}
  ${DIM}curl -fsSL ${ORIGIN}/downloads/install.sh | bash -s -- --force${RESET}

${DIM}Docs · https://docs.grid-compute.com
Site · ${ORIGIN}${RESET}

EOF
