# Duktape (vendored)

Single tree under `react_juce/duktape/`:

- `src-noline/` — amalgamation (`duktape.c`, `duktape.h`, `duk_config.h`); includes the react-juce `JUCE_DEBUG` block in `duk_config.h`.
- `extras/console/` — console extra compiled by `EcmascriptEngine_Duktape.cpp`.
- `examples/debug-trans-socket/` — debugger transport sources.

All of the above are taken from the same **Duktape release** (currently **2.7.0**). To upgrade: use the matching [release tarball](https://github.com/svaarala/duktape/releases), replace `src-noline/` and refresh extras/debug-trans-socket if upstream changed them, then re-apply the `duk_config.h` `JUCE_DEBUG` section.
