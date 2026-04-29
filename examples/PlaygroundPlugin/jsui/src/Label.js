import React, { memo } from "react";
import { Text, View } from "react-juce";

const Label = ({ value, ...props }) => {
  return (
    <View {...props}>
      <Text {...styles.labelText}>{value}</Text>
    </View>
  );
};

const styles = {
  labelText: {
    color: "#b8c0cc",
    fontSize: 14.0,
    lineSpacing: 1.5,
  },
};

export default memo(Label);
