import { useState, useRef } from "react";
import { ArrowDown, Code2, Clock, Infinity, Tags, Share2, List, Crown, LogIn } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { AppNav } from "~/components/HomeHeader";
import { StatsSection } from "~/components/StatsSection";
import { GuideSection } from "~/components/GuideSection";
import { AppFooter } from "~/components/AppFooter";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TagInput } from "~/components/TagInput";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "100mini - 学习页面快闪托管与分享",
    meta: [
      {
        name: "keywords",
        content:
          "HTML托管,学习页面,快闪托管,网页分享,免费托管,学习工具,教育工具,师生互动,静态网页",
      },
    ],
  }),
  component: HomePage,
});

type TabMode = "paste" | "drop";

interface UploadResult {
  id: string;
  url: string;
  expiresAt: string | null;
  isPermanent?: boolean;
  title?: string;
  isSharedToSquare?: boolean;
}

function UploadForm({
  mode,
  setMode,
  htmlContent,
  setHtmlContent,
  file,
  setFile,
  title,
  setTitle,
  category,
  setCategory,
  tags,
  setTags,
  shareToSquare,
  setShareToSquare,
  loading,
  error,
  handleSubmit,
  contentSize,
  formatSize,
  canSubmit,
  user,
}: {
  mode: TabMode;
  setMode: (v: TabMode) => void;
  htmlContent: string;
  setHtmlContent: (v: string) => void;
  file: File | null;
  setFile: (v: File | null) => void;
  title: string;
  setTitle: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  shareToSquare: boolean;
  setShareToSquare: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  handleSubmit: () => void;
  contentSize: number;
  formatSize: (bytes: number) => string;
  canSubmit: boolean;
  user: any;
}) {
  return (
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

        {user && (
          <>
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">
                标题 <span className="text-destructive">*</span>
              </label>
              <Input
                className="mt-1"
                placeholder="输入页面标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">类型</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="general">通用</option>
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

            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">
                标签{" "}
                <span className="font-normal text-muted-foreground">
                  (可选，最多10个)
                </span>
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="输入标签后按回车添加"
              />
            </div>

            <label className="mb-3 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                checked={shareToSquare}
                onChange={(e) => setShareToSquare(e.target.checked)}
              />
              <span className="text-sm text-foreground">分享到广场</span>
            </label>
          </>
        )}

        {!user && (
          <div className="mb-5 rounded-2xl border border-[#c49f00]/20 bg-[#c49f00]/5 dark:border-[#eec200]/20 dark:bg-[#eec200]/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="size-4 text-[#c49f00] dark:text-[#eec200]" />
              <span className="text-xs font-semibold text-[#735c00] dark:text-[#eec200] tracking-wide uppercase">
                登录后解锁更多
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-[#c49f00] dark:text-[#eec200]" />
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">24h 自动销毁</span>
              </div>
              <div className="flex items-center gap-2">
                <Infinity className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">永久保留</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">无标题/分类</span>
              </div>
              <div className="flex items-center gap-2">
                <Tags className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">标题·分类·标签</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">不可分享到广场</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">分享到学习广场</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">无法管理链接</span>
              </div>
              <div className="flex items-center gap-2">
                <List className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">管理你的所有链接</span>
              </div>
            </div>
          </div>
        )}

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
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const uploadRef = useRef<HTMLElement>(null);

  const [mode, setMode] = useState<TabMode>("paste");
  const [htmlContent, setHtmlContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
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
    (mode === "paste" ? htmlContent.trim().length > 0 : file !== null) &&
    (!user || title.trim().length > 0);

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
      formData.append("tags", tags.join(","));
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
    setTags([]);
    setShareToSquare(false);
    setError(null);
  };

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (authLoading) return null;

  if (result) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav />
        <main className="flex flex-1 flex-col items-center justify-center p-8">
          <SuccessCard
            url={result.url}
            expiresAt={result.expiresAt || undefined}
            isPermanent={result.isPermanent}
            pageId={result.id}
            onReset={handleReset}
            user={user}
          />
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#006c49]/10 via-[#006c49]/[0.02] to-background dark:from-[#4edea3]/10 dark:via-[#4edea3]/[0.02] dark:to-background pb-12 pt-20 md:pt-28">
          <div className="mx-auto max-w-4xl px-6 text-center">
            {/* <div className="mb-5 flex justify-center">
              <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[#006c49] text-white dark:bg-[#4edea3] dark:text-[#002113] shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]">
                <Code2 className="size-8" />
              </div>
            </div> */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[52px] lg:leading-[1.15]">
              学习页面快闪托管
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
              粘贴或上传你的互动学习单页，30秒生成分享链接。
              零成本、免注册、24小时自动销毁。
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="gap-2 h-11 px-6 text-base rounded-xl"
                onClick={scrollToUpload}
              >
                开始上传
                <ArrowDown className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base h-11 px-6 rounded-xl"
                onClick={() => navigate({ to: "/square" })}
              >
                浏览学习广场
              </Button>
            </div>
          </div>
        </section>

        {/* Upload area */}
        <section
          ref={uploadRef}
          className="scroll-mt-24 mx-auto max-w-2xl px-6 pb-8 -mt-8 relative z-10"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">上传你的页面</h2>
            <p className="mt-2 text-base text-muted-foreground">
              支持 HTML 代码粘贴或 .html/.zip 文件上传
            </p>
          </div>
          <UploadForm
            mode={mode}
            setMode={setMode}
            htmlContent={htmlContent}
            setHtmlContent={setHtmlContent}
            file={file}
            setFile={setFile}
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
            tags={tags}
            setTags={setTags}
            shareToSquare={shareToSquare}
            setShareToSquare={setShareToSquare}
            loading={loading}
            error={error}
            handleSubmit={handleSubmit}
            contentSize={contentSize}
            formatSize={formatSize}
            canSubmit={canSubmit}
            user={user}
          />
        </section>

        <StatsSection />
        <GuideSection />
      </main>
      <AppFooter />
    </div>
  );
}
