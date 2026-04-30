import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { EventBridge } from "@bobicloudvision/react-juce";

export const ParamIds = {
  DemoGain: "DemoGain",
  DemoDepth: "DemoDepth",
  DemoBypass: "DemoBypass",
};

const defaultValues = {
  DemoGain: {
    defaultValue: 0.0,
    currentValue: 0.0,
    stringValue: "loading",
  },
  DemoDepth: {
    defaultValue: 0.0,
    currentValue: 0.0,
    stringValue: "loading",
  },
  DemoBypass: {
    defaultValue: false,
    currentValue: false,
    stringValue: "loading",
  },
};

export const ParameterValueContext = createContext(defaultValues);

export const useParameter = (paramId) => {
  return useContext(ParameterValueContext)[paramId];
};

export const ParameterValueProvider = ({ children }) => {
  const [params, setParams] = useState(defaultValues);
  const onParameterValueChange = useCallback(
    (index, changedParamId, defaultValue, currentValue, stringValue) => {
      if (!ParamIds[changedParamId]) return;
      setParams((prevParams) => ({
        ...prevParams,
        [changedParamId]: {
          index,
          defaultValue,
          currentValue,
          stringValue,
        },
      }));
    },
    []
  );
  useEffect(() => {
    EventBridge.addListener("parameterValueChange", onParameterValueChange);
    return () => {
      EventBridge.removeListener(
        "parameterValueChange",
        onParameterValueChange
      );
    };
  }, [onParameterValueChange]);

  return (
    <ParameterValueContext.Provider value={params}>
      {children}
    </ParameterValueContext.Provider>
  );
};
