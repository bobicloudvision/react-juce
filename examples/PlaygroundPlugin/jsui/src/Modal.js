import React, { memo, useCallback } from "react";
import { Button, Text, View } from "react-juce";
import { fs, theme as t } from "./theme";

const ff = t.fontFace;

/**
 * Full-viewport overlay: dimmed scrim (click to dismiss) and a raised panel.
 * Renders as a high sibling in the root view (after main content) so it stacks on top.
 */
function Modal({ open, onRequestClose, title, children }) {
  const handleScrim = useCallback(() => {
    onRequestClose();
  }, [onRequestClose]);

  const swallow = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!open) return null;

  return (
    <View {...styles.layer}>
      <View
        {...styles.scrim}
        interceptClickEvents={View.ClickEventFlags.allowClickEvents}
        onMouseDown={handleScrim}
      />
      <View
        {...styles.sheet}
        interceptClickEvents={View.ClickEventFlags.allowClickEvents}
        onMouseDown={swallow}
      >
        {title ? <Text {...styles.title}>{title}</Text> : null}
        <View {...styles.body}>{children}</View>
      </View>
    </View>
  );
}

export default memo(Modal);

export function ModalPrimaryButton({ label, onPress }) {
  return (
    <Button {...styles.primaryBtn} onClick={onPress}>
      <Text {...styles.primaryBtnLabel}>{label}</Text>
    </Button>
  );
}

const styles = {
  layer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  scrim: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: t.scrim,
  },
  sheet: {
    width: "88%",
    maxWidth: 440,
    backgroundColor: t.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: t.rule,
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 20,
    paddingRight: 20,
    flexShrink: 0,
    flexDirection: "column",
  },
  title: {
    ...ff,
    color: t.ink,
    fontSize: fs(18),
    fontStyle: Text.FontStyleFlags.bold,
    marginBottom: 10,
  },
  body: {
    flexDirection: "column",
    width: "100%",
  },
  primaryBtn: {
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44,
    marginTop: 14,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: t.accent,
  },
  primaryBtnLabel: {
    ...ff,
    color: t.void,
    fontSize: fs(13),
    fontStyle: Text.FontStyleFlags.bold,
  },
};
