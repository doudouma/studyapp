import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { PAPERS, mm2px, type EffectiveSize } from "~/lib/idphoto/specs";
import { buildPrintLayout, drawPrintLayout, downloadBlob, type PrintLayout } from "~/lib/idphoto/exportImage";

interface PrintLayoutPanelProps {
  /** 结果画布引用（排版数据源） */
  sourceRef: React.RefObject<HTMLCanvasElement | null>;
  size: EffectiveSize;
  resultReady: boolean;
}

type Orient = "portrait" | "landscape";

export function PrintLayoutPanel({ sourceRef, size, resultReady }: PrintLayoutPanelProps) {
  const { t } = useTranslation();
  const printRef = useRef<HTMLCanvasElement>(null);
  const [paper, setPaper] = useState("A4");
  const [paperOrient, setPaperOrient] = useState<Orient>("portrait");
  const [photoOrient, setPhotoOrient] = useState<Orient>("portrait");
  const [info, setInfo] = useState<{ kind: "initial" | "error" | "summary"; text: string }>({ kind: "initial", text: "" });
  const [layout, setLayout] = useState<PrintLayout | null>(null);

  const runLayout = () => {
    if (!resultReady) {
      setInfo({ kind: "error", text: t("idphoto.print.needGenerate") });
      return;
    }
    const pw = PAPERS[paper] ?? PAPERS.A4;
    const [pwmm, phmm]: [number, number] = paperOrient === "landscape" ? [pw.hmm, pw.wmm] : [pw.wmm, pw.hmm];
    const [fwmm, fhmm]: [number, number] = photoOrient === "landscape" ? [size.hmm, size.wmm] : [size.wmm, size.hmm];
    const l = buildPrintLayout(pwmm, phmm, fwmm, fhmm);
    if (!l) {
      setInfo({ kind: "error", text: t("idphoto.print.fitError") });
      setLayout(null);
      return;
    }
    const canvas = printRef.current;
    const src = sourceRef.current;
    if (!canvas || !src) {
      setInfo({ kind: "error", text: t("idphoto.print.needGenerate") });
      return;
    }
    drawPrintLayout(canvas, src, l, photoOrient === "landscape");
    setLayout(l);
    setInfo({
      kind: "summary",
      text: t("idphoto.print.summary", {
        paper: `${t(`idphoto.paper.${paper}`)}·${t(`idphoto.orient.${paperOrient}`)}`,
        fw: fwmm.toFixed(1),
        fh: fhmm.toFixed(1),
        total: l.total,
        cols: l.cols,
        rows: l.rows,
        w: mm2px(pwmm),
        h: mm2px(phmm),
      }),
    });
  };

  const runExport = () => {
    const canvas = printRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (b) => b && downloadBlob(b, `${t("idphoto.file.print")}_${paper}_${paperOrient === "landscape" ? "H" : "V"}.jpg`),
      "image/jpeg",
      0.95,
    );
  };

  const selectCls = "rounded-lg border border-input bg-background px-2 py-1.5 text-sm";

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex flex-wrap items-end justify-center gap-2">
        <Field label={t("idphoto.paper.label")}>
          <select value={paper} onChange={(e) => setPaper(e.target.value)} className={selectCls}>
            {Object.keys(PAPERS).map((k) => (
              <option key={k} value={k}>
                {t(`idphoto.paper.${k}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("idphoto.print.paperOrient")}>
          <select value={paperOrient} onChange={(e) => setPaperOrient(e.target.value as Orient)} className={selectCls}>
            <option value="portrait">{t("idphoto.orient.portrait")}</option>
            <option value="landscape">{t("idphoto.orient.landscape")}</option>
          </select>
        </Field>
        <Field label={t("idphoto.print.photoOrient")}>
          <select value={photoOrient} onChange={(e) => setPhotoOrient(e.target.value as Orient)} className={selectCls}>
            <option value="portrait">{t("idphoto.orient.portrait")}</option>
            <option value="landscape">{t("idphoto.orient.landscape")}</option>
          </select>
        </Field>
        <Button onClick={runLayout}>{t("idphoto.print.btnLayout")}</Button>
        <Button variant="secondary" disabled={!layout} onClick={runExport}>
          {t("idphoto.print.btnExportPrint")}
        </Button>
      </div>

      <div
        data-testid="idphoto-print-info"
        className={
          "mb-3 w-full rounded-lg px-3 py-2 text-center text-xs leading-relaxed " +
          (info.kind === "error"
            ? "bg-red-500/10 text-red-600 dark:text-red-400"
            : info.kind === "summary"
              ? "bg-muted text-foreground"
              : "bg-muted/60 text-muted-foreground")
        }
      >
        {info.text || t("idphoto.print.initial")}
      </div>

      <canvas ref={printRef} width={600} height={400} className="h-auto max-h-[70vh] max-w-full rounded-lg border border-border" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
