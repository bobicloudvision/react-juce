import React, { PropsWithChildren } from "react";

export interface ComboBoxChangeEvent {
  value: string;
  selectedIndex: number;
}

export type ComboBoxItem = string | { value: string; label: string };

/** Trigger uses shared View/Text props; popup menu uses `menu-*` keys on the same element. */
export interface ComboBoxProps {
  items?: ComboBoxItem[];
  value?: string;
  placeholder?: string;
  editable?: boolean;
  onChange?: (e: ComboBoxChangeEvent) => void;

  /** Closed control — same as View / TextInput (`color`, `background-color`, `border-*`, `font-*`, `border-radius`). */
  /** Inner stroke — overrides `border-color` for the ComboBox outline if set. */
  "outline-color"?: string;
  /** Stroke width for the ComboBox outline (px). Falls back to `border-width`. */
  "outline-width"?: number;
  "arrow-color"?: string;
  "focused-outline-color"?: string;
  "button-color"?: string;

  /** Dropdown panel */
  "menu-background-color"?: string;
  /** Menu item text */
  "menu-color"?: string;
  "menu-highlight-background-color"?: string;
  "menu-highlight-color"?: string;
  "menu-header-color"?: string;
  "menu-border-color"?: string;
  "menu-border-width"?: number;
  "menu-border-radius"?: number;
  "menu-font-size"?: number;
  "menu-font-family"?: string;
  "menu-font-style"?: number;
  /** Row height in px (optional; defaults from menu font). */
  "menu-item-height"?: number;
}

export function ComboBox(props: PropsWithChildren<ComboBoxProps | any>) {
  return React.createElement("ComboBox", props, props.children);
}
