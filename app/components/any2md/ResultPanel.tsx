import { useState } from "react";
import { Download, Copy, Check, ArrowRight, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";

interface ResultPanelProps {
  fileName: string;
  format: string | undefined;
  chars: number;
  ms: number;
  markdown: string;
  onDownload: () => void;
  onCopy: () => void;
  onContinue: () => void;
  onReset: () => void;
}

export function ResultPanel({
  fileName,
  format,
  chars,
  ms,
  markdown,
  onDownload,
  onCopy,
  onContinue,
  onReset,
}: ResultPanelProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopy();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 dark:bg-[#15243b]">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{fileName}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {format && (
            <span className="mr-2 inline-flex items-center rounded-full bg-[#e5eeff] px-2 py-0.5 font-mono text-[11px] font-medium text-[#0058be] dark:bg-[#1e314a] dark:text-[#adc6ff]">
              {format}
            </span>
          )}
          {t("any2md.resultStats", { chars: chars.toLocaleString(), ms })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onDownload}>
          <Download className="size-3.5" />
          {t("any2md.download")}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? t("any2md.copied") : t("any2md.copy")}
        </Button>
        <Button variant="default" size="sm" className="gap-1.5" onClick={onContinue}>
          {t("any2md.continueToMd2html")}
          <ArrowRight className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={onReset} title={t("any2md.reset")}>
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
