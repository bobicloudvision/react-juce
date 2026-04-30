/** Polyfill ES2015 data structures with core-js. */
import "core-js/es6/set";
import "core-js/es6/map";

import Reconciler from "react-reconciler";

import Backend from "./lib/Backend";
import Renderer, { TracedRenderer } from "./lib/Renderer";

export { default as EventBridge } from "./lib/EventBridge";

export * from "./components/View";
export * from "./components/ScrollView";
export * from "./components/Canvas";
export * from "./components/Text";
export * from "./components/TextInput";
export * from "./components/ComboBox";
export * from "./components/Image";
export * from "./components/Button";
export * from "./components/Slider";
export * from "./components/ListView";
export * from "./lib/SyntheticEvents";

let __renderStarted = false;
let __preferredRenderer: ReturnType<typeof Reconciler> = Renderer;

export default {
  getRootContainer() {
    return Backend.getRootContainer();
  },

  render(
    element: any,
    container: any,
    callback?: () => void | null | undefined
  ) {
    console.log("Render started...");

    // Create a root Container if it doesnt exist
    if (!container._rootContainer) {
      // LegacyRoot (0): synchronous updates, same behavior as React 17 roots.
      container._rootContainer = __preferredRenderer.createContainer(
        container,
        0,
        null,
        false,
        null,
        "",
        () => {},
        null
      );
    }

    return __preferredRenderer.updateContainer(
      element,
      container._rootContainer,
      null,
      callback ?? null
    );
  },

  enableMethodTrace() {
    if (__renderStarted) {
      throw new Error("Cannot enable method trace after initial render.");
    }

    __preferredRenderer = TracedRenderer;
  },
};
