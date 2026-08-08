import { useMemo } from "react";
import { cn } from "~/lib/utils";

interface MdPreviewProps {
  html: string;
  loading?: boolean;
  className?: string;
}

export function MdPreview({ html, loading, className }: MdPreviewProps) {
  const srcDoc = useMemo(() => {
    if (!html) return "";
    return html;
  }, [html]);

  return (
    <div className={cn("relative h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-border bg-background", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      {!srcDoc ? (
        <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-muted-foreground">
          预览区 — 输入 Markdown 后自动渲染
        </div>
      ) : (
        <iframe
          title="md-preview"
          className="h-full w-full border-0"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
        />
      )}
    </div>
  );
}
