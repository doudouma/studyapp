import { useState, useEffect } from "react";
import { Code2 } from "lucide-react";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { AuthBar } from "~/components/AuthBar";
import { UserCenter } from "~/components/UserCenter";
import { HomeHeader } from "~/components/HomeHeader";
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
  url: string;
  expiresAt: string | null;
  isPermanent?: boolean;
  title?: string;
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

  if (authLoading) return null;

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

  // ========== 未登录状态 — 保持现有简约设计 ==========
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="fixed top-4 right-4 z-50">
          <AuthBar />
        </div>

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

  // ========== 已登录状态 — 丰富布局 ==========
  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader user={user} />

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
                  <option value="general">通用</option>
                  <option value="notes">笔记</option>
                  <option value="slides">课件</option>
                  <option value="tool">工具</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                className="w-full gap-2"
                disabled={!canSubmit || loading}
                onClick={handleSubmit}
              >
                {loading ? "发布中..." : "发布并分享"}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section id="my-pages" className="mx-auto max-w-2xl px-6 pb-8">
          <UserCenter />
        </section>

        <StatsSection />
      </main>

      <AppFooter />
    </div>
  );
}
