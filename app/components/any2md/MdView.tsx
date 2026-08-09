import { useEffect, useState } from "react";
import { marked } from "marked";

interface MdViewProps {
  markdown: string;
  className?: string;
}

export function MdView({ markdown, className = "" }: MdViewProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    try {
      const out = marked.parse(markdown, { async: false });
      if (!cancelled) setHtml(String(out));
    } catch {
      if (!cancelled) setHtml(`<pre>${markdown.replace(/</g, "&lt;")}</pre>`);
    }
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  if (!markdown) return null;

  return (
    <div
      className={`md-view overflow-x-auto rounded-xl border border-border bg-white p-6 dark:bg-[#15243b] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
