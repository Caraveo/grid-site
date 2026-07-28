#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/public/downloads/cli"
STATE="$ROOT/state"
PRIVATE="$STATE/release-signing-private.pem"
PUBLIC="$CLI/release-signing-public.pem"
MANIFEST="$CLI/SHA256SUMS"
SIGNATURE="$CLI/SHA256SUMS.sig"

mkdir -p "$STATE"
chmod 700 "$STATE"

if [[ ! -f "$PRIVATE" ]]; then
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out "$PRIVATE"
  chmod 600 "$PRIVATE"
fi

openssl pkey -in "$PRIVATE" -pubout -out "$PUBLIC"

(
  cd "$CLI"
  for asset in grid-darwin-aarch64 grid-darwin-x86_64 grid-linux-x86_64 grid-windows-x86_64.exe; do
    [[ -f "$asset" ]] || { echo "missing $asset" >&2; exit 1; }
    if command -v shasum >/dev/null 2>&1; then
      shasum -a 256 "$asset"
    else
      sha256sum "$asset"
    fi
  done
) > "$MANIFEST"

openssl dgst -sha256 -sign "$PRIVATE" -out "$SIGNATURE" "$MANIFEST"
openssl dgst -sha256 -verify "$PUBLIC" -signature "$SIGNATURE" "$MANIFEST"
echo "signed $MANIFEST"
