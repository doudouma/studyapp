import { useState, useEffect } from "react";
import { Code2 } from "lucide-react";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { AppNav } from "~/components/HomeHeader";
import { StatsSection } from "~/components/StatsSection";
import { AppFooter } from "~/components/AppFooter";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";

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
  id?: string;
  url: string;
  expiresAt: string | null;
  isPermanent?: boolean;
  title?: string;
  isSharedToSquare?: boolean;
}

function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then((session: any) => {
      setUser(session?.data?.user ?? null);
      setAuthLoading(false);
    });
  }, []);

  const [mode, setMode] = useState<TabMode>("paste");
  const [htmlContent, setHtmlContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [shareToSquare, setShareToSquare] = useState(false);
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
      formData.append("tags", tags);
      formData.append("shareToSquare", String(shareToSquare));

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
    setTags("");
    setShareToSquare(false);
    setError(null);
  };

  if (authLoading) return null;

  if (result) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav user={user} />
        <main className="flex flex-1 flex-col items-center justify-center p-8">
          <SuccessCard
            url={result.url}
            expiresAt={result.expiresAt || undefined}
            isPermanent={result.isPermanent}
            pageId={result.id}
            onReset={handleReset}
          />
        </main>
        <AppFooter />
      </div>
    );
  }

  // ========== 未登录状态 — 统一导航条 + 居中内容 ==========
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav user={null} />
        <main className="flex-1">
          <section className="flex flex-col items-center justify-center p-8">
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

              <TabsContent value="paste" className="min-h-[300px] flex flex-col">
                <textarea
                  className="w-full flex-1 rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="在此粘贴你的 HTML/CSS/JS 代码..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  spellCheck={false}
                />
              </TabsContent>

              <TabsContent value="drop" className="min-h-[300px]">
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
              className="w-full py-6 text-base"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
            >
              {loading ? "发布中..." : "发布页面"}
            </Button>
          </CardContent>
        </Card>

          <p className="mt-6 text-sm text-muted-foreground">
            匿名上传 · 24小时后自动销毁 · 单文件最大 5MB
          </p>
        </section>

          <StatsSection />
      </main>

      <AppFooter />
    </div>
    );
  }

  // ========== 已登录状态 — 丰富布局 ==========
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav user={user} />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-12 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            一键分享你的 HTML
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            粘贴代码或上传文件，30 秒生成分享链接
          </p>
        </section>

        <section className="mx-auto max-w-2xl px-6 pb-8">
          <Card>
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

                <TabsContent value="paste" className="min-h-[300px] flex flex-col">
                  <textarea
                    className="w-full flex-1 rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="在此粘贴你的 HTML/CSS/JS 代码..."
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    spellCheck={false}
                  />
                </TabsContent>

                <TabsContent value="drop" className="min-h-[300px]">
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

              {/* 已登录额外字段：标题 */}
              <div className="mb-3">
                <label className="text-sm font-medium text-foreground">
                  标题{" "}
                  <span className="font-normal text-muted-foreground">
                    (可选)
                  </span>
                </label>
                <Input
                  className="mt-1"
                  placeholder="输入页面标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* 已登录额外字段：类型 */}
              <div className="mb-3">
                <label className="text-sm font-medium text-foreground">
                  类型
                </label>
                <select
                  className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="chinese">语文</option>
                  <option value="math">数学</option>
                  <option value="english">英语</option>
                  <option value="physics">物理</option>
                  <option value="chemistry">化学</option>
                  <option value="history">历史</option>
                  <option value="biology">生物</option>
                  <option value="geography">地理</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {/* 已登录额外字段：标签 */}
              <div className="mb-3">
                <label className="text-sm font-medium text-foreground">
                  标签{" "}
                  <span className="font-normal text-muted-foreground">
                    (可选，逗号分隔)
                  </span>
                </label>
                <Input
                  className="mt-1"
                  placeholder="例如: HTML, 笔记, 课件"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* 已登录：分享到广场 */}
              <label className="mb-3 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={shareToSquare}
                  onChange={(e) => setShareToSquare(e.target.checked)}
                />
                <span className="text-sm text-foreground">
                  分享到广场
                </span>
              </label>

              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                className="w-full gap-2 py-6 text-base"
                disabled={!canSubmit || loading}
                onClick={handleSubmit}
              >
                {loading ? "发布中..." : "发布页面"}
              </Button>
            </CardContent>
          </Card>
        </section>

        <StatsSection />
      </main>

      <AppFooter />
    </div>
  );
}
