import EventEmitter from "events";
import { EventBridge } from "@bobicloudvision/react-juce";

class ParameterValueStore extends EventEmitter {
  constructor() {
    super();

    this.CHANGE_EVENT = "change";

    this.setMaxListeners(100);
    this._onParameterValueChange = this._onParameterValueChange.bind(this);

    EventBridge.addListener(
      "parameterValueChange",
      this._onParameterValueChange
    );

    this.state = {};
  }

  getParameterState(paramId) {
    if (!this.state.hasOwnProperty(paramId)) {
      return {};
    }

    return this.state[paramId];
  }

  _onParameterValueChange(
    index,
    paramId,
    defaultValue,
    currentValue,
    stringValue
  ) {
    this.state[paramId] = {
      parameterIndex: index,
      parameterId: paramId,
      defaultValue: defaultValue,
      currentValue: currentValue,
      stringValue: stringValue,
    };

    this.emit(this.CHANGE_EVENT, paramId);
  }
}

const __singletonInstance = new ParameterValueStore();

export default __singletonInstance;
