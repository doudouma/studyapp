import { useRef, useState, useCallback } from "react";
import { Upload, FileText, Archive, X } from "lucide-react";

interface DropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export function DropZone({ file, onFileSelect }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isValidFile = (f: File) => {
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
      <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {file.name.endsWith(".zip") ? <Archive className="size-5" /> : <FileText className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate font-semibold text-sm text-foreground">{file.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{formatSize(file.size)}</div>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => onFileSelect(null)}
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 bg-muted/20 hover:border-muted-foreground/40"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,.zip"
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Upload className="size-6" />
      </div>
      <div className="text-sm text-foreground mb-1">
        拖拽 <strong>.html</strong> 或 <strong>.zip</strong> 文件到此处
      </div>
      <div className="text-xs text-muted-foreground">或点击选择文件</div>
    </div>
  );
}
