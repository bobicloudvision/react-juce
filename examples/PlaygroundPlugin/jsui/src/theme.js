/**
 * Global color tokens for the Playground UI (slate / cyan accent).
 * Import `theme` everywhere; avoid scattering hex literals in components.
 */
const base = {
  void: "#05070d",
  stone140: "#121a24",
  stone0b: "#080c14",
  stone101: "#0e141e",
  panel: "#141c28",
  panelLift: "#1c2736",
  panelDeep: "#0a1018",
  hairline: "#253447",
  rule: "#334155",
  ink: "#e8f0f8",
  inkSoft: "#94a8bc",
  inkFaint: "#5c6b7e",
  accent: "#38bdf8",
  accentMuted: "#0e7490",
  accentGlow: "#a5f3fc",
  ok: "#4ade80",
  warn: "#fbbf24",
  danger: "#f87171",
  inputSelection: "#1e3d52",
};

/** Spread onto `<Text>` / `<TextInput>` styles — Outfit is bundled via FontRegistry in the plugin. */
const outfit = Object.freeze({ "font-family": "Outfit" });

/** Legacy px → scaled size (~1.5×) for Playground readability. */
export function fs(px) {
  return Math.round(px * 1.5);
}

export const theme = Object.freeze({
  ...base,
  bg: `linear-gradient(168deg, ${base.stone140} 0%, ${base.stone0b} 42%, ${base.stone101} 100%)`,
  surfaceListAlt: base.stone140,
  fontFace: outfit,
});
