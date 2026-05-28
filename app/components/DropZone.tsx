import { useRef, useState, useCallback } from "react";

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
      <div style={styles.fileInfo}>
        <div style={styles.fileIcon}>
          {file.name.endsWith(".zip") ? "📦" : "📄"}
        </div>
        <div style={styles.fileDetails}>
          <div style={styles.fileName}>{file.name}</div>
          <div style={styles.fileSize}>{formatSize(file.size)}</div>
        </div>
        <button style={styles.removeBtn} onClick={() => onFileSelect(null)}>
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      style={dragOver ? { ...styles.dropzone, ...styles.dropzoneActive } : styles.dropzone}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,.zip"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />
      <div style={styles.dropIcon}>📁</div>
      <div style={styles.dropText}>
        拖拽 <strong>.html</strong> 或 <strong>.zip</strong> 文件到此处
      </div>
      <div style={styles.dropSubtext}>或点击选择文件</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dropzone: {
    border: "2px dashed #d0d0d0",
    borderRadius: "12px",
    padding: "3rem 2rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "#fafafa",
  },
  dropzoneActive: {
    borderColor: "#667eea",
    background: "#f0f0ff",
  },
  dropIcon: {
    fontSize: "2.5rem",
    marginBottom: "0.75rem",
  },
  dropText: {
    fontSize: "1rem",
    color: "#333",
    marginBottom: "0.25rem",
  },
  dropSubtext: {
    fontSize: "0.85rem",
    color: "#999",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    background: "#fafafa",
  },
  fileIcon: {
    fontSize: "2rem",
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#333",
  },
  fileSize: {
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "2px",
  },
  removeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    color: "#999",
    cursor: "pointer",
    padding: "0.5rem",
  },
};
