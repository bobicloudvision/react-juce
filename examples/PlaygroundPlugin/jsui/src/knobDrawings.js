import { Slider } from "react-juce";

/** Geometry shared by custom rotary sketches (~270° sweep, gap at bottom). */
const START = Math.PI * 0.75;
const SWEEP = Math.PI * 1.5;

function withCanvasState(fn) {
  return (ctx, width, height, value) => {
    ctx.save();
    try {
      fn(ctx, width, height, value);
    } finally {
      ctx.restore();
    }
  };
}

/** Same arc renderer as `Slider.drawRotary` (reference implementation). */
export function arcDefaultDraw(theme) {
  return Slider.drawRotary(theme.hairline, theme.accent);
}

/** Fine track + needle + hub cap. */
export function needleDraw(theme) {
  return withCanvasState((ctx, w, h, v) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.42;
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.hairline;
    ctx.beginPath();
    ctx.arc(cx, cy, r, START, START + SWEEP);
    ctx.stroke();
    const a = START + SWEEP * v;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r * 0.88, cy + Math.sin(a) * r * 0.88);
    ctx.stroke();
    ctx.fillStyle = theme.accentGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Thin track, thick rounded value stroke (meter-style). */
export function thickValueDraw(theme) {
  return withCanvasState((ctx, w, h, v) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.42;
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.hairline;
    ctx.beginPath();
    ctx.arc(cx, cy, r, START, START + SWEEP);
    ctx.stroke();
    ctx.lineCap = "round";
    ctx.lineWidth = 7;
    ctx.strokeStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, r, START, START + SWEEP * v);
    ctx.stroke();
  });
}

/** Dot travelling along the arc (DJ mixer cue style). */
export function dotPointerDraw(theme) {
  return withCanvasState((ctx, w, h, v) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.42;
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.hairline;
    ctx.beginPath();
    ctx.arc(cx, cy, r, START, START + SWEEP);
    ctx.stroke();
    const a = START + SWEEP * v;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.accentGlow;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/** Inset disc + value arc on the rim only. */
export function insetFaceDraw(theme) {
  return withCanvasState((ctx, w, h, v) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.44;
    ctx.fillStyle = theme.panelDeep;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.rule;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, START, START + SWEEP * v);
    ctx.stroke();
  });
}

/** Outer arc track + tick marks at 0 / 25 / 50 / 75 / 100%. */
export function tickedArcDraw(theme) {
  return withCanvasState((ctx, w, h, v) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.42;
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.hairline;
    ctx.beginPath();
    ctx.arc(cx, cy, r, START, START + SWEEP);
    ctx.stroke();
    for (let i = 0; i <= 4; i += 1) {
      const t = i / 4;
      const a = START + SWEEP * t;
      const inner = r - 10;
      const outer = r - 2;
      ctx.strokeStyle = t <= v ? theme.accent : theme.inkFaint;
      ctx.lineWidth = t <= v ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
      ctx.stroke();
    }
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, START, START + SWEEP * v);
    ctx.stroke();
  });
}
