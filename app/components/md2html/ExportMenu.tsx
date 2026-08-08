import { useState, useRef, useEffect } from "react";
import { Download, FileCode2, Image, Check, ChevronDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

interface ExportMenuProps {
  html: string;
  md: string;
  className?: string;
}

export function ExportMenu({ html, md, className }: ExportMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    downloadBlob(blob, filename);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const exportImage = async () => {
    const { snapdom } = await import("@zumer/snapdom");
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "720px";
    iframe.style.height = "1000px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        iframe.remove();
        reject(new Error("图片生成超时"));
      }, 15000);

      iframe.addEventListener("load", async () => {
        clearTimeout(timeoutId);
        try {
          const doc = iframe.contentDocument;
          if (!doc || !doc.body) throw new Error("iframe 内容不可用");

          await delay(600);

          const fullHeight = Math.max(
            doc.body.scrollHeight,
            doc.body.offsetHeight,
            doc.documentElement.scrollHeight,
            doc.documentElement.offsetHeight,
          );
          iframe.style.height = `${fullHeight}px`;
          await delay(200);

          const blob = await snapdom.toBlob(doc.body, {
            type: "png",
            backgroundColor: "#ffffff",
          });

          downloadBlob(blob, `${title || "md2html"}.png`);
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          iframe.remove();
        }
      });

      iframe.addEventListener("error", () => {
        clearTimeout(timeoutId);
        iframe.remove();
        reject(new Error("iframe 加载失败"));
      });

      iframe.srcdoc = html;
    });
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      showToast(t("md2html.export.done"));
    } catch {
      showToast(t("md2html.export.failed"));
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const title = extractTitle(md);

  const actions = [
    {
      id: "download-html",
      label: t("md2html.export.downloadHtml"),
      emoji: <Download className="size-4" />,
      fn: () => run(async () => { downloadFile(html, `${title || "md2html"}.html`, "text/html;charset=utf-8"); }),
    },
    {
      id: "download-png",
      label: t("md2html.export.downloadPng"),
      emoji: <Image className="size-4" />,
      fn: () => run(exportImage),
    },
    {
      id: "copy-html",
      label: t("md2html.export.copyHtml"),
      emoji: <FileCode2 className="size-4" />,
      fn: () => run(copyHtml),
    },
  ];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={!html}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : copied ? <Check className="size-4" /> : <Download className="size-4" />}
        {t("md2html.export.button")}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
        >
          {actions.map((a) => (
            <button
              key={a.id}
              role="menuitem"
              disabled={busy}
              onClick={() => {
                if (busy) return;
                void a.fn();
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="text-muted-foreground">{a.emoji}</span>
              {a.label}
            </button>
          ))}
        </div>
      )}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-popover px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractTitle(md: string): string {
  const match = md.match(/^\s*#\s+(.+)/m);
  return match ? match[1].trim() : "";
}
