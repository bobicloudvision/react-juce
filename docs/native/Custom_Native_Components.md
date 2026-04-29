# Custom native components

React-JUCE maps React elements to native `View` instances. Built-in tags (`View`, `Text`, `Image`, etc.) are registered in `ViewManager`. You can register additional types from C++ and use the same tag name from JavaScript.

## C++

1. **Subclass** `reactjuce::View` (and optionally override `setProperty`, `paint`, input handlers).
2. **Pair it with a shadow view** for layout:
   - Use `reactjuce::ShadowView` when flexbox behavior should match `View`.
   - Use a dedicated `ShadowView` subclass (e.g. `TextShadowView`) when you need custom Yoga measurement.
3. Before loading your bundle, call **`ReactApplicationRoot::registerViewType`** with a factory that returns `{std::move(view), std::move(shadowView)}`, matching how `GenericViewFactory` works in `ViewManager.cpp`.

Minimal pattern (same structure as `ViewManager`’s `GenericViewFactory`):

```cpp
#include <react_juce.h>

// MyWidget inherits reactjuce::View

reactApp.registerViewType ("MyWidget", [] {
    auto view = std::make_unique<MyWidget>();
    auto shadow = std::make_unique<reactjuce::ShadowView> (view.get());
    return reactjuce::ViewManager::ViewPair { std::move (view), std::move (shadow) };
});
```

Register **before** `evaluate` / `evaluateFile` on that `ReactApplicationRoot` so the reconciler can create instances.

## JavaScript

Use the **same string** as the native `typeId` as your host component. With the `react-juce` npm package, host components are created through the reconciler; your tag name must match what you passed to `registerViewType` (e.g. `"MyWidget"`).

## Native methods and refs

Views can expose behavior to JS via the ref / `invokeViewMethod` path used internally by the bridge. For simple cases, prefer **`registerNativeMethod`** on `EcmascriptEngine` (see `ReactApplicationRoot`) or **`dispatchEvent`** from C++ for app-level events.

## Yoga version

The bundled Yoga amalgamation in `YogaImplInclude.cpp` targets **Yoga 1.x**. Use a **v1.19.x** checkout under `react_juce/yoga`, or update the amalgamation for Yoga 3+.
