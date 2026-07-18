#!/usr/bin/env bash
# GRID CLI installer — downloads the Phase 1 binary from grid-compute.com
#
# One-liner:
#   curl -fsSL https://grid-compute.com/downloads/install.sh | bash
#
# Options (after bash -s -- …):
#   --force         Reinstall even if Phase-1 grid is already present
#   --system        Prefer /usr/local/bin (uses sudo if needed)
#   --prefix=DIR    Install directory (default: ~/.local/bin)
#   --uninstall     Remove managed grid binary
#   -h | --help
set -euo pipefail

ORIGIN="${GRID_ORIGIN:-https://grid-compute.com}"
INSTALL_DIR="${GRID_INSTALL_DIR:-$HOME/.local/bin}"
PREFIX="${GRID_PREFIX:-}"
FORCE=0
SYSTEM=0
UNINSTALL=0

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --system) SYSTEM=1 ;;
    --uninstall) UNINSTALL=1 ;;
    --prefix=*) PREFIX="${arg#*=}" ;;
    -h|--help)
      cat <<EOF
GRID install — Phase 1 useful mining CLI (hosted on grid-compute.com)

  curl -fsSL ${ORIGIN}/downloads/install.sh | bash

Options (pass after bash -s --):
  --force         Reinstall even if Phase-1 grid already works
  --system        Prefer /usr/local/bin (may use sudo)
  --prefix=DIR    Install binary into DIR (default: ~/.local/bin)
  --uninstall     Remove managed grid binary
  -h, --help      This help

After install, verify:
  hash -r && which grid && grid -V && grid auth --help
EOF
      exit 0
      ;;
    *)
      printf 'error: unknown option: %s\n' "$arg" >&2
      exit 1
      ;;
  esac
done

if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'
  RED=$'\033[31m'; RESET=$'\033[0m'
else
  BOLD=""; DIM=""; GREEN=""; YELLOW=""; RED=""; RESET=""
fi
info()  { printf '%s→%s %s\n' "$DIM" "$RESET" "$*" >&2; }
ok()    { printf '%s✓%s %s\n' "$GREEN" "$RESET" "$*" >&2; }
warn()  { printf '%s!%s %s\n' "$YELLOW" "$RESET" "$*" >&2; }
die()   { printf '%serror:%s %s\n' "$RED" "$RESET" "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

is_phase1_binary() {
  local bin="$1"
  [[ -x "$bin" ]] || return 1
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

  if [[ -t 0 ]] && command -v sudo >/dev/null 2>&1; then
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
      if [[ -t 0 || -t 1 ]]; then
        if [[ "$dest_dir" == "$HOME/.local/bin" || "$dest_dir" == "$HOME/bin" ]]; then
          printf '\n# GRID CLI\n%s\n' "$line" >> "$rc"
          ok "Appended PATH export to $rc"
          export PATH="$dest_dir:$PATH"
        fi
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
    *) die "unsupported arch: $arch" ;;
  esac
  case "$os" in
    linux) os="linux" ;;
    darwin) os="darwin" ;;
    *) die "unsupported OS: $os — download a binary from ${ORIGIN}/#download" ;;
  esac
  echo "${os}-${arch}"
}

asset_name() {
  local platform
  platform="$(os_arch)"
  # Site hosts: grid-darwin-x86_64, grid-darwin-aarch64, grid-linux-x86_64, …
  echo "grid-${platform}"
}

if [[ "$UNINSTALL" -eq 1 ]]; then
  bin_dir="$(resolve_bin_dir)"
  dest="$bin_dir/grid"
  if [[ -f "$dest" ]]; then
    rm -f "$dest" || { command -v sudo >/dev/null && sudo rm -f "$dest"; }
    ok "Removed $dest"
  else
    info "No grid binary at $dest"
  fi
  exit 0
fi

need_cmd curl
need_cmd install
need_cmd uname

bin_dir="$(resolve_bin_dir)"
dest="$bin_dir/grid"

if [[ "$FORCE" -eq 0 ]] && is_phase1_binary "$dest"; then
  ok "Phase-1 grid already installed at $dest"
  "$dest" -V 2>/dev/null || true
  exit 0
fi

if [[ "$FORCE" -eq 0 ]]; then
  existing="$(command -v grid 2>/dev/null || true)"
  if [[ -n "$existing" ]] && is_phase1_binary "$existing"; then
    ok "Phase-1 grid already on PATH: $existing"
    "$existing" -V 2>/dev/null || true
    exit 0
  fi
fi

asset="$(asset_name)"
url="${ORIGIN}/downloads/cli/${asset}"
tmp="$(mktemp "${TMPDIR:-/tmp}/grid-cli.XXXXXX")"
trap 'rm -f "$tmp"' EXIT

info "Downloading ${asset}"
info "  $url"
if ! curl -fsSL "$url" -o "$tmp"; then
  die "download failed — no prebuilt binary for $(os_arch) yet at $url"
fi
chmod +x "$tmp"

if ! is_phase1_binary "$tmp"; then
  die "downloaded file is not a Phase-1 grid binary (missing grid auth)"
fi

# Back up non-phase1 binaries that collide on name
if [[ -x "$dest" ]] && ! is_phase1_binary "$dest"; then
  bak="${dest}.legacy.bak"
  info "Backing up legacy binary → $bak"
  mv -f "$dest" "$bak" 2>/dev/null || true
fi

info "Installing → $dest"
if ! install_file "$tmp" "$dest"; then
  die "could not write $dest (try --prefix=\$HOME/bin or --system)"
fi

ensure_path_export "$bin_dir"

ok "Installed Phase-1 GRID CLI"
if is_phase1_binary "$dest"; then
  "$dest" -V 2>/dev/null || true
  info "Next: grid auth --help · grid init --name garage --class S · grid node"
else
  die "install completed but $dest failed Phase-1 check"
fi
