import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Canvas,
  EventBridge,
  Image,
  ListView,
  ScrollView,
  Slider,
  Text,
  TextInput,
  View,
} from "react-juce";
import Label from "./Label";
import ParameterSlider from "./ParameterSlider";
import ParameterToggleButton from "./ParameterToggleButton";
import {
  arcDefaultDraw,
  dotPointerDraw,
  insetFaceDraw,
  needleDraw,
  thickValueDraw,
  tickedArcDraw,
} from "./knobDrawings";
import { ParamIds, useParameter } from "./ParameterValueContext";
import { theme as t } from "./theme";

const LIST_DATA = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  label: `Row ${String(i + 1).padStart(3, "0")}`,
}));

const logoSrc = require("./logo.png");

function Panel({ label, title, hint, children }) {
  return (
    <View {...styles.panel}>
      <View {...styles.panelHeader}>
        <Text {...styles.panelKicker}>{label}</Text>
        <View {...styles.panelHeading}>
          <Text {...styles.panelTitle}>{title}</Text>
          {hint ? <Text {...styles.panelHint}>{hint}</Text> : null}
        </View>
      </View>
      <View {...styles.panelHairline} />
      <View {...styles.panelBody}>{children}</View>
    </View>
  );
}

function GainKnob() {
  const { stringValue, currentValue } = useParameter(ParamIds.DemoGain);
  const drawRotary = useMemo(() => arcDefaultDraw(t), []);
  return (
    <View {...styles.knobCol}>
      <Text {...styles.controlTag}>GAIN</Text>
      <ParameterSlider
        paramId={ParamIds.DemoGain}
        value={currentValue}
        onDraw={drawRotary}
        mapDragGestureToValue={Slider.rotaryGestureMap}
        {...styles.rotary}
      />
      <Label value={stringValue} {...styles.readout} />
    </View>
  );
}

function KnobGallery() {
  const { currentValue, stringValue } = useParameter(ParamIds.DemoGain);
  const draws = useMemo(
    () => ({
      arc: arcDefaultDraw(t),
      needle: needleDraw(t),
      thick: thickValueDraw(t),
      dot: dotPointerDraw(t),
      inset: insetFaceDraw(t),
      ticked: tickedArcDraw(t),
    }),
    []
  );

  const tiles = [
    ["Arc", draws.arc],
    ["Needle", draws.needle],
    ["Bold arc", draws.thick],
    ["Dot", draws.dot],
    ["Inset", draws.inset],
    ["Ticks + arc", draws.ticked],
  ];

  return (
    <Panel
      label="KNOBS"
      title="Rotary styles"
      hint="Canvas onDraw demos · all use DemoGain."
    >
      <Text {...styles.knobGalleryHint}>Shared readout · {stringValue}</Text>
      <View {...styles.knobGalleryRow}>
        {tiles.map(([label, onDraw]) => (
          <View key={label} {...styles.knobTile}>
            <Text {...styles.knobTileLabel}>{label}</Text>
            <ParameterSlider
              paramId={ParamIds.DemoGain}
              value={currentValue}
              onDraw={onDraw}
              mapDragGestureToValue={Slider.rotaryGestureMap}
              {...styles.rotarySmall}
            />
          </View>
        ))}
      </View>
    </Panel>
  );
}

function DepthSlider() {
  const { stringValue, currentValue } = useParameter(ParamIds.DemoDepth);
  const drawH = useMemo(
    () => Slider.drawLinearHorizontal(t.hairline, t.accent),
    []
  );
  return (
    <View {...styles.depthCol}>
      <View {...styles.depthHeader}>
        <Text {...styles.controlTag}>DEPTH</Text>
        <Label value={stringValue} {...styles.readoutSmall} />
      </View>
      <ParameterSlider
        paramId={ParamIds.DemoDepth}
        value={currentValue}
        onDraw={drawH}
        mapDragGestureToValue={Slider.linearHorizontalGestureMap}
        {...styles.horizontalSlider}
      />
    </View>
  );
}

export default function App() {
  const [inputValue, setInputValue] = useState("Signal chain · rename me");
  const [clicks, setClicks] = useState(0);
  const [tickPhase, setTickPhase] = useState(0);
  const [lastEvent, setLastEvent] = useState("—");
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 72 });

  useEffect(() => {
    const onTick = (phase) => setTickPhase(phase);
    const onParam = (index, id, def, val, str) => {
      setLastEvent(`${id}  ${str}`);
    };
    EventBridge.addListener("playgroundTick", onTick);
    EventBridge.addListener("parameterValueChange", onParam);
    return () => {
      EventBridge.removeListener("playgroundTick", onTick);
      EventBridge.removeListener("parameterValueChange", onParam);
    };
  }, []);

  const onDrawWave = useCallback(
    (ctx) => {
      const w = Math.max(32, Math.floor(canvasSize.width));
      const h = Math.max(24, Math.floor(canvasSize.height));
      ctx.fillStyle = t.panelDeep;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = t.rule;
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);

      const mid = h * 0.5;
      const amp = Math.min(h * 0.36, 16);
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const phase = (x / Math.max(w, 1)) * Math.PI * 2 + tickPhase;
        const y = mid + Math.sin(phase) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = t.hairline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, mid);
      ctx.lineTo(w - 8, mid);
      ctx.stroke();
    },
    [tickPhase, canvasSize.width, canvasSize.height]
  );

  const onCanvasMeasure = useCallback((e) => {
    const w = typeof e.width === "number" ? e.width : 0;
    const h = typeof e.height === "number" ? e.height : 0;
    if (w >= 1 && h >= 1) {
      setCanvasSize({ width: w, height: h });
    }
  }, []);

  const listRenderItem = useCallback((item, index, layout) => {
    const rowStyle = index % 2 === 0 ? styles.listRow : styles.listRowAlt;
    return (
      <View {...layout} {...rowStyle}>
        <View {...styles.listAccent} />
        <View {...styles.listIndex}>
          <Text {...styles.listIndexText}>{index + 1}</Text>
        </View>
        <Text {...styles.listText}>{item.label}</Text>
        <Text {...styles.listMeta}>virtual</Text>
      </View>
    );
  }, []);

  return (
    <View {...styles.root}>
      <ScrollView
        {...styles.scroll}
        overflow="scroll"
        scrollbar-width="thin"
        scrollbar-color={`${t.accent} ${t.panel}`}
      >
        <ScrollView.ContentView {...styles.scrollInner}>
          <View {...styles.chrome}>
            <View {...styles.chromeLeft}>
              <View {...styles.mark}>
                <Text {...styles.markText}>RJ</Text>
              </View>
              <View {...styles.chromeTitles}>
                <Text {...styles.chromeTitle}>Playground</Text>
                <Text {...styles.chromeSub}>
                  React-JUCE · layout, bridge, canvas, lists
                </Text>
              </View>
            </View>
            <View {...styles.chip}>
              <Text {...styles.chipText}>LAB</Text>
            </View>
          </View>

          <View {...styles.telemetry}>
            <Text {...styles.telemetryLabel}>BRIDGE</Text>
            <Text {...styles.telemetryValue}>{lastEvent}</Text>
          </View>

          <Panel
            label="VISUAL"
            title="Assets & scope"
            hint="Network image, bundled PNG, and timer-driven canvas in one panel."
          >
            <View {...styles.split}>
              <View {...styles.splitLeft}>
                <Text {...styles.splitCaption}>Remote URL</Text>
                <View {...styles.assetWell}>
                  <Image
                    source="https://raw.githubusercontent.com/bobicloudvision/react-juce/master/examples/GainPlugin/jsui/src/logo.png"
                    {...styles.assetImg}
                  />
                </View>
                <Text {...styles.splitCaption}>Bundled</Text>
                <View {...styles.assetWell}>
                  <Image source={logoSrc} {...styles.assetImg} />
                </View>
              </View>
              <View {...styles.splitRight}>
                <Text {...styles.splitCaption}>Canvas · 30 Hz tick</Text>
                <View {...styles.canvasShell}>
                  <Canvas
                    {...styles.canvasInner}
                    animate={true}
                    onMeasure={onCanvasMeasure}
                    onDraw={onDrawWave}
                  />
                </View>
              </View>
            </View>
          </Panel>

          <Panel
            label="INPUT"
            title="Controls & copy"
            hint="Button, Text styles, and TextInput."
          >
            <View {...styles.actionRow}>
              <Button
                {...styles.btnGhost}
                onClick={() => setClicks((c) => c + 1)}
              >
                <Text {...styles.btnGhostLabel}>Pulse · {clicks}</Text>
              </Button>
              <Button {...styles.btnSolid} onClick={() => setClicks(0)}>
                <Text {...styles.btnSolidLabel}>Reset</Text>
              </Button>
            </View>

            <View {...styles.typeRow}>
              <View {...styles.typeCol}>
                <Text {...styles.typeLabel}>Body</Text>
                <Text {...styles.typeBody}>
                  Paragraph rhythm for descriptions and parameter copy.
                </Text>
              </View>
              <View {...styles.typeCol}>
                <Text {...styles.typeLabel}>Emphasis</Text>
                <Text
                  {...styles.typeStrong}
                  fontStyle={Text.FontStyleFlags.bold}
                >
                  Section titles and key values.
                </Text>
              </View>
              <View {...styles.typeCol}>
                <Text {...styles.typeLabel}>Alt</Text>
                <Text
                  {...styles.typeItalic}
                  fontStyle={Text.FontStyleFlags.italic}
                >
                  Hints, quotes, secondary lines.
                </Text>
              </View>
            </View>

            <Text {...styles.fieldLabel}>TEXT INPUT</Text>
            <TextInput
              value={inputValue}
              onInput={(e) => setInputValue(e.value)}
              placeholder="Patch name"
              {...styles.input}
            />
          </Panel>

          <KnobGallery />

          <Panel
            label="DSP"
            title="Parameter strip"
            hint="APVTS → EventBridge; rotary, linear slider, bypass."
          >
            <View {...styles.strip}>
              <GainKnob />
              <View {...styles.stripDivider} />
              <DepthSlider />
            </View>
            <ParameterToggleButton
              paramId={ParamIds.DemoBypass}
              {...styles.bypass}
            >
              <Text {...styles.bypassLabel}>Bypass — unity gain (dry)</Text>
            </ParameterToggleButton>
          </Panel>

          <Panel
            label="DATA"
            title="Virtualized list"
            hint="ListView recycles rows; drag or scroll."
          >
            <ListView
              {...styles.listView}
              data={LIST_DATA}
              renderItem={listRenderItem}
              itemHeight={44}
              overflow="scroll"
              scroll-on-drag={true}
            />
          </Panel>

          <Text {...styles.footer}>React-JUCE Playground · reference UI</Text>
          <View {...styles.footerSpacer} />
        </ScrollView.ContentView>
      </ScrollView>
    </View>
  );
}

const styles = {
  root: {
    width: "100%",
    height: "100%",
    backgroundColor: t.bg,
  },
  scroll: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  scrollInner: {
    flexDirection: "column",
    padding: 22,
    paddingTop: 18,
    flexShrink: 0,
    maxWidth: 920,
    alignSelf: "center",
    width: "100%",
  },
  chrome: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: t.hairline,
  },
  chromeLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: t.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  markText: {
    color: t.void,
    fontSize: 13,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 0.5,
  },
  chromeTitles: {
    flexDirection: "column",
  },
  chromeTitle: {
    color: t.ink,
    fontSize: 22,
    fontStyle: Text.FontStyleFlags.bold,
    lineSpacing: 1.1,
  },
  chromeSub: {
    color: t.inkSoft,
    fontSize: 12,
    marginTop: 3,
    lineSpacing: 1.4,
  },
  chip: {
    borderWidth: 1,
    borderColor: t.accentMuted,
    borderRadius: 6,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: t.panelLift,
  },
  chipText: {
    color: t.accentGlow,
    fontSize: 10,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 2,
  },
  telemetry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.panelDeep,
    borderWidth: 1,
    borderColor: t.hairline,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  telemetryLabel: {
    color: t.accentMuted,
    fontSize: 10,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 1.6,
    marginRight: 12,
    minWidth: 52,
  },
  telemetryValue: {
    color: t.accentGlow,
    fontSize: 12,
    flex: 1,
    fontStyle: Text.FontStyleFlags.bold,
  },
  panel: {
    backgroundColor: t.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: t.rule,
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 14,
    paddingLeft: 16,
    paddingRight: 16,
  },
  panelKicker: {
    color: t.accent,
    fontSize: 9,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 2,
    marginRight: 14,
    marginTop: 4,
    minWidth: 56,
  },
  panelHeading: {
    flex: 1,
    flexDirection: "column",
  },
  panelTitle: {
    color: t.ink,
    fontSize: 16,
    fontStyle: Text.FontStyleFlags.bold,
    marginBottom: 4,
  },
  panelHint: {
    color: t.inkFaint,
    fontSize: 12,
    lineSpacing: 1.45,
  },
  panelHairline: {
    height: 1,
    backgroundColor: t.hairline,
    marginTop: 12,
    marginLeft: 16,
    marginRight: 16,
  },
  panelBody: {
    padding: 16,
    flexDirection: "column",
  },
  split: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
  },
  splitLeft: {
    flex: 1,
    flexDirection: "column",
    marginRight: 12,
  },
  splitRight: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 12,
  },
  splitCaption: {
    color: t.inkFaint,
    fontSize: 10,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 1,
    marginBottom: 6,
  },
  assetWell: {
    backgroundColor: t.panelDeep,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.hairline,
    padding: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44,
  },
  assetImg: {
    width: "100%",
    height: 28,
    placement: Image.PlacementFlags.centred,
  },
  canvasShell: {
    width: "100%",
    flexShrink: 0,
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: t.panelDeep,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.hairline,
  },
  canvasInner: {
    width: "100%",
    height: 88,
    flexShrink: 0,
  },
  actionRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  btnGhost: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.accentMuted,
    backgroundColor: t.panelLift,
    marginRight: 10,
  },
  btnGhostLabel: {
    color: t.accentGlow,
    fontSize: 13,
    fontStyle: Text.FontStyleFlags.bold,
  },
  btnSolid: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: t.accent,
  },
  btnSolidLabel: {
    color: t.void,
    fontSize: 13,
    fontStyle: Text.FontStyleFlags.bold,
  },
  typeRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  typeCol: {
    flex: 1,
    flexDirection: "column",
    marginRight: 10,
  },
  typeLabel: {
    color: t.inkFaint,
    fontSize: 9,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  typeBody: {
    color: t.inkSoft,
    fontSize: 12,
    lineSpacing: 1.45,
  },
  typeStrong: {
    color: t.ink,
    fontSize: 12,
    lineSpacing: 1.45,
  },
  typeItalic: {
    color: t.warn,
    fontSize: 12,
    lineSpacing: 1.45,
  },
  fieldLabel: {
    color: t.inkFaint,
    fontSize: 9,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    minHeight: 40,
    color: t.ink,
    fontSize: 13,
    backgroundColor: t.panelDeep,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.hairline,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 10,
    paddingBottom: 10,
    "outline-color": t.hairline,
    "focused-outline-color": t.hairline,
    "caret-color": t.accent,
    "highlight-color": t.inputSelection,
    "highlighted-text-color": t.ink,
    "placeholder-color": t.inkFaint,
  },
  knobGalleryHint: {
    color: t.inkSoft,
    fontSize: 11,
    marginBottom: 12,
  },
  knobGalleryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  knobTile: {
    alignItems: "center",
    marginRight: 16,
    marginBottom: 16,
    minWidth: 96,
  },
  knobTileLabel: {
    color: t.inkFaint,
    fontSize: 9,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 0.6,
    marginBottom: 6,
    textAlign: "center",
  },
  rotarySmall: {
    width: 92,
    height: 92,
  },
  strip: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  stripDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: t.hairline,
    marginLeft: 14,
    marginRight: 14,
    marginBottom: 8,
  },
  knobCol: {
    flexDirection: "column",
    alignItems: "center",
    minWidth: 100,
  },
  controlTag: {
    color: t.inkFaint,
    fontSize: 9,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  rotary: {
    width: 80,
    height: 80,
  },
  readout: {
    marginTop: 8,
  },
  readoutSmall: {},
  depthCol: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  depthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
    width: "100%",
  },
  horizontalSlider: {
    width: "100%",
    height: 32,
  },
  bypass: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.hairline,
    backgroundColor: t.panelLift,
  },
  bypassLabel: {
    color: t.ink,
    fontSize: 13,
    fontStyle: Text.FontStyleFlags.bold,
  },
  listView: {
    width: "100%",
    height: 260,
    minHeight: 260,
    flexShrink: 0,
    backgroundColor: t.panelDeep,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.hairline,
  },
  listRow: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
    borderBottomWidth: 1,
    borderColor: t.hairline,
    backgroundColor: t.panelDeep,
  },
  listRowAlt: {
    width: "100%",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
    borderBottomWidth: 1,
    borderColor: t.hairline,
    backgroundColor: t.surfaceListAlt,
  },
  listAccent: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: t.accentMuted,
    marginRight: 10,
  },
  listIndex: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  listIndexText: {
    color: t.inkFaint,
    fontSize: 10,
    fontStyle: Text.FontStyleFlags.bold,
  },
  listText: {
    color: t.inkSoft,
    fontSize: 13,
    flex: 1,
  },
  listMeta: {
    color: t.accentMuted,
    fontSize: 9,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 1,
  },
  footer: {
    color: t.inkFaint,
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
  },
  footerSpacer: {
    height: 28,
  },
};
