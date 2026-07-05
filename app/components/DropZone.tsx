import { useRef, useState, useCallback } from "react";
import { Upload, FileText, Archive, X } from "lucide-react";

interface DropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  acceptZip?: boolean;
}

export function DropZone({ file, onFileSelect, acceptZip = true }: DropZoneProps) {
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
        alert("仅支持 .html 或 .zip 文件");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        alert("文件大小不能超过 5MB");
        return;
      }
      onFileSelect(f);
    },
    [onFileSelect]
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
      <div className="flex items-center gap-4 rounded-xl border border-[#d3e4fe] dark:border-[#3c4a42] bg-[#e5eeff]/40 dark:bg-[#1e314a]/40 p-5">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
          {file.name.endsWith(".zip") ? <Archive className="size-5" /> : <FileText className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate font-semibold text-sm text-foreground">{file.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{formatSize(file.size)}</div>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-[#e5eeff] dark:hover:bg-[#1e314a] hover:text-foreground transition-colors"
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
          ? "border-[#006c49] bg-[#006c49]/5 dark:border-[#4edea3] dark:bg-[#4edea3]/5"
          : "border-[#bbcabf]/40 bg-[#e5eeff]/30 dark:border-[#3c4a42] dark:bg-[#1e314a]/30 hover:border-[#bbcabf]/60"
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
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
        <Upload className="size-7" />
      </div>
      <div className="mt-4 text-base text-foreground mb-1">
        拖拽 <strong>.html</strong> 或 <strong>.zip</strong> 文件到此处
      </div>
      <div className="text-sm text-muted-foreground">或点击选择文件</div>
    </div>
  );
}
