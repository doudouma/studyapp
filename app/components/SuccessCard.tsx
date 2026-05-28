import { useState } from "react";

interface SuccessCardProps {
  url: string;
  expiresAt: string;
  onReset: () => void;
}

export function SuccessCard({ url, expiresAt, onReset }: SuccessCardProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const expiryDate = new Date(expiresAt).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={styles.card}>
      <div style={styles.icon}>✅</div>
      <h2 style={styles.title}>发布成功！</h2>
      <p style={styles.expiry}>将于 {expiryDate} 后自动销毁</p>

      <div style={styles.urlBox}>
        <input
          style={styles.urlInput}
          value={fullUrl}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button style={styles.copyBtn} onClick={handleCopy}>
          {copied ? "已复制 ✓" : "复制链接"}
        </button>
      </div>

      <div style={styles.actions}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>
          预览页面 →
        </a>
      </div>

      <button style={styles.resetBtn} onClick={onReset}>
        继续发布
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    textAlign: "center",
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  icon: {
    fontSize: "3rem",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: "0 0 0.25rem",
    color: "#333",
  },
  expiry: {
    fontSize: "0.9rem",
    color: "#999",
    margin: "0 0 1.5rem",
  },
  urlBox: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  urlInput: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "monospace",
    background: "#f8f8f8",
    color: "#333",
    outline: "none",
  },
  copyBtn: {
    padding: "0.75rem 1.25rem",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  actions: {
    marginBottom: "1rem",
  },
  previewLink: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  resetBtn: {
    background: "none",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    fontSize: "0.9rem",
    color: "#666",
    cursor: "pointer",
  },
};
