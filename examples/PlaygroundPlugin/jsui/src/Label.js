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
    color: "#f7f3eb",
    fontSize: 14.0,
    lineSpacing: 1.4,
    fontStyle: Text.FontStyleFlags.bold,
  },
};

export default memo(Label);
