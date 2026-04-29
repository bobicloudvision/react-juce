#!/usr/bin/env bash
set -euo pipefail

# Build example plugins for macOS: JS bundles then CMake Release binaries.
# Requires: Node.js (npm), CMake 3.15+, Xcode or CLT.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

export NODE_OPTIONS="--openssl-legacy-provider${NODE_OPTIONS:+ $NODE_OPTIONS}"

echo "==> Configure CMake (Release)"
npm run configure

echo "==> Build react-juce + both example JS bundles + native targets"
npm run build:examples-jsui
npm run build:native

echo "==> Done"
echo "Gain standalone: build/examples/GainPlugin/GainPlugin_artefacts/Release/Standalone/ReactJUCEGainPlugin.app"
echo "Playground standalone: build/examples/PlaygroundPlugin/PlaygroundPlugin_artefacts/Release/Standalone/ReactJUCE Playground.app"
