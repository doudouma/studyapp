import { useState } from "react";
import { Code2 } from "lucide-react";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { AuthBar } from "~/components/AuthBar";
import { UserCenter } from "~/components/UserCenter";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "100mini - 免费 HTML 托管与分享",
    meta: [
      {
        name: "keywords",
        content:
          "HTML托管,代码分享,在线HTML,前端分享,网页托管,免费托管,学习工具,教育工具",
      },
    ],
  }),
  component: HomePage,
});

type TabMode = "paste" | "drop";

interface UploadResult {
  url: string;
  expiresAt: string | null;
  isPermanent?: boolean;
  title?: string;
}

function HomePage() {
  const [mode, setMode] = useState<TabMode>("paste");
  const [htmlContent, setHtmlContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
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
      formData.append("title", title);
      formData.append("category", category);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json() as { error?: string } & UploadResult;
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
    setTitle("");
    setError(null);
  };

  if (result) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <SuccessCard
          url={result.url}
          expiresAt={result.expiresAt || undefined}
          isPermanent={result.isPermanent}
          onReset={handleReset}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <header className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Code2 className="size-6" />
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          码上钉
        </h1>
        <p className="mt-2 text-muted-foreground">
          粘贴或拖拽 HTML，一键生成分享链接
        </p>
      </header>

      <UserCenter />

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
            <TabsList variant="line" className="mb-6">
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
            className="w-full"
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
          >
            {loading ? "发布中..." : "发布"}
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        匿名上传 · 24小时后自动销毁 · 单文件最大 5MB
      </p>
    </main>
  );
}
