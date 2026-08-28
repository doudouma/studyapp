import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CheckCircle2, ExternalLink, ImageIcon } from "lucide-react";
import { captureAndUploadThumbnail } from "~/lib/upload-flow";
import { useTranslation } from "react-i18next";

interface SuccessCardProps {
  url: string;
  /** Unix 毫秒时间戳，null/undefined 表示永久 */
  expiresAt?: number | null;
  isPermanent?: boolean;
  pageId: string;
  onReset: () => void;
  user?: any;
}

export function SuccessCard({ url, expiresAt, isPermanent, pageId, onReset, user }: SuccessCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const capturedRef = useRef(false);

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${url}`
      : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  useEffect(() => {
    import("qrcode/lib/browser.js").then((QRCode) => {
      QRCode.toString(fullUrl, { type: "svg", width: 160, margin: 2 }).then(
        setQrDataUrl
      );
    });
  }, [fullUrl]);

  // Trigger thumbnail capture on mount (once) — logged-in users only
  useEffect(() => {
    if (!user || capturedRef.current) return;
    capturedRef.current = true;

    captureAndUploadThumbnail(pageId)
      .then(() => setThumbnailReady(true))
      .catch(() => setThumbnailFailed(true));
  }, [pageId, user]);

  const expiryDate = expiresAt ? new Date(expiresAt).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : null;

  return (
    <Card className="w-full max-w-md text-center">
      <CardContent className="flex flex-col items-center gap-5 pt-10 pb-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#006c49]/10 dark:bg-[#4edea3]/10">
          <CheckCircle2 className="size-8 text-[#006c49] dark:text-[#4edea3]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t("components.success.heading")}</h2>
        <p className="text-sm text-muted-foreground">
          {isPermanent ? t("components.success.permanent") : t("components.success.autoDestroy", { time: expiryDate })}
        </p>

        {/* Thumbnail status — logged-in users only */}
        {user && !thumbnailReady && !thumbnailFailed && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="size-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            {t("components.success.generating")}
          </div>
        )}
        {user && thumbnailReady && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <ImageIcon className="size-3.5" />
            {t("components.success.generated")}
          </div>
        )}
        {user && thumbnailFailed && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {t("components.success.failed")}
          </div>
        )}

        {qrDataUrl && (
          <div className="size-40 rounded-2xl border border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#15243b] flex items-center justify-center overflow-hidden">
            <div
              className="[&>svg]:block"
              dangerouslySetInnerHTML={{ __html: qrDataUrl }}
            />
          </div>
        )}

        <div className="flex w-full gap-2">
          <input
            className={cn(
              "flex-1 rounded-lg border-2 border-[#bbcabf] dark:border-[#3c4a42] bg-[#e5eeff]/30 dark:bg-[#1e314a]/30 px-3 py-2 text-sm font-mono text-foreground outline-none",
              "focus-visible:border-[#0058be] focus-visible:ring-3 focus-visible:ring-[#0058be]/30"
            )}
            value={fullUrl}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button onClick={handleCopy} className="shrink-0">
            {copied ? t("common.copied") : t("common.copy")}
          </Button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#0058be] dark:text-[#adc6ff] hover:underline"
        >
          {t("components.success.preview")} <ExternalLink className="size-3.5" />
        </a>

        <Button variant="outline" onClick={onReset} className="mt-2">
          {t("components.success.continue")}
        </Button>
      </CardContent>
    </Card>
  );
}
