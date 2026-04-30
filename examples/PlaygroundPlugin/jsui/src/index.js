/* Must run before React: Duktape has no Map/Set; reconciler needs them at load time.
 * Import modules/… directly (not es6/map.js) so webpack resolves core-js internals reliably. */
import "core-js/modules/es6.object.to-string";
import "core-js/modules/es6.string.iterator";
import "core-js/modules/web.dom.iterable";
import "core-js/modules/es6.map";
import "core-js/modules/es6.set";

import React from "react";
import ReactJUCE from "@bobicloudvision/react-juce";
import App from "./App";
import { ParameterValueProvider } from "./ParameterValueContext";

ReactJUCE.render(
  <ParameterValueProvider>
    <App />
  </ParameterValueProvider>,
  ReactJUCE.getRootContainer()
);
