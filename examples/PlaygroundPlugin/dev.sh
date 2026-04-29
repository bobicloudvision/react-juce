#!/usr/bin/env bash
# Webpack watch writes jsui/build/js/main.js; a Debug build of GenericEditor hot-reloads on change.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
export NODE_OPTIONS="--openssl-legacy-provider${NODE_OPTIONS:+ $NODE_OPTIONS}"

echo "==> Playground JS watch (Ctrl+C to stop)"
echo "    (Webpack uses production React for Duktape; RJUCE_USE_DEV_REACT=1 to force dev React)"
echo "    Bundle: $HERE/jsui/build/js/main.js"
echo "    Hot reload: use a Debug build of the standalone. Default CMake is often Release (no hot reload)."
echo "    macOS open (Release, if you built with -DCMAKE_BUILD_TYPE=Release):"
echo "      open \"$REPO/build/examples/PlaygroundPlugin/PlaygroundPlugin_artefacts/Release/Standalone/ReactJUCE Playground.app\""
echo "    macOS open (Debug, for bundle watch reload):"
echo "      open \"$REPO/build/examples/PlaygroundPlugin/PlaygroundPlugin_artefacts/Debug/Standalone/ReactJUCE Playground.app\""
echo ""
cd "$HERE/jsui"
exec npm start
