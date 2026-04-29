import MethodTracer from "./MethodTracer";
import ReactReconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import Backend, { ViewInstance, RawTextViewInstance } from "./Backend";

import invariant from "invariant";

type HostContext = {
  isInTextParent: boolean;
};

function throwUnsupported(feature: string) {
  return (..._args: unknown[]) => {
    throw new Error(
      `React-JUCE does not support ${feature}. If this surfaces during normal rendering, file an issue.`
    );
  };
}

//TODO: This should really be types against ReactReconciler.HostConfig with the generics typed out.
const HostConfig = {
  /** Time provider. */
  now: Date.now,

  /** Indicates to the reconciler that our DOM tree supports mutating operations
   *  like appendChild, removeChild, etc.
   */
  supportsMutation: true,

  /** Provides the context for rendering the root level element.
   *
   *  Really only using this and `getChildHostContext` for enforcing nesting
   *  constraints, such as that raw text content must be a child of a <Text>
   *  element.
   */
  getRootHostContext(rootContainerInstance: ViewInstance): HostContext {
    return {
      isInTextParent: false,
    };
  },

  /** Provides the context for rendering a child element.
   */
  getChildHostContext(
    parentHostContext: HostContext,
    elementType: string,
    rootContainerInstance: ViewInstance
  ): HostContext {
    const isInTextParent =
      parentHostContext.isInTextParent || elementType === "Text";

    return { isInTextParent };
  },

  prepareForCommit() {
    return null;
  },
  resetAfterCommit: (...args: any) => {
    Backend.resetAfterCommit();
  },

  getPublicInstance(instance: ViewInstance | RawTextViewInstance) {
    return instance;
  },

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  isPrimaryRenderer: true,
  warnsIfNotActing: true,

  supportsPersistence: false,
  cloneInstance: throwUnsupported("cloneInstance (persistence)"),
  createContainerChildSet: throwUnsupported("createContainerChildSet"),
  appendChildToContainerChildSet: throwUnsupported(
    "appendChildToContainerChildSet"
  ),
  finalizeContainerChildren: throwUnsupported("finalizeContainerChildren"),
  replaceContainerChildren: throwUnsupported("replaceContainerChildren"),
  cloneHiddenInstance: throwUnsupported("cloneHiddenInstance"),
  cloneHiddenTextInstance: throwUnsupported("cloneHiddenTextInstance"),

  supportsHydration: false,
  canHydrateInstance: throwUnsupported("canHydrateInstance"),
  canHydrateTextInstance: throwUnsupported("canHydrateTextInstance"),
  canHydrateSuspenseInstance: throwUnsupported("canHydrateSuspenseInstance"),
  isSuspenseInstancePending: throwUnsupported("isSuspenseInstancePending"),
  isSuspenseInstanceFallback: throwUnsupported("isSuspenseInstanceFallback"),
  getSuspenseInstanceFallbackErrorDetails: throwUnsupported(
    "getSuspenseInstanceFallbackErrorDetails"
  ),
  registerSuspenseInstanceRetry: throwUnsupported(
    "registerSuspenseInstanceRetry"
  ),
  getNextHydratableSibling: throwUnsupported("getNextHydratableSibling"),
  getFirstHydratableChild: throwUnsupported("getFirstHydratableChild"),
  getFirstHydratableChildWithinContainer: throwUnsupported(
    "getFirstHydratableChildWithinContainer"
  ),
  getFirstHydratableChildWithinSuspenseInstance: throwUnsupported(
    "getFirstHydratableChildWithinSuspenseInstance"
  ),
  hydrateInstance: throwUnsupported("hydrateInstance"),
  hydrateTextInstance: throwUnsupported("hydrateTextInstance"),
  hydrateSuspenseInstance: throwUnsupported("hydrateSuspenseInstance"),
  getNextHydratableInstanceAfterSuspenseInstance: throwUnsupported(
    "getNextHydratableInstanceAfterSuspenseInstance"
  ),
  commitHydratedContainer: throwUnsupported("commitHydratedContainer"),
  commitHydratedSuspenseInstance: throwUnsupported(
    "commitHydratedSuspenseInstance"
  ),
  clearSuspenseBoundary: throwUnsupported("clearSuspenseBoundary"),
  clearSuspenseBoundaryFromContainer: throwUnsupported(
    "clearSuspenseBoundaryFromContainer"
  ),
  shouldDeleteUnhydratedTailInstances: throwUnsupported(
    "shouldDeleteUnhydratedTailInstances"
  ),
  didNotMatchHydratedContainerTextInstance: throwUnsupported(
    "didNotMatchHydratedContainerTextInstance"
  ),
  didNotMatchHydratedTextInstance: throwUnsupported(
    "didNotMatchHydratedTextInstance"
  ),
  didNotHydrateInstanceWithinContainer: throwUnsupported(
    "didNotHydrateInstanceWithinContainer"
  ),
  didNotHydrateInstanceWithinSuspenseInstance: throwUnsupported(
    "didNotHydrateInstanceWithinSuspenseInstance"
  ),
  didNotHydrateInstance: throwUnsupported("didNotHydrateInstance"),
  didNotFindHydratableInstanceWithinContainer: throwUnsupported(
    "didNotFindHydratableInstanceWithinContainer"
  ),
  didNotFindHydratableTextInstanceWithinContainer: throwUnsupported(
    "didNotFindHydratableTextInstanceWithinContainer"
  ),
  didNotFindHydratableSuspenseInstanceWithinContainer: throwUnsupported(
    "didNotFindHydratableSuspenseInstanceWithinContainer"
  ),
  didNotFindHydratableInstanceWithinSuspenseInstance: throwUnsupported(
    "didNotFindHydratableInstanceWithinSuspenseInstance"
  ),
  didNotFindHydratableTextInstanceWithinSuspenseInstance: throwUnsupported(
    "didNotFindHydratableTextInstanceWithinSuspenseInstance"
  ),
  didNotFindHydratableSuspenseInstanceWithinSuspenseInstance: throwUnsupported(
    "didNotFindHydratableSuspenseInstanceWithinSuspenseInstance"
  ),
  didNotFindHydratableInstance: throwUnsupported(
    "didNotFindHydratableInstance"
  ),
  didNotFindHydratableTextInstance: throwUnsupported(
    "didNotFindHydratableTextInstance"
  ),
  didNotFindHydratableSuspenseInstance: throwUnsupported(
    "didNotFindHydratableSuspenseInstance"
  ),
  errorHydratingContainer: throwUnsupported("errorHydratingContainer"),

  supportsTestSelectors: false,
  findFiberRoot: throwUnsupported("findFiberRoot"),
  getBoundingRect: throwUnsupported("getBoundingRect"),
  getTextContent: throwUnsupported("getTextContent"),
  isHiddenSubtree: throwUnsupported("isHiddenSubtree"),
  matchAccessibilityRole: throwUnsupported("matchAccessibilityRole"),
  setFocusIfFocusable: throwUnsupported("setFocusIfFocusable"),
  setupIntersectionObserver: throwUnsupported("setupIntersectionObserver"),

  supportsMicrotasks: false,
  scheduleMicrotask: throwUnsupported("scheduleMicrotask"),

  prepareScopeUpdate: throwUnsupported("prepareScopeUpdate"),
  getInstanceFromScope: throwUnsupported("getInstanceFromScope"),

  getInstanceFromNode(_node: unknown) {
    return null;
  },

  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  preparePortalMount() {},
  detachDeletedInstance() {},

  getCurrentEventPriority() {
    return DefaultEventPriority;
  },

  /** Called to determine whether or not a new text value can be set on an
   *  existing node, or if a new text node needs to be created.
   *
   *  This is essentially born from the fact in that in a Web DOM, there are certain
   *  nodes, such as <textarea>, that support a `textContent` property. Setting the
   *  node's `textContent` property is different from creating a TextNode and appending
   *  it to the node's children array. This method signals which option to take.
   *
   *  In our case, we return `false` always because we have no nodes in the JUCE
   *  backend that support this kind of behavior. All text nodes must be created as
   *  RawTextViewInstances as children of a TextViewInstance.
   */
  shouldSetTextContent(elementType: string, props: any) {
    return false;
  },

  /** Create a new DOM node. */
  createInstance(
    elementType: string,
    props: any,
    rootContainerInstance: ViewInstance,
    hostContext: HostContext,
    internalInstanceHandle: any
  ): ViewInstance {
    invariant(
      !hostContext.isInTextParent,
      "Nesting elements inside of <Text> is currently not supported."
    );

    return Backend.createViewInstance(
      elementType,
      props,
      rootContainerInstance
    );
  },

  /** Create a new text node. */
  createTextInstance(
    text: string,
    rootContainerInstance: ViewInstance,
    hostContext: HostContext,
    internalInstanceHandle: any
  ): RawTextViewInstance {
    invariant(
      hostContext.isInTextParent,
      "Raw text strings must be rendered within a <Text> element."
    );

    return Backend.createTextViewInstance(text, rootContainerInstance);
  },

  /** Mount the child to its container. */
  appendInitialChild(parentInstance: ViewInstance, child: ViewInstance): void {
    parentInstance.appendChild(child);
  },

  /** For each newly constructed node, once we finish the assignment of children
   *  this method will be called to finalize the node. We take this opportunity
   *  to propagate relevant properties to the node.
   */
  finalizeInitialChildren(
    instance: ViewInstance,
    elementType: string,
    props: any,
    rootContainerInstance: ViewInstance,
    _hostContext: HostContext
  ): boolean {
    Object.keys(props).forEach(function (propKey) {
      if (propKey !== "children") {
        instance.setProperty(propKey, props[propKey]);
      }
    });
    return false;
  },

  /** During a state change, this method will be called to identify the set of
   *  properties that need to be updated. This is more-or-less an opportunity
   *  for us to diff our props before propagating.
   */
  prepareUpdate(
    domElement: any,
    elementType: string,
    oldProps: any,
    newProps: any,
    rootContainerInstance: ViewInstance,
    hostContext: HostContext
  ) {
    // The children prop will be handled separately via the tree update.
    let { children: oldChildren, ...op } = oldProps;
    let { children: newChildren, ...np } = newProps;

    // We construct a new payload of property values that are either new or
    // have changed for this element.
    let payload: any = {};

    for (let key in np) {
      if (np.hasOwnProperty(key) && np[key] !== op[key]) {
        payload[key] = np[key];
      }
    }

    return payload;
  },

  /** Following from `prepareUpdate` above, this is our opportunity to apply
   *  the update payload to a given instance.
   */
  commitUpdate(
    instance: ViewInstance,
    updatePayload: any,
    elementType: string,
    oldProps: any,
    newProps: any,
    internalInstanceHandle: any
  ): void {
    Object.keys(updatePayload).forEach(function (propKey: string): void {
      instance.setProperty(propKey, updatePayload[propKey]);
    });
  },

  /** Similar to the previous method, this is our opportunity to apply text
   *  updates to a given instance.
   */
  commitTextUpdate(
    instance: RawTextViewInstance,
    oldText: string,
    newText: string
  ): void {
    if (typeof newText === "string" && oldText !== newText) {
      instance.setTextValue(newText);
    }
  },

  commitMount(
    _instance: ViewInstance,
    _type: string,
    _newProps: any,
    _internalInstanceHandle: any
  ): void {
    // Noop
  },

  /** Append a child to a parent instance. */
  appendChild(parentInstance: ViewInstance, child: ViewInstance): void {
    parentInstance.appendChild(child);
  },

  /** Append a child to a parent container.
   *  TODO: Not really sure how this is different from the above.
   */
  appendChildToContainer(
    parentContainer: ViewInstance,
    child: ViewInstance
  ): void {
    parentContainer.appendChild(child);
  },

  /** Inserts a child node into a parent's children array, just before the
   *  second given child node.
   */
  insertBefore(
    parentInstance: ViewInstance,
    child: ViewInstance,
    beforeChild: ViewInstance
  ): void {
    let index = parentInstance.getChildIndex(beforeChild);

    if (index < 0)
      throw new Error(
        "Failed to find child instance for insertBefore operation."
      );

    parentInstance.insertChild(child, index);
  },

  /** Remove a child from a parent instance. */
  removeChild(parentInstance: ViewInstance, child: ViewInstance): void {
    parentInstance.removeChild(child);
  },

  /** Remove a child from a parent container. */
  removeChildFromContainer(
    parentContainer: ViewInstance,
    child: ViewInstance
  ): void {
    parentContainer.removeChild(child);
  },

  insertInContainerBefore(
    container: ViewInstance,
    child: ViewInstance,
    beforeChild: ViewInstance
  ): void {
    const index = container.getChildIndex(beforeChild);

    if (index < 0)
      throw new Error(
        "Failed to find child instance for insertInContainerBefore operation."
      );

    container.insertChild(child, index);
  },

  resetTextContent(_instance: ViewInstance) {},

  hideInstance(instance: ViewInstance) {
    instance.setProperty("opacity", "00ffffff");
  },

  hideTextInstance(_textInstance: RawTextViewInstance) {},

  unhideInstance(instance: ViewInstance, props: any) {
    const o = props["opacity"];
    instance.setProperty("opacity", o !== undefined ? o : "ffffffff");
  },

  unhideTextInstance(_textInstance: RawTextViewInstance, _text: string) {},

  clearContainer(container: ViewInstance) {
    Backend.clearContainer(container);
  },
};

//TODO: Applied ts-ignore here as TS complains about missing functions on HostConfig
//@ts-ignore
export default ReactReconciler(HostConfig);
export const TracedRenderer = ReactReconciler(
  new Proxy(HostConfig, MethodTracer)
);
