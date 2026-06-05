import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface SuccessCardProps {
  url: string;
  expiresAt?: string;
  isPermanent?: boolean;
  onReset: () => void;
}

export function SuccessCard({ url, expiresAt, isPermanent, onReset }: SuccessCardProps) {
  const [copied, setCopied] = useState(false);

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

  const expiryDate = expiresAt ? new Date(expiresAt).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : null;

  return (
    <Card className="w-full max-w-md text-center">
      <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">发布成功！</h2>
        <p className="text-sm text-muted-foreground">
          {isPermanent ? "永久保留" : `将于 ${expiryDate} 后自动销毁`}
        </p>

        <div className="flex w-full gap-2">
          <input
            className={cn(
              "flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono text-foreground outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
            value={fullUrl}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button onClick={handleCopy} className="shrink-0">
            {copied ? "已复制 ✓" : "复制链接"}
          </Button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          预览页面 <ExternalLink className="size-3.5" />
        </a>

        <Button variant="outline" onClick={onReset} className="mt-2">
          继续发布
        </Button>
      </CardContent>
    </Card>
  );
}
