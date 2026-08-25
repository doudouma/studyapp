import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PhotoDropzone } from "./PhotoDropzone";
import { PreviewCanvas } from "./PreviewCanvas";
import { SpecPicker } from "./SpecPicker";
import { BgColorPicker } from "./BgColorPicker";
import { GeneratePanel } from "./GeneratePanel";
import { CompliancePanel } from "./CompliancePanel";
import { AdjustPanel } from "./AdjustPanel";
import { DIGITAL, SIZE_PRESETS, currentSize, headRange, headTarget } from "~/lib/idphoto/specs";
import { complianceRatio, computeBase, drawRuler, renderCompose } from "~/lib/idphoto/compose";
import { detectFace } from "~/lib/idphoto/face";
import { segmentImage, type SegEvent } from "~/lib/idphoto/segmentation";

const ADJUST_DEFAULT = { zoom: 100, x: 0, y: 0 };

export function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </span>
      {children}
    </h2>
  );
}

export function IdPhotoWorkbench() {
  const { t } = useTranslation();
  const resultRef = useRef<HTMLCanvasElement>(null);
  const rulerRef = useRef<HTMLCanvasElement>(null);

  // ===== 状态 =====
  const [srcImg, setSrcImg] = useState<HTMLImageElement | null>(null);
  const [cutImg, setCutImg] = useState<HTMLImageElement | null>(null);
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [personTop, setPersonTop] = useState<number | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [presetIdx, setPresetIdx] = useState(0);
  const [regionFilter, setRegionFilter] = useState("all");
  const [customW, setCustomW] = useState(SIZE_PRESETS[0].w);
  const [customH, setCustomH] = useState(SIZE_PRESETS[0].h);
  const [bgColor, setBgColor] = useState(SIZE_PRESETS[0].bgDefault ?? "#FFFFFF");
  const [keepBg, setKeepBg] = useState(false);
  const [digitalKey, setDigitalKey] = useState("");
  const [sizeLimitKB, setSizeLimitKB] = useState(0);
  const [adjust, setAdjust] = useState(ADJUST_DEFAULT);
  const [resultReady, setResultReady] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [segEvent, setSegEvent] = useState<SegEvent | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string }>({ kind: "ok", text: "" });

  const setStatusOk = useCallback((text: string) => setStatus({ kind: "ok", text }), []);
  const setStatusErr = useCallback((text: string) => setStatus({ kind: "err", text }), []);

  // ===== 派生值 =====
  const preset = SIZE_PRESETS[presetIdx] ?? SIZE_PRESETS[0];
  const effectiveSize = useMemo(() => currentSize(presetIdx, customW, customH), [presetIdx, customW, customH]);
  const [loRatio, hiRatio] = useMemo(() => headRange(preset), [preset]);
  const target = useMemo(() => headTarget(preset), [preset]);

  const { base, headSrc } = useMemo(() => {
    if (!srcImg || !resultReady) return { base: null, headSrc: null };
    return computeBase({
      srcW: srcImg.naturalWidth,
      srcH: srcImg.naturalHeight,
      W: effectiveSize.w,
      H: effectiveSize.h,
      faceBox,
      personTop,
      target,
    });
  }, [srcImg, resultReady, effectiveSize.w, effectiveSize.h, faceBox, personTop, target]);

  const headRatioPct = useMemo(() => {
    if (!headSrc || !base) return null;
    return Math.round(complianceRatio({ headSrc, base, zoom: adjust.zoom, H: effectiveSize.h }) * 100);
  }, [headSrc, base, adjust.zoom, effectiveSize.h]);

  // ===== 绘制（结果层 + 标尺层）=====
  useEffect(() => {
    const canvas = resultRef.current;
    const ruler = rulerRef.current;
    if (!canvas || !ruler) return;
    const s = effectiveSize;
    canvas.width = s.w;
    canvas.height = s.h;
    ruler.width = s.w;
    ruler.height = s.h;
    const ctx = canvas.getContext("2d");
    const rctx = ruler.getContext("2d");
    if (!ctx || !rctx) return;

    ctx.fillStyle = keepBg ? "#FFFFFF" : bgColor;
    ctx.fillRect(0, 0, s.w, s.h);
    rctx.clearRect(0, 0, s.w, s.h);

    if (srcImg && base && resultReady) {
      renderCompose(ctx, {
        img: cutImg ?? srcImg,
        srcW: srcImg.naturalWidth,
        srcH: srcImg.naturalHeight,
        W: s.w,
        H: s.h,
        base,
        zoom: adjust.zoom,
        adjX: adjust.x,
        adjY: adjust.y,
      });
      if (showRuler && headSrc && headRatioPct != null) {
        drawRuler(rctx, {
          headSrc,
          base,
          srcW: srcImg.naturalWidth,
          srcH: srcImg.naturalHeight,
          zoom: adjust.zoom,
          adjX: adjust.x,
          adjY: adjust.y,
          W: s.w,
          H: s.h,
          lo: loRatio,
          hi: hiRatio,
          label: t("idphoto.headRatio", { pct: headRatioPct }),
        });
      }
    }
  }, [
    effectiveSize, base, headSrc, srcImg, cutImg, bgColor, keepBg, adjust,
    resultReady, showRuler, loRatio, hiRatio, headRatioPct, t,
  ]);

  // ===== 行为 =====
  const loadPhotoFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setStatusErr(t("idphoto.drop.errType"));
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        setSrcImg(img);
        setCutImg(null);
        setFaceBox(null);
        setPersonTop(null);
        setResultReady(false);
        setAdjust(ADJUST_DEFAULT);
        setFileLabel(`${file.name}（${img.naturalWidth}×${img.naturalHeight}px）`);
        setStatusOk(t("idphoto.status.loaded", { name: file.name }));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setStatusErr(t("idphoto.drop.errLoad"));
      };
      img.src = url;
    },
    [t, setStatusOk, setStatusErr],
  );

  const resetAdjust = useCallback(() => setAdjust(ADJUST_DEFAULT), []);

  const runCropOnly = useCallback(() => {
    if (!srcImg) {
      setStatusErr(t("idphoto.status.noPhoto"));
      return;
    }
    setCutImg(null);
    setFaceBox(null);
    setPersonTop(null);
    resetAdjust();
    setResultReady(true);
    setStatusOk(t("idphoto.status.cropOnlyDone"));
  }, [srcImg, t, resetAdjust, setStatusOk, setStatusErr]);

  /** 选中规格：重置底色/保留背景，并按规格同步数字提交预设 */
  const selectSpec = useCallback(
    (i: number) => {
      const p = SIZE_PRESETS[i];
      setPresetIdx(i);
      setKeepBg(false);
      if (p.key !== "custom") {
        setCustomW(p.w);
        setCustomH(p.h);
      }
      if (p.digitalKey) {
        setDigitalKey(p.digitalKey);
        setSizeLimitKB(DIGITAL[p.digitalKey].maxKB);
      } else {
        setDigitalKey("");
        setSizeLimitKB(0);
      }
      setBgColor(p.bgDefault ?? "#FFFFFF");
    },
    [],
  );

  /** 换底色：立即生效；未抠图时提示需先 AI 生成 */
  const handleBgColor = useCallback(
    (hex: string) => {
      setBgColor(hex);
      setKeepBg(false);
      if (srcImg && !cutImg && !keepBg && !aiBusy) {
        setStatusOk(t("idphoto.status.needAiFirst"));
      }
    },
    [srcImg, cutImg, keepBg, aiBusy, t, setStatusOk],
  );

  const runAI = useCallback(async () => {
    if (!srcImg || aiBusy) return;
    setAiBusy(true);
    try {
      setStatusOk(t("idphoto.status.faceModel"));
      const fb = await detectFace(srcImg);
      setFaceBox(fb);
      if (!keepBg) {
        const seg = await segmentImage(srcImg, setSegEvent);
        setCutImg(seg.cut);
        setPersonTop(seg.personTopSrc);
      } else {
        setCutImg(null);
        setPersonTop(null);
      }
      resetAdjust();
      setResultReady(true);
      setStatusOk(t("idphoto.status.done"));
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      const isNet = /fetch|network|网络/i.test(msg);
      const parts = [t("idphoto.ai.failPrefix") + msg];
      if (isNet) parts.push(t("idphoto.ai.netHint"));
      parts.push(t("idphoto.ai.offlineHint"));
      setStatusErr(parts.join("\n"));
    } finally {
      setAiBusy(false);
    }
  }, [srcImg, aiBusy, keepBg, t, resetAdjust, setStatusOk, setStatusErr]);

  // segEvent → 状态文案（Task 7 接入 AI 按钮后生效）
  useEffect(() => {
    if (!segEvent) return;
    switch (segEvent.kind) {
      case "runtimeLoading":
        setStatusOk(t("idphoto.status.runtimeLoading"));
        break;
      case "modelDownloading":
        setStatusOk(t("idphoto.status.downloading", { pct: segEvent.pct }));
        break;
      case "modelCompiling":
        setStatusOk(t("idphoto.status.compiling"));
        break;
      case "inferring":
        setStatusOk(t("idphoto.status.inferring"));
        break;
    }
  }, [segEvent, t, setStatusOk]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* 左：控制面板 */}
      <div className="space-y-4 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-1">
        <section className="rounded-2xl border border-border bg-card p-4">
          <StepTitle n={1}>{t("idphoto.step.open")}</StepTitle>
          <PhotoDropzone selectedLabel={fileLabel} onFile={loadPhotoFile} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <StepTitle n={2}>{t("idphoto.step.spec")}</StepTitle>
          <SpecPicker
            presetIdx={presetIdx}
            regionFilter={regionFilter}
            customW={customW}
            customH={customH}
            onRegion={(v) => setRegionFilter(v)}
            onSelect={selectSpec}
            onCustomSize={(w, h) => {
              setCustomW(w);
              setCustomH(h);
            }}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <StepTitle n={3}>{t("idphoto.step.bg")}</StepTitle>
          <BgColorPicker
            preset={preset}
            bgColor={bgColor}
            keepBg={keepBg}
            onColor={handleBgColor}
            onKeepBg={(v) => setKeepBg(v)}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <StepTitle n={4}>{t("idphoto.step.ai")}</StepTitle>
          <GeneratePanel
            disabled={!srcImg}
            busy={aiBusy}
            keepBg={keepBg}
            onAI={runAI}
            onCropOnly={runCropOnly}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <StepTitle n={5}>{t("idphoto.step.compliance")}</StepTitle>
          <CompliancePanel
            ready={resultReady && headRatioPct != null}
            ratioPct={headRatioPct}
            rangePct={[Math.round(loRatio * 100), Math.round(hiRatio * 100)]}
            showRuler={showRuler}
            onToggleRuler={setShowRuler}
          />
        </section>
        <section className="rounded-2xl border border-border bg-card p-4">
          <StepTitle n={6}>{t("idphoto.step.adjust")}</StepTitle>
          <AdjustPanel adjust={adjust} onChange={setAdjust} onReset={resetAdjust} />
        </section>
        {/* TASK8: 导出 ExportPanel */}

        <div
          data-testid="idphoto-status"
          className={
            "whitespace-pre-wrap rounded-lg px-3 py-2.5 text-xs leading-relaxed " +
            (status.kind === "err"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground")
          }
        >
          {status.text || t("idphoto.status.noPhoto")}
        </div>
      </div>

      {/* 右：预览区 */}
      <div className="min-w-0">
        {/* TASK9: Tabs 包裹（photo/print），print 内容为 PrintLayoutPanel */}
        <PreviewCanvas resultRef={resultRef} rulerRef={rulerRef} W={effectiveSize.w} H={effectiveSize.h} />
      </div>
    </div>
  );
}
