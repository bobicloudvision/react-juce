# Canvas

`Canvas` renders vector graphics through an `onDraw` callback. The context API mirrors the browser **subset** implemented in `CanvasRenderingContext` (`packages/react-juce/src/components/Canvas.ts`) and replayed natively in `CanvasView.cpp`.

## Drawing model

Each paint builds a **command list** from your callback (e.g. `fillStyle`, `arc`, `stroke`). The native view walks that list and applies it to a JUCE `Graphics` context.

## Supported operations

**Styles:** `fillStyle`, `strokeStyle`, `lineWidth`, `lineCap`, `font`, `textAlign`.

**Paths:** `beginPath`, `moveTo`, `lineTo`, `arc`, `quadraticCurveTo`, `closePath`, `fill`, `stroke`. Each `arc` begins a new subpath at the arc (aligned with HTML canvas); this avoids a spurious straight segment from the path origin.

**Transforms:** `rotate`, `translate`, `setTransform`, `resetTransform`.

**Stack:** `save`, `restore` — snapshots path + styles (including `lineCap`) + internal transform stack, paired with `juce::Graphics::saveState` / `restoreState`.

**Other:** `fillRect`, `strokeRect`, `fillRoundedRect`, `strokeRoundedRect`, `clearRect`, `drawImage` (SVG string), `fillText`, `strokeText`.

## `lineCap`

Setter accepts `"butt"` (default), `"round"`, or `"square"`. Affects `stroke()` and `strokeText()` via JUCE `PathStrokeType` end caps.

## Limitations

Gradients, patterns, shadows, images other than the SVG `drawImage` path, `clip`, and several canvas 2D features are not implemented. Prefer solid colours and paths for portable UI code.
