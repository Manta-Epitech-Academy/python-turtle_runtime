#!/bin/sh
# Fetch the interpreter into vendor/. The runtime loads it from there, with a
# relative path, so it works under any URL prefix and in a room with no internet.
# Pinned: a new Skulpt is a deliberate upgrade, not a side effect of a build.
set -e
cd "$(dirname "$0")/.."
VERSION="1.2.0"
BASE="https://cdn.jsdelivr.net/npm/skulpt@$VERSION/dist"
mkdir -p vendor
for f in skulpt.min.js skulpt-stdlib.js; do
  if [ ! -s "vendor/$f" ]; then
    echo "fetching $f ($VERSION)"
    curl -fsSL "$BASE/$f" -o "vendor/$f"
  fi
done
echo "vendor/ ready"
