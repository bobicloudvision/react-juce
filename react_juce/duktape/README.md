# Duktape amalgamation (react-juce)

Upstream Duktape is linked as a **git submodule** at `../third_party/duktape` (pin the tag you care about, e.g. `v2.7.0`).

This directory keeps only the **pre-built amalgamation** used by the build:

- `src-noline/duktape.c`, `duktape.h`, `duk_config.h`

Extras (`extras/console`, debugger transport) are compiled from paths under the submodule; CMake adds `third_party/duktape` to the include path.

## Regenerating `src-noline`

The git checkout does not include `src-noline`; it comes from the **release tarball** matching the submodule tag, or from `tools/configure.py` (historically Python 2).

1. Download the same version as the submodule, e.g. `duktape-2.7.0.tar.xz` from [Duktape releases](https://github.com/svaarala/duktape/releases).
2. Extract and copy `src-noline/*` into `react_juce/duktape/src-noline/`.
3. Re-apply the JUCE debug block at the end of `duk_config.h` (before the final `#endif` of `DUK_CONFIG_H_INCLUDED`): see git history or match `EcmascriptEngine_Duktape.cpp` / `JUCE_DEBUG` notes.
