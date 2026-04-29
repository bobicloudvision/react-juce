# Duktape layout

- **`react_juce/third_party/duktape`** — git submodule ([svaarala/duktape](https://github.com/svaarala/duktape)), pinned to the same release as the amalgamation below. Holds `extras/console`, `examples/debug-trans-socket`, and the rest of upstream.
- **`src-noline/`** (this directory) — amalgamation (`duktape.c`, `duktape.h`, `duk_config.h`) kept in this repo; `duk_config.h` includes the react-juce `JUCE_DEBUG` block.

After clone run `git submodule update --init --recursive`. To bump Duktape: advance the submodule to a new tag, replace `src-noline/` from that release’s dist output, re-apply the `duk_config.h` `JUCE_DEBUG` section, and rebuild.
