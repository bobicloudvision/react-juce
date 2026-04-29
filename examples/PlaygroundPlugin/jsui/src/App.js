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
import { ParamIds, useParameter } from "./ParameterValueContext";

const t = {
  bg: "#0a0d12",
  bgElevated: "linear-gradient(180deg, #0e131a 0%, #0a0d12 55%, #080b0f 100%)",
  surface: "#121820",
  surfaceHover: "#181f2a",
  border: "#252f3f",
  borderSubtle: "#1c2430",
  text: "#f0f4f8",
  textSecondary: "#9aa8b8",
  textMuted: "#5c6d80",
  accent: "#3db8e8",
  accentSoft: "#2a8eb8",
  accentDim: "rgba(61, 184, 232, 0.15)",
  success: "#34d399",
  warning: "#fbbf24",
};

const LIST_DATA = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  label: `Item ${String(i + 1).padStart(3, "0")}`,
}));

const logoSrc = require("./logo.png");

function SectionCard({ badge, title, description, children }) {
  return (
    <View {...styles.card}>
      <View {...styles.cardTop}>
        {badge ? (
          <Text {...styles.badge}>{badge}</Text>
        ) : (
          <View {...styles.badgePlaceholder} />
        )}
        <View {...styles.cardHeading}>
          <Text {...styles.cardTitle}>{title}</Text>
          {description ? (
            <Text {...styles.cardDescription}>{description}</Text>
          ) : null}
        </View>
      </View>
      <View {...styles.cardRule} />
      <View {...styles.cardBody}>{children}</View>
    </View>
  );
}

function GainKnob() {
  const { stringValue, currentValue } = useParameter(ParamIds.DemoGain);
  const drawRotary = useMemo(
    () => Slider.drawRotary(t.border, t.accent),
    []
  );
  return (
    <View {...styles.knobRow}>
      <ParameterSlider
        paramId={ParamIds.DemoGain}
        value={currentValue}
        onDraw={drawRotary}
        mapDragGestureToValue={Slider.rotaryGestureMap}
        {...styles.rotary}
      />
      <View {...styles.knobMeta}>
        <Text {...styles.controlLabel}>Gain</Text>
        <Label value={stringValue} {...styles.controlValue} />
      </View>
    </View>
  );
}

function DepthSlider() {
  const { stringValue, currentValue } = useParameter(ParamIds.DemoDepth);
  const drawH = useMemo(
    () => Slider.drawLinearHorizontal(t.border, t.accent),
    []
  );
  return (
    <View {...styles.depthBlock}>
      <View {...styles.depthLabels}>
        <Text {...styles.controlLabel}>Depth</Text>
        <Label value={stringValue} {...styles.controlValue} />
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
  const [inputValue, setInputValue] = useState("Try editing this field");
  const [clicks, setClicks] = useState(0);
  const [tickPhase, setTickPhase] = useState(0);
  const [lastEvent, setLastEvent] = useState("—");

  useEffect(() => {
    const onTick = (phase) => setTickPhase(phase);
    const onParam = (index, id, def, val, str) => {
      setLastEvent(`${id} → ${str}`);
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
      const w = 640;
      const h = 52;
      const r = 8;
      ctx.fillStyle = t.surfaceHover;
      ctx.fillRoundedRect(0, 0, w, h, r);
      ctx.strokeStyle = t.border;
      ctx.lineWidth = 1;
      ctx.strokeRoundedRect(0.5, 0.5, w - 1, h - 1, r);

      const mid = h * 0.5;
      const amp = h * 0.22;
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const tNorm = (x / w) * Math.PI * 2 + tickPhase;
        const y = mid + Math.sin(tNorm) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = t.borderSubtle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(12, mid);
      ctx.lineTo(w - 12, mid);
      ctx.stroke();
    },
    [tickPhase]
  );

  const listRenderItem = useCallback((item, index, layout) => {
    const rowStyle = index % 2 === 0 ? styles.listRow : styles.listRowAlt;
    return (
      <View {...layout} {...rowStyle}>
        <View {...styles.listIndex}>
          <Text {...styles.listIndexText}>{index + 1}</Text>
        </View>
        <Text {...styles.listText}>{item.label}</Text>
        <Text {...styles.listHint}>virtualized</Text>
      </View>
    );
  }, []);

  return (
    <View {...styles.root}>
      <ScrollView
        {...styles.scroll}
        overflow="scroll"
        scrollbar-width="thin"
        scrollbar-color={`${t.accent} ${t.surface}`}
      >
        <ScrollView.ContentView {...styles.scrollInner}>
          <View {...styles.hero}>
            <Text {...styles.heroEyebrow}>React-JUCE</Text>
            <Text {...styles.heroTitle}>Playground</Text>
            <Text {...styles.heroSubtitle}>
              Production-style reference for layout, widgets, and the native
              bridge — parameters, events, and canvas.
            </Text>
            <View {...styles.heroRule} />
          </View>

          <View {...styles.statusPill}>
            <View {...styles.statusDot} />
            <Text {...styles.statusText}>
              Last event: <Text {...styles.statusEm}>{lastEvent}</Text>
            </Text>
          </View>

          <SectionCard
            badge="MEDIA"
            title="Image"
            description="Remote fetch and webpack-bundled raster assets."
          >
            <View {...styles.twoCol}>
              <View {...styles.mediaCol}>
                <View {...styles.mediaFrame}>
                  <Image
                    source="https://raw.githubusercontent.com/bobicloudvision/react-juce/master/examples/GainPlugin/jsui/src/logo.png"
                    {...styles.imageInFrame}
                  />
                </View>
                <Text {...styles.caption}>Remote URL</Text>
              </View>
              <View {...styles.mediaCol}>
                <View {...styles.mediaFrame}>
                  <Image source={logoSrc} {...styles.imageInFrame} />
                </View>
                <Text {...styles.caption}>Bundled (require)</Text>
              </View>
            </View>
          </SectionCard>

          <SectionCard
            badge="CANVAS"
            title="Animated canvas"
            description="Waveform driven by the native playgroundTick timer (30 Hz)."
          >
            <Canvas {...styles.canvas} animate={true} onDraw={onDrawWave} />
          </SectionCard>

          <SectionCard
            badge="INPUT"
            title="Interaction"
            description="Button state, typography, and single-line text entry."
          >
            <Button
              {...styles.btnPrimary}
              onClick={() => setClicks((c) => c + 1)}
            >
              <Text {...styles.btnPrimaryLabel}>
                Primary action · {clicks} tap{clicks === 1 ? "" : "s"}
              </Text>
            </Button>

            <View {...styles.typeSamples}>
              <Text {...styles.body}>
                Body — readable default copy for descriptions and labels.
              </Text>
              <Text {...styles.bold} fontStyle={Text.FontStyleFlags.bold}>
                Emphasis — bold for headings inside copy.
              </Text>
              <Text {...styles.italic} fontStyle={Text.FontStyleFlags.italic}>
                Italic — secondary emphasis or citations.
              </Text>
            </View>

            <Text {...styles.fieldLabel}>Text field</Text>
            <TextInput
              value={inputValue}
              onInput={(e) => setInputValue(e.value)}
              placeholder="Placeholder text"
              {...styles.input}
            />
          </SectionCard>

          <SectionCard
            badge="PARAMETERS"
            title="DSP controls"
            description="APVTS-linked rotary, linear slider, and bypass toggle."
          >
            <View {...styles.paramGrid}>
              <GainKnob />
              <DepthSlider />
            </View>
            <ParameterToggleButton
              paramId={ParamIds.DemoBypass}
              {...styles.toggle}
            >
              <Text {...styles.toggleText}>Bypass — dry signal (no gain)</Text>
            </ParameterToggleButton>
          </SectionCard>

          <SectionCard
            badge="LIST"
            title="Virtualized list"
            description="ListView inside ScrollView; only visible rows are mounted."
          >
            <ListView
              {...styles.listView}
              data={LIST_DATA}
              renderItem={listRenderItem}
              itemHeight={40}
              overflow="hidden"
              scroll-on-drag={true}
            />
          </SectionCard>

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
    backgroundColor: t.bgElevated,
  },
  scroll: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  scrollInner: {
    flexDirection: "column",
    padding: 24,
    paddingTop: 20,
    flexShrink: 0,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  hero: {
    marginBottom: 20,
  },
  heroEyebrow: {
    color: t.accent,
    fontSize: 11,
    letterSpacing: 2.2,
    fontStyle: Text.FontStyleFlags.bold,
    marginBottom: 6,
  },
  heroTitle: {
    color: t.text,
    fontSize: 28,
    fontStyle: Text.FontStyleFlags.bold,
    marginBottom: 8,
    lineSpacing: 1.15,
  },
  heroSubtitle: {
    color: t.textSecondary,
    fontSize: 14,
    lineSpacing: 1.55,
    maxWidth: 560,
  },
  heroRule: {
    marginTop: 18,
    height: 1,
    width: "100%",
    backgroundColor: t.border,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 14,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 22,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.success,
    marginRight: 10,
  },
  statusText: {
    color: t.textMuted,
    fontSize: 12,
    flex: 1,
  },
  statusEm: {
    color: t.textSecondary,
    fontSize: 12,
    fontStyle: Text.FontStyleFlags.bold,
  },
  card: {
    backgroundColor: t.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
    marginBottom: 18,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 16,
    paddingLeft: 18,
    paddingRight: 18,
  },
  badge: {
    color: t.accent,
    fontSize: 10,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 1.4,
    marginRight: 12,
    marginTop: 3,
    minWidth: 72,
  },
  badgePlaceholder: {
    minWidth: 72,
    marginRight: 12,
  },
  cardHeading: {
    flex: 1,
    flexDirection: "column",
  },
  cardTitle: {
    color: t.text,
    fontSize: 17,
    fontStyle: Text.FontStyleFlags.bold,
    marginBottom: 4,
    lineSpacing: 1.2,
  },
  cardDescription: {
    color: t.textMuted,
    fontSize: 13,
    lineSpacing: 1.45,
  },
  cardRule: {
    height: 1,
    backgroundColor: t.borderSubtle,
    marginTop: 14,
    marginLeft: 18,
    marginRight: 18,
  },
  cardBody: {
    padding: 18,
    paddingTop: 16,
    flexDirection: "column",
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  mediaCol: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    marginHorizontal: 6,
  },
  mediaFrame: {
    backgroundColor: t.surfaceHover,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
    padding: 14,
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  imageInFrame: {
    width: "100%",
    height: 32,
    placement: Image.PlacementFlags.centred,
  },
  caption: {
    color: t.textMuted,
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  canvas: {
    width: "100%",
    height: 56,
  },
  btnPrimary: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: t.accent,
    marginBottom: 18,
  },
  btnPrimaryLabel: {
    color: "#0a0d12",
    fontSize: 14,
    fontStyle: Text.FontStyleFlags.bold,
  },
  typeSamples: {
    marginBottom: 16,
  },
  body: {
    color: t.textSecondary,
    fontSize: 14,
    lineSpacing: 1.5,
    marginBottom: 8,
  },
  bold: {
    color: t.text,
    fontSize: 14,
    lineSpacing: 1.5,
    marginBottom: 8,
  },
  italic: {
    color: t.warning,
    fontSize: 14,
    lineSpacing: 1.5,
    marginBottom: 8,
  },
  fieldLabel: {
    color: t.textMuted,
    fontSize: 11,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    minHeight: 40,
    color: t.text,
    fontSize: 14,
    backgroundColor: t.surfaceHover,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
    paddingLeft: 12,
    paddingRight: 12,
    "outline-color": t.accent,
    "placeholder-color": t.textMuted,
  },
  paramGrid: {
    flexDirection: "column",
    marginBottom: 14,
  },
  knobRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  knobMeta: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  controlLabel: {
    color: t.textMuted,
    fontSize: 11,
    fontStyle: Text.FontStyleFlags.bold,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  controlValue: {
    color: t.text,
  },
  rotary: {
    width: 76,
    height: 76,
    marginRight: 18,
  },
  depthBlock: {
    flexDirection: "column",
    marginBottom: 4,
  },
  depthLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
    width: "100%",
  },
  horizontalSlider: {
    width: "100%",
    height: 30,
  },
  toggle: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.surfaceHover,
    marginTop: 4,
  },
  toggleText: {
    color: t.text,
    fontSize: 14,
  },
  listView: {
    width: "100%",
    height: 220,
    backgroundColor: t.surfaceHover,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
  },
  listRow: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderColor: t.borderSubtle,
    backgroundColor: t.surfaceHover,
  },
  listRowAlt: {
    width: "100%",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderColor: t.borderSubtle,
    backgroundColor: "#151c27",
  },
  listIndex: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  listIndexText: {
    color: t.textMuted,
    fontSize: 11,
    fontStyle: Text.FontStyleFlags.bold,
  },
  listText: {
    color: t.text,
    fontSize: 13,
    flex: 1,
  },
  listHint: {
    color: t.textMuted,
    fontSize: 10,
  },
  footerSpacer: {
    height: 32,
  },
};
