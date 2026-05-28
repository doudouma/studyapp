import { useState } from "react";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type TabMode = "paste" | "drop";

interface UploadResult {
  url: string;
  expiresAt: string;
}

function HomePage() {
  const [mode, setMode] = useState<TabMode>("paste");
  const [htmlContent, setHtmlContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contentSize =
    mode === "paste" ? new Blob([htmlContent]).size : file?.size ?? 0;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit =
    mode === "paste" ? htmlContent.trim().length > 0 : file !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (mode === "paste") {
        formData.append("content", htmlContent);
      } else if (file) {
        formData.append("file", file);
      } else {
        return;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "上传失败");
      }

      setResult(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "上传失败，请稍后重试"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setHtmlContent("");
    setFile(null);
    setError(null);
  };

  if (result) {
    return (
      <div style={styles.container}>
        <SuccessCard
          url={result.url}
          expiresAt={result.expiresAt}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>码上钉</h1>
        <p style={styles.subtitle}>
          粘贴或拖拽 HTML，一键生成分享链接
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.tabs}>
          <button
            style={mode === "paste" ? styles.tabActive : styles.tab}
            onClick={() => {
              setMode("paste");
              setFile(null);
            }}
          >
            粘贴代码
          </button>
          <button
            style={mode === "drop" ? styles.tabActive : styles.tab}
            onClick={() => {
              setMode("drop");
              setHtmlContent("");
            }}
          >
            上传文件
          </button>
        </div>

        {mode === "paste" ? (
          <textarea
            style={styles.textarea}
            placeholder="在此粘贴你的 HTML/CSS/JS 代码..."
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <DropZone file={file} onFileSelect={setFile} />
        )}

        <div style={styles.sizeBar}>
          <span
            style={{
              ...styles.sizeText,
              color:
                contentSize > 5 * 1024 * 1024 ? "#e74c3c" : "#999",
            }}
          >
            {formatSize(contentSize)} / 5 MB
          </span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={{
            ...styles.button,
            opacity: canSubmit && !loading ? 1 : 0.5,
            cursor: canSubmit && !loading ? "pointer" : "not-allowed",
          }}
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? "发布中..." : "发布"}
        </button>
      </div>

      <p style={styles.footer}>
        匿名上传 · 24小时后自动销毁 · 单文件最大 5MB
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "2rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
    color: "#fff",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    margin: 0,
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },
  subtitle: {
    fontSize: "1.1rem",
    margin: "0.5rem 0 0",
    opacity: 0.9,
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2rem",
    width: "100%",
    maxWidth: "640px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "0",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    fontSize: "0.95rem",
    color: "#999",
    cursor: "pointer",
  },
  tabActive: {
    padding: "0.75rem 1.5rem",
    background: "none",
    border: "none",
    borderBottom: "2px solid #667eea",
    marginBottom: "-2px",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#667eea",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    minHeight: "300px",
    padding: "1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },
  sizeBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  sizeText: {
    fontSize: "0.8rem",
  },
  error: {
    background: "#fef2f2",
    color: "#e74c3c",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  button: {
    width: "100%",
    padding: "0.875rem",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  footer: {
    marginTop: "1.5rem",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.85rem",
  },
};
