import { useRef, useState, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

interface FileDropProps {
  engineStatus: "idle" | "loading" | "ready" | "error";
  busy: boolean;
  onFile: (file: File) => void;
  onRetry?: () => void;
  error: string | null;
}

export function FileDrop({ engineStatus, busy, onFile, onRetry, error }: FileDropProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      onFile(f);
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition-all",
          dragOver
            ? "border-[#006c49] bg-[#006c49]/5 dark:border-[#4edea3] dark:bg-[#4edea3]/5"
            : "border-[#bbcabf]/40 bg-[#e5eeff]/30 dark:border-[#3c4a42] dark:bg-[#1e314a]/30 hover:border-[#bbcabf]/60"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={[
            ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
            ".odt", ".ods", ".odp", ".rtf", ".epub", ".csv", ".pdf",
          ].join(",")}
          className="hidden"
          onChange={handleInputChange}
        />
        {busy ? (
          <>
            <Loader2 className="size-7 animate-spin text-[#006c49] dark:text-[#4edea3]" />
            <div className="mt-4 text-base text-foreground">{t("any2md.converting")}</div>
          </>
        ) : engineStatus === "loading" ? (
          <>
            <Loader2 className="size-7 animate-spin text-[#006c49] dark:text-[#4edea3]" />
            <div className="mt-4 text-base text-foreground">{t("any2md.loading")}</div>
          </>
        ) : engineStatus === "error" ? (
          <>
            <div className="text-base text-foreground">{t("any2md.loadFailed")}</div>
            <button
              type="button"
              className="mt-3 rounded-lg border border-border px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onRetry?.(); }}
            >
              {t("any2md.retry")}
            </button>
          </>
        ) : (
          <>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
              <Upload className="size-7" />
            </div>
            <div className="mt-4 text-base text-foreground mb-1">{t("any2md.drop")}</div>
            <div className="text-sm text-muted-foreground">{t("any2md.dropHint")}</div>
          </>
        )}
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
