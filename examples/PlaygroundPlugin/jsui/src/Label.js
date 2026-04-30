import React, { memo } from "react";
import { Text, View } from "react-juce";
import { fs, theme } from "./theme";

const Label = ({ value, ...props }) => {
  return (
    <View {...props}>
      <Text {...styles.labelText}>{value}</Text>
    </View>
  );
};

const styles = {
  labelText: {
    ...theme.fontFace,
    color: theme.ink,
    fontSize: fs(14),
    lineSpacing: 1.4,
    fontStyle: Text.FontStyleFlags.bold,
  },
};

export default memo(Label);
