import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { PhotoDropzone } from "./PhotoDropzone";
import { PreviewCanvas } from "./PreviewCanvas";
import { SIZE_PRESETS, currentSize, headRange, headTarget } from "~/lib/idphoto/specs";
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

  // TASK7: runAI 在此追加

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

        {/* TASK6: 规格选择 SpecPicker（含自定义宽高） */}
        {/* TASK6: 底色选择 BgColorPicker */}

        <section className="rounded-2xl border border-border bg-card p-4">
          <StepTitle n={4}>{t("idphoto.step.ai")}</StepTitle>
          <Button
            className="w-full"
            disabled={!srcImg || aiBusy}
            onClick={runCropOnly}
            variant="secondary"
          >
            {t("idphoto.btn.cropOnly")}
          </Button>
          {/* TASK7: 「一键 AI 生成」按钮 + ai.hint 提示替换本节内容 */}
        </section>

        {/* TASK7: 合规检测 CompliancePanel */}
        {/* TASK7: 微调 AdjustPanel */}
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
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("idphoto.ruler.show")}</p>
      </div>
    </div>
  );
}
