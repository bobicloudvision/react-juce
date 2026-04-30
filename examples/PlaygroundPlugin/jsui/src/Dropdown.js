import React, { memo, useCallback, useMemo, useState } from "react";
import { Text, View } from "@bobicloudvision/react-juce";
import { fs, theme as t } from "./theme";

const ff = t.fontFace;

/**
 * Select-style menu: trigger row + inline option list (no native ComboBox in react-juce).
 * Pass `open` + `onOpenChange` for controlled mode so the host can render a full-view dismiss layer.
 */
function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  open: openControlled,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = openControlled !== undefined;
  const open = controlled ? openControlled : internalOpen;

  const setOpen = useCallback(
    (next) => {
      if (!controlled) setInternalOpen(next);
      if (typeof onOpenChange === "function") onOpenChange(next);
    },
    [controlled, onOpenChange]
  );

  const toggle = useCallback(
    (e) => {
      e.stopPropagation();
      setOpen(!open);
    },
    [open, setOpen]
  );

  const selected = useMemo(() => options.find((o) => o.value === value), [
    options,
    value,
  ]);

  const pick = useCallback(
    (v) => (e) => {
      e.stopPropagation();
      onChange(v);
      setOpen(false);
    },
    [onChange, setOpen]
  );

  return (
    <View {...styles.root}>
      <View
        {...styles.trigger}
        interceptClickEvents={View.ClickEventFlags.allowClickEvents}
        onMouseDown={toggle}
      >
        <Text
          {...styles.triggerText}
          {...{ color: selected ? t.ink : t.inkFaint }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text {...styles.chevron}>{open ? "\u25B2" : "\u25BC"}</Text>
      </View>
      {open ? (
        <View {...styles.menu}>
          {options.map((opt, i) => {
            const active = opt.value === value;
            const last = i === options.length - 1;
            const rowStyle = active
              ? last
                ? styles.optionActiveLast
                : styles.optionActive
              : last
              ? styles.optionLast
              : styles.option;
            return (
              <View
                key={opt.value}
                {...rowStyle}
                interceptClickEvents={View.ClickEventFlags.allowClickEvents}
                onMouseDown={pick(opt.value)}
              >
                <Text
                  {...(active ? styles.optionTextActive : styles.optionText)}
                >
                  {opt.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default memo(Dropdown);

const styles = {
  /** `position: relative` + non-flow menu keeps siblings from shifting when open. */
  root: {
    width: "100%",
    position: "relative",
    overflow: "visible",
    flexDirection: "column",
    alignItems: "stretch",
    flexShrink: 0,
    marginBottom: 14,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingLeft: 14,
    paddingRight: 12,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: t.panelDeep,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.hairline,
  },
  triggerText: {
    ...ff,
    flex: 1,
    fontSize: fs(13),
    lineSpacing: 1.35,
  },
  chevron: {
    ...ff,
    color: t.accentMuted,
    fontSize: fs(10),
    marginLeft: 8,
  },
  menu: {
    "z-index": 100,
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    marginTop: 6,
    backgroundColor: t.panelLift,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.rule,
    flexDirection: "column",
    overflow: "hidden",
  },
  option: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: t.hairline,
  },
  optionActive: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: t.hairline,
    backgroundColor: t.panelDeep,
  },
  optionLast: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  optionActiveLast: {
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: t.panelDeep,
  },
  optionText: {
    ...ff,
    color: t.inkSoft,
    fontSize: fs(13),
    lineSpacing: 1.35,
  },
  optionTextActive: {
    ...ff,
    color: t.accentGlow,
    fontSize: fs(13),
    lineSpacing: 1.35,
    fontStyle: Text.FontStyleFlags.bold,
  },
};
