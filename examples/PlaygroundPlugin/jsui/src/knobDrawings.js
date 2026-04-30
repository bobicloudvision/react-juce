import { Slider } from "@bobicloudvision/react-juce";

function fitRadius(w, h, strokeReserve = 8) {
  const side = Math.min(w, h);
  return Math.max(10, side * 0.5 - strokeReserve);
}

/** Same arc renderer as `Slider.drawRotary` (reference implementation). */
export function arcDefaultDraw(theme) {
  return Slider.drawRotary(theme.hairline, theme.accent);
}

/** Bottom-gap sweep; canvas coords Y-down. */
const START = Math.PI * 0.75;
const SWEEP = Math.PI * 1.5;

function strokeArc(ctx, cx, cy, r, from, to, style, width, cap = "butt") {
  ctx.lineCap = cap;
  ctx.lineWidth = width;
  ctx.strokeStyle = style;
  ctx.beginPath();
  ctx.arc(cx, cy, r, from, to);
  ctx.stroke();
}

/** Track + needle from hub edge + hub disc on top. */
export function needleDraw(theme) {
  return (ctx, w, h, v) => {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = fitRadius(w, h, 6);
    const hub = Math.max(3, Math.min(w, h) * 0.055);
    const a = START + SWEEP * v;

    strokeArc(ctx, cx, cy, r, START, START + SWEEP, theme.hairline, 2, "butt");

    const ix = cx + Math.cos(a) * hub * 1.15;
    const iy = cy + Math.sin(a) * hub * 1.15;
    const ox = cx + Math.cos(a) * r * 0.86;
    const oy = cy + Math.sin(a) * r * 0.86;

    ctx.lineCap = "butt";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = theme.accent;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ox, oy);
    ctx.stroke();

    ctx.fillStyle = theme.accentGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, hub, 0, Math.PI * 2);
    ctx.fill();
  };
}

/** Thin track + thick value arc (butt caps avoid radial cap artifacts on arcs). */
export function thickValueDraw(theme) {
  return (ctx, w, h, v) => {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = fitRadius(w, h, 10);

    strokeArc(ctx, cx, cy, r, START, START + SWEEP, theme.hairline, 2, "butt");

    if (v <= 0.001) return;

    strokeArc(
      ctx,
      cx,
      cy,
      r,
      START,
      START + SWEEP * v,
      theme.accent,
      5,
      "butt"
    );
  };
}

/** Dot on arc — fill only (ring stroke looked like an extra “ghost” line). */
export function dotPointerDraw(theme) {
  return (ctx, w, h, v) => {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = fitRadius(w, h, 8);
    const dotR = Math.max(4, Math.min(w, h) * 0.06);

    strokeArc(ctx, cx, cy, r, START, START + SWEEP, theme.hairline, 2, "butt");

    const a = START + SWEEP * v;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;

    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(px, py, dotR, 0, Math.PI * 2);
    ctx.fill();
  };
}

/** Filled dial + one bezel stroke + value arc inside bezel (no overlapping full circles). */
export function insetFaceDraw(theme) {
  return (ctx, w, h, v) => {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = fitRadius(w, h, 10);
    const rim = r - 4;

    ctx.fillStyle = theme.panelDeep;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = "butt";
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.rule;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    if (v <= 0.001) return;

    strokeArc(
      ctx,
      cx,
      cy,
      rim,
      START,
      START + SWEEP * v,
      theme.accent,
      3,
      "butt"
    );
  };
}

/**
 * Track + five ticks only (no second sweep on the same radius — that caused Moiré/spokes).
 * Value shown by tick coloring + short pointer dash at current angle.
 */
export function tickedArcDraw(theme) {
  return (ctx, w, h, v) => {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = fitRadius(w, h, 8);

    strokeArc(ctx, cx, cy, r, START, START + SWEEP, theme.hairline, 2, "butt");

    for (let i = 0; i <= 4; i += 1) {
      const frac = i / 4;
      const ang = START + SWEEP * frac;
      const inner = r - 10;
      const outer = r - 1;
      const active = frac <= v + 0.0001;
      ctx.strokeStyle = active ? theme.accent : theme.inkFaint;
      ctx.lineWidth = active ? 2 : 1;
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
      ctx.lineTo(cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer);
      ctx.stroke();
    }

    if (v > 0.02 && v < 0.998) {
      const ang = START + SWEEP * v;
      const inner = r - 10;
      const mid = r - 5;
      ctx.strokeStyle = theme.accentGlow;
      ctx.lineWidth = 2;
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
      ctx.lineTo(cx + Math.cos(ang) * mid, cy + Math.sin(ang) * mid);
      ctx.stroke();
    }
  };
}
