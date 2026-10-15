#!/bin/sh
# Fetch the interpreter and the editor into vendor/. The runtime loads both from
# there, with relative paths, so it works under any URL prefix and in a room with
# no internet. Pinned: a new version is a deliberate upgrade, not a side effect
# of a build. Needs curl and tar, nothing else (no npm).
set -e
cd "$(dirname "$0")/.."

SKULPT_VERSION="1.2.0"
SKULPT_BASE="https://cdn.jsdelivr.net/npm/skulpt@$SKULPT_VERSION/dist"
mkdir -p vendor
for f in skulpt.min.js skulpt-stdlib.js; do
  if [ ! -s "vendor/$f" ]; then
    echo "fetching $f ($SKULPT_VERSION)"
    curl -fsSL "$SKULPT_BASE/$f" -o "vendor/$f"
  fi
done

# Monaco: the same version as the pacman runtime. Only min/vs is kept, which is
# what the AMD loader in index.html points at.
MONACO_VERSION="0.45.0"
if [ ! -s vendor/monaco/vs/loader.js ]; then
  echo "fetching monaco-editor ($MONACO_VERSION)"
  tmp="$(mktemp -d)"
  curl -fsSL "https://registry.npmjs.org/monaco-editor/-/monaco-editor-$MONACO_VERSION.tgz" -o "$tmp/monaco.tgz"
  tar -xzf "$tmp/monaco.tgz" -C "$tmp"
  rm -rf vendor/monaco
  mkdir -p vendor/monaco
  mv "$tmp/package/min/vs" vendor/monaco/vs
  rm -rf "$tmp"
fi
echo "vendor/ ready"
