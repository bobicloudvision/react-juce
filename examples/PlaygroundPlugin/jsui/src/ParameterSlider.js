import React, { memo, useCallback } from "react";
import { Slider } from "react-juce";
import {
  beginParameterChangeGesture,
  endParameterChangeGesture,
  setParameterValueNotifyingHost,
} from "./nativeMethods";

const ParameterSlider = ({ value, paramId, children, ...props }) => {
  const onMouseDown = (e) => {
    beginParameterChangeGesture(paramId);
  };

  const onMouseUp = (e) => {
    endParameterChangeGesture(paramId);
  };

  const onSliderValueChange = useCallback(
    (v) => {
      setParameterValueNotifyingHost(paramId, v);
    },
    [paramId]
  );

  return (
    <Slider
      {...props}
      value={value}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onChange={onSliderValueChange}
    >
      {children}
    </Slider>
  );
};

export default memo(ParameterSlider);
