#!/usr/bin/env bash
set -euo pipefail

# Build GainPlugin for macOS: JS bundle (react-juce + example UI) then CMake Release binaries.
# Requires: Node.js (npm), CMake 3.15+, Xcode or CLT.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

export NODE_OPTIONS="--openssl-legacy-provider${NODE_OPTIONS:+ $NODE_OPTIONS}"

echo "==> Configure CMake (Release)"
npm run configure

echo "==> Build react-juce, GainPlugin jsui, native targets"
npm run build:gainplugin

echo "==> Done"
echo "Standalone: build/examples/GainPlugin/GainPlugin_artefacts/Release/Standalone/ReactJUCEGainPlugin.app"
