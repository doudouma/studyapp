import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import {
  Link2,
  Copy,
  Download,
  Share2,
  QrCode,
  Check,
  Loader2,
  X,
} from "lucide-react";

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: string;
  text?: string;
  captureRef?: React.RefObject<HTMLElement | null>;
  fileName?: string;
  className?: string;
}

function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=560");
}

function encode(str: string) {
  return encodeURIComponent(str);
}

interface Platform {
  id: string;
  label: string;
  color: string;
  icon: string;
  /** If provided, opens direct share URL; otherwise uses native share */
  shareUrl?: (u: string, t: string) => string;
  /** Special handling: show QR code overlay */
  qr?: boolean;
}

const PLATFORMS: Platform[] = [
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: "f",
    shareUrl: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encode(u)}`,
  },
  {
    id: "x",
    label: "X",
    color: "#000000",
    icon: "𝕏",
    shareUrl: (u, t) =>
      `https://twitter.com/intent/tweet?text=${encode(t + " " + u)}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    color: "#FF4500",
    icon: "R",
    shareUrl: (u, t) =>
      `https://reddit.com/submit?url=${encode(u)}&title=${encode(t)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: "W",
    shareUrl: (u, t) =>
      `https://api.whatsapp.com/send?text=${encode(t + " " + u)}`,
  },
  
  {
    id: "telegram",
    label: "Telegram",
    color: "#26A5E4",
    icon: "T",
    shareUrl: (u, t) =>
      `https://t.me/share/url?url=${encode(u)}&text=${encode(t)}`,
  },
  {
    id: "wechat",
    label: "WeChat",
    color: "#07C160",
    icon: "Wx",
    qr: true,
  },
  {
    id: "line",
    label: "LINE",
    color: "#00B900",
    icon: "L",
    shareUrl: (u) =>
      `https://social-plugins.line.me/lineit/share?url=${encode(u)}`,
  },
];

/* ==================== QR Overlay ==================== */

function QrOverlay({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [qrSvg, setQrSvg] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("qrcode/lib/browser.js").then((QRCode) => {
      QRCode.toString(url, { type: "svg", width: 160, margin: 2 }).then(
        setQrSvg
      );
    });
  }, [url]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-1/2 bottom-full z-50 mb-2 -translate-x-1/2 rounded-2xl border border-[#E8D5BD] bg-white p-4 shadow-[0_16px_40px_-12px_rgba(0,0,0,.18)]"
    >
      {qrSvg && (
        <div
          className="size-40 [&>svg]:block [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      )}
      <p className="mt-2 text-center text-[12.5px] leading-[1.6] text-[#7A6855]">
        {t("petbadge.share.wechatTip")}
      </p>
    </div>
  );
}

/* ==================== ShareModal ==================== */

export function ShareModal({
  open,
  onOpenChange,
  url: propUrl,
  text = "",
  captureRef,
  fileName = "share.png",
  className,
}: ShareModalProps) {
  const { t } = useTranslation();
  const shareUrl =
    propUrl ||
    (typeof window !== "undefined" ? window.location.href : "");

  const [imgBlob, setImgBlob] = useState<Blob | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<"link" | "image" | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(
      typeof navigator !== "undefined" && !!navigator.share
    );
  }, []);

  const generateImage = useCallback(async () => {
    if (!captureRef?.current || generating) return;
    setGenerating(true);
    try {
      const { snapdom } = await import("@zumer/snapdom");
      const blob = await snapdom.toBlob(captureRef.current, {
        type: "png",
        backgroundColor: "#ffffff",
        scale: 2,
      });
      setImgBlob(blob);
      setImgUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("Failed to generate share image", e);
    } finally {
      setGenerating(false);
    }
  }, [captureRef, generating]);

  useEffect(() => {
    if (open && captureRef?.current && !imgBlob) {
      generateImage();
    }
  }, [open, captureRef, imgBlob, generateImage]);

  useEffect(() => {
    if (!open) setQrOpen(false);
  }, [open]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied("link");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }, [shareUrl]);

  const copyImage = useCallback(async () => {
    if (!imgBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": imgBlob }),
      ]);
      setCopied("image");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }, [imgBlob]);

  const downloadImage = useCallback(() => {
    if (!imgBlob) return;
    downloadBlob(imgBlob, fileName);
  }, [imgBlob, fileName]);

  const nativeShare = useCallback(async () => {
    const shareData: ShareData = { title: text, text, url: shareUrl };
    try {
      if (
        imgBlob &&
        navigator.canShare?.({
          files: [
            new File([imgBlob], fileName, {
              type: "image/png",
            } as FilePropertyBag),
          ],
        })
      ) {
        await navigator.share({
          ...shareData,
          files: [
            new File([imgBlob], fileName, {
              type: "image/png",
            } as FilePropertyBag),
          ],
        });
      } else if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch {
      /* user cancelled */
    }
  }, [imgBlob, text, shareUrl, fileName]);

  const handlePlatformClick = useCallback(
    (p: Platform) => {
      if (p.qr) {
        setQrOpen((prev: boolean) => !prev);
        return;
      }
      if (p.shareUrl) {
        openShareWindow(p.shareUrl(shareUrl, text));
      } else if (hasNativeShare) {
        nativeShare();
      } else {
        copyLink();
      }
    },
    [shareUrl, text, hasNativeShare, nativeShare, copyLink]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[380px] p-0 gap-0 overflow-hidden rounded-[22px]",
          className
        )}
        showCloseButton={false}
      >
        <div className="relative">
          <DialogTitle className="sr-only">
            {t("petbadge.share.title")}
          </DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-[17px] font-extrabold text-[#2F3E4E]">
                {t("petbadge.share.title")}
              </h2>
              <p className="mt-0.5 text-[13px] text-[#8A97A2]">
                {t("petbadge.share.subtitle")}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="size-8 flex items-center justify-center rounded-full bg-[#F0F0F0] text-[#8A97A2] hover:bg-[#E4E4E4] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Image preview */}
          {captureRef && (
            <div className="mx-5 overflow-hidden rounded-xl bg-[#F5F5F5]">
              {generating && !imgUrl ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Loader2 className="size-6 animate-spin text-[#C17248]" />
                  <span className="text-[13px] text-[#8A97A2]">
                    {t("petbadge.share.generating")}
                  </span>
                </div>
              ) : imgUrl ? (
                <img
                  src={imgUrl}
                  alt={t("petbadge.share.preview")}
                  className="w-full max-h-[240px] object-contain"
                />
              ) : null}
            </div>
          )}

          {/* Platforms grid */}
          <div className="px-5 pt-4">
            <div className="text-[11px] font-bold tracking-[.1em] text-[#B0A899] uppercase">
              {t("petbadge.share.platforms")}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {PLATFORMS.map((p) => (
                <div key={p.id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => handlePlatformClick(p)}
                    className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 w-full hover:bg-[#F5F5F5] transition-colors"
                  >
                    <span
                      className="flex items-center justify-center size-10 rounded-full text-white text-[13px] font-bold"
                      style={{ background: p.color }}
                    >
                      {p.icon}
                    </span>
                    <span className="text-[10.5px] font-semibold text-[#5D6D7A] leading-tight text-center">
                      {p.label}
                    </span>
                  </button>
                  {p.qr && qrOpen && (
                    <QrOverlay
                      url={shareUrl}
                      onClose={() => setQrOpen(false)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pt-3 pb-5 flex flex-wrap gap-2">
            <button
              onClick={copyLink}
              className="flex-1 min-w-[100px] h-10 rounded-xl bg-[#F5F5F5] text-[13px] font-bold text-[#3A4656] flex items-center justify-center gap-1.5 hover:bg-[#EBEBEB] transition-colors"
            >
              {copied === "link" ? (
                <Check className="size-4 text-[#07C160]" />
              ) : (
                <Link2 className="size-4" />
              )}
              {copied === "link"
                ? t("petbadge.share.copied")
                : t("petbadge.share.copyLink")}
            </button>

            {imgBlob && (
              <>
                <button
                  onClick={copyImage}
                  className="flex-1 min-w-[100px] h-10 rounded-xl bg-[#F5F5F5] text-[13px] font-bold text-[#3A4656] flex items-center justify-center gap-1.5 hover:bg-[#EBEBEB] transition-colors"
                >
                  {copied === "image" ? (
                    <Check className="size-4 text-[#07C160]" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied === "image"
                    ? t("petbadge.share.copied")
                    : t("petbadge.share.copyImage")}
                </button>
                <button
                  onClick={downloadImage}
                  className="flex-1 min-w-[100px] h-10 rounded-xl bg-[#F5F5F5] text-[13px] font-bold text-[#3A4656] flex items-center justify-center gap-1.5 hover:bg-[#EBEBEB] transition-colors"
                >
                  <Download className="size-4" />
                  {t("petbadge.share.download")}
                </button>
              </>
            )}

            {hasNativeShare && (
              <button
                onClick={nativeShare}
                className="flex-1 min-w-[100px] h-10 rounded-xl bg-[#C17248] text-[13px] font-bold text-white flex items-center justify-center gap-1.5 hover:bg-[#A65A34] transition-colors"
              >
                <Share2 className="size-4" />
                {t("petbadge.share.native")}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
