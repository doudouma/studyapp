import { useState } from "react";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
        <SuccessCard
          url={result.url}
          expiresAt={result.expiresAt}
          onReset={handleReset}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
      <header className="mb-8 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg">
          码上钉
        </h1>
        <p className="mt-2 text-lg opacity-90">
          粘贴或拖拽 HTML，一键生成分享链接
        </p>
      </header>

      <Card className="w-full max-w-xl">
        <CardContent className="p-6">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as TabMode);
              if (v === "paste") setFile(null);
              if (v === "drop") setHtmlContent("");
            }}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="paste">粘贴代码</TabsTrigger>
              <TabsTrigger value="drop">上传文件</TabsTrigger>
            </TabsList>

            <TabsContent value="paste">
              <textarea
                className="w-full min-h-[300px] rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="在此粘贴你的 HTML/CSS/JS 代码..."
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                spellCheck={false}
              />
            </TabsContent>

            <TabsContent value="drop">
              <DropZone file={file} onFileSelect={setFile} />
            </TabsContent>
          </Tabs>

          <div className="mt-2 mb-2 flex justify-end">
            <span
              className={`text-xs ${
                contentSize > 5 * 1024 * 1024
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {formatSize(contentSize)} / 5 MB
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd6] hover:to-[#6a4292] text-white shadow-lg"
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
          >
            {loading ? "发布中..." : "发布"}
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-white/70">
        匿名上传 · 24小时后自动销毁 · 单文件最大 5MB
      </p>
    </main>
  );
}
