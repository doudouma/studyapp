import { useRef, useState, useCallback } from "react";
import { Upload, FileText, Archive, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MAX_CONTENT_SIZE } from "@shared/types/pages";

interface DropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  acceptZip?: boolean;
  /** 允许的最大字节数，默认 5MB（匿名上限）；登录用户可传 MAX_USER_CONTENT_SIZE */
  maxBytes?: number;
}

export function DropZone({ file, onFileSelect, acceptZip = true, maxBytes = MAX_CONTENT_SIZE }: DropZoneProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isValidFile = (f: File) => {
    if (!acceptZip && f.name.endsWith(".zip")) return false;
    return (
      f.name.endsWith(".html") ||
      f.name.endsWith(".htm") ||
      f.name.endsWith(".zip") ||
      f.type === "text/html" ||
      f.type === "application/zip"
    );
  };

  const handleFile = useCallback(
    (f: File) => {
      if (!isValidFile(f)) {
        alert(t("components.dropzone.invalidType"));
        return;
      }
      if (f.size > maxBytes) {
        alert(t("components.dropzone.invalidSize", { max: Math.round(maxBytes / (1024 * 1024)) }));
        return;
      }
      onFileSelect(f);
    },
    [onFileSelect, t, maxBytes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-[#e3e3e3] dark:border-[#2a2d32] bg-[#f2f2f2]/40 dark:bg-[#15171a]/40 p-5">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[#111214]/10 text-[#111214] dark:bg-[#d8ff00]/10 dark:text-[#d8ff00]">
          {file.name.endsWith(".zip") ? <Archive className="size-5" /> : <FileText className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate font-semibold text-sm text-foreground">{file.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{formatSize(file.size)}</div>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-[#f2f2f2] dark:hover:bg-[#15171a] hover:text-foreground transition-colors"
          onClick={() => onFileSelect(null)}
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition-all ${
        dragOver
          ? "border-[#111214] bg-[#111214]/5 dark:border-[#d8ff00] dark:bg-[#d8ff00]/5"
          : "border-[#e3e3e3]/40 bg-[#f2f2f2]/30 dark:border-[#2a2d32] dark:bg-[#15171a]/30 hover:border-[#e3e3e3]/60"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptZip ? ".html,.htm,.zip" : ".html,.htm"}
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#111214]/10 text-[#111214] dark:bg-[#d8ff00]/10 dark:text-[#d8ff00]">
        <Upload className="size-7" />
      </div>
      <div className="mt-4 text-base text-foreground mb-1">
        {t("components.dropzone.prompt")}
      </div>
      <div className="text-sm text-muted-foreground">{t("components.dropzone.subPrompt")}</div>
    </div>
  );
}
