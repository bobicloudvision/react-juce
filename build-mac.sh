#!/usr/bin/env bash
set -euo pipefail

# Build example plugins for macOS: JS bundles then CMake binaries (Release by default).
# Usage: ./build-mac.sh [--build-debug]
# Requires: Node.js (npm), CMake 3.15+, Xcode or CLT.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BUILD_TYPE=Release
for arg in "$@"; do
  case "$arg" in
    --build-debug) BUILD_TYPE=Debug ;;
  esac
done

export NODE_OPTIONS="--openssl-legacy-provider${NODE_OPTIONS:+ $NODE_OPTIONS}"

echo "==> Configure CMake ($BUILD_TYPE)"
cmake -B build -S . -DCMAKE_BUILD_TYPE="$BUILD_TYPE"

echo "==> Build react-juce + both example JS bundles + native targets"
npm run build:examples-jsui
cmake --build build --parallel --config "$BUILD_TYPE"

echo "==> Done"
echo "Gain standalone: build/examples/GainPlugin/GainPlugin_artefacts/${BUILD_TYPE}/Standalone/ReactJUCEGainPlugin.app"
echo "Playground standalone: build/examples/PlaygroundPlugin/PlaygroundPlugin_artefacts/${BUILD_TYPE}/Standalone/ReactJUCE Playground.app"
