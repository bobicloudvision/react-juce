# React-JUCE

> Write cross-platform native apps with React.js and JUCE

React-JUCE (formerly named Blueprint) is a hybrid JavaScript/C++ framework that enables a [React.js](https://reactjs.org/) frontend for a [JUCE](http://juce.com/) application or plugin. It provides an embedded, ES5 JavaScript engine via [Duktape](http://duktape.org/), native hooks for rendering the React component tree to `juce::Component` instances, and a flexbox layout engine via [Yoga](https://yogalayout.com/).

For more information, see the introductory blog post here: [Blueprint: A JUCE Rendering Backend for React.js](https://nickwritesablog.com/blueprint-a-juce-rendering-backend-for-react-js)

## Repository

This project is maintained at **[github.com/bobicloudvision/react-juce](https://github.com/bobicloudvision/react-juce)**.

## Status

**Approaching Beta**. We hope to announce a beta release in the coming weeks, after which we will aim our focus at stability and completeness on the path
to a 1.0 release.

**Anticipated Breaking Changes**

- We'll be renaming Blueprint to react-juce before beta (#34)
- ~~Updating the examples and `npm init` template to point to npm instead of the local package~~
- ~~`ReactApplicationRoot::evaluate` and `ReactApplicationRoot::evaluateFile` (#115)~~
- ~~Refactoring the hot reloader and decoupling the EcmascriptEngine from ReactApplicationRoot (#65)~~

## Resources

- Community: [The Audio Programmer Discord Server](https://discord.gg/3H4wwVf49v)
  - Join the `#blueprint` channel and say hi!

## Maintainers (this fork)

- [@bobicloudvision](https://github.com/bobicloudvision)

## Original authors

- [@nick-thompson](https://github.com/nick-thompson)
- [@joshmarler](https://github.com/JoshMarler)

## Examples

React-JUCE is a young project, but already it provides the framework on which the entire user interface for [Creative Intent's Remnant](https://www.creativeintent.co/product/remnant) plugin is built.

![Creative Intent Remnant: Screenshot](https://github.com/bobicloudvision/react-juce/blob/master/RemnantScreenShot.jpg)

Besides that, you can check out the example code in the `examples/` directory. If you have a project written with React-JUCE that you want to share, get in touch! I would
love to showcase your work.

## Build (GainPlugin)

After clone, run `git submodule update --init --recursive` (JUCE, Yoga, Hermes, Duktape). From the repo root, with CMake 3.15+ and a C++17 toolchain: `npm install` then `npm run build` configures `build/`, compiles the `examples/GainPlugin/jsui` bundle (webpack uses Node’s OpenSSL legacy provider for compatibility), and builds the plugin targets. Use `npm run build:gainplugin` if the build directory is already configured. On macOS, `./build-mac.sh` runs the same Release flow.

## Contributing

See [CONTRIBUTING.md](https://github.com/bobicloudvision/react-juce/blob/master/CONTRIBUTING.md)

## License

See [LICENSE.md](https://github.com/bobicloudvision/react-juce/blob/master/LICENSE.md)
