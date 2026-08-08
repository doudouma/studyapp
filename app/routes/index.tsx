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

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TagInput } from "~/components/TagInput";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth-context";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: i18n.t("home.title") },
      {
        name: "keywords",
        content: i18n.t("app.keywords"),
      },
    ],
    links: [
      { rel: "canonical", href: "https://100mini.com/" },
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
  const { t } = useTranslation();
  return (
    <Card className="w-full max-w-xl">
      <CardContent className="p-6">
        <div>
          <div role="tablist" className="mb-6 inline-flex w-fit items-center justify-center gap-1 rounded-none bg-transparent">
            <button
              role="tab"
              data-active={mode === "paste" ? "" : undefined}
              onClick={() => { setMode("paste"); setFile(null); }}
              className="relative inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground data-active:bg-background data-active:text-foreground after:absolute after:inset-x-0 after:bottom-[-5px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity data-active:after:opacity-100"
            >
              {t("home.tab.paste")}
            </button>
            <button
              role="tab"
              data-active={mode === "drop" ? "" : undefined}
              onClick={() => { setMode("drop"); setHtmlContent(""); }}
              className="relative inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground data-active:bg-background data-active:text-foreground after:absolute after:inset-x-0 after:bottom-[-5px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity data-active:after:opacity-100"
            >
              {t("home.tab.upload")}
            </button>
          </div>

          {mode === "paste" ? (
            <div role="tabpanel" className="min-h-[300px] flex flex-col flex-1 text-sm outline-none">
              <textarea
                className="w-full flex-1 rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder={t("home.textarea.placeholder")}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                spellCheck={false}
              />
            </div>
          ) : (
            <div role="tabpanel" className="min-h-[300px] flex-1 text-sm outline-none">
              <DropZone file={file} onFileSelect={setFile} />
            </div>
          )}
        </div>

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
                {t("home.form.title")} <span className="text-destructive">{t("home.form.titleRequired")}</span>
              </label>
              <Input
                className="mt-1"
                placeholder={t("home.form.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">{t("home.form.category")}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="general">{t("home.select.default")}</option>
                <option value="chinese">{t("home.select.chinese")}</option>
                <option value="math">{t("home.select.math")}</option>
                <option value="english">{t("home.select.english")}</option>
                <option value="physics">{t("home.select.physics")}</option>
                <option value="chemistry">{t("home.select.chemistry")}</option>
                <option value="history">{t("home.select.history")}</option>
                <option value="biology">{t("home.select.biology")}</option>
                <option value="geography">{t("home.select.geography")}</option>
                <option value="other">{t("home.select.other")}</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">
                {t("home.form.tags")}{" "}
                <span className="font-normal text-muted-foreground">
                  {t("home.form.tagsHint")}
                </span>
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder={t("home.form.tagsPlaceholder")}
              />
            </div>

            <label className="mb-3 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                checked={shareToSquare}
                onChange={(e) => setShareToSquare(e.target.checked)}
              />
              <span className="text-sm text-foreground">{t("home.form.shareToSquare")}</span>
            </label>
          </>
        )}

        {!user && (
          <div className="mb-5 rounded-2xl border border-[#c49f00]/20 bg-[#c49f00]/5 dark:border-[#eec200]/20 dark:bg-[#eec200]/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="size-4 text-[#c49f00] dark:text-[#eec200]" />
              <span className="text-xs font-semibold text-[#735c00] dark:text-[#eec200] tracking-wide uppercase">
                {t("home.upsell.title")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-[#c49f00] dark:text-[#eec200]" />
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.anonymousExpiry")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Infinity className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">{t("home.upsell.permanent")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.noTitle")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tags className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">{t("home.upsell.withTitle")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.noShare")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">{t("home.upsell.canShare")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.noManage")}</span>
              </div>
              <div className="flex items-center gap-2">
                <List className="size-3.5 text-[#006c49] dark:text-[#4edea3]" />
                <span className="text-xs text-[#006c49] dark:text-[#4edea3] font-medium">{t("home.upsell.canManage")}</span>
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
          {loading ? t("common.submitting") : t("common.submit")}
        </Button>
      </CardContent>
    </Card>
  );
}

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
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
        throw new Error(json.error || t("common.error"));
      }

      setResult(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("common.errorRetry")
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[52px] lg:leading-[1.15]">
              {t("home.hero.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="gap-2 h-11 px-6 text-base rounded-xl"
                onClick={scrollToUpload}
              >
                {t("home.hero.cta1")}
                <ArrowDown className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base h-11 px-6 rounded-xl"
                onClick={() => navigate({ to: "/square", search: { q: "" } })}
              >
                {t("home.hero.cta2")}
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
            <h2 className="text-2xl font-bold tracking-tight">{t("home.section.upload")}</h2>
            <p className="mt-2 text-base text-muted-foreground">
              {t("home.section.uploadDesc")}
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
