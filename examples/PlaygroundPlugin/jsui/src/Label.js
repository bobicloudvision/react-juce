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
    color: "#f0f4f8",
    fontSize: 15.0,
    lineSpacing: 1.45,
    fontStyle: Text.FontStyleFlags.bold,
  },
};

export default memo(Label);
