import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCopy, ClipboardPaste, Link2, ChevronDown, Loader2, ArrowRight } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useAuth } from "~/lib/auth-context";
import { useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "~/lib/i18n";
import { withLangPrefix, currentLang, BASE_URL, DEFAULT_OG_IMAGE } from "~/lib/seo";
import { uploadPage } from "~/features/pages/api";
import { MAX_CONTENT_SIZE, MAX_USER_CONTENT_SIZE } from "@shared/types/pages";
import type { UploadResult } from "@shared/types/pages";

export const Route = createFileRoute("/claude-artifact-to-link")({
  head: () => {
    const bcp = getBcp47(i18n.language);
    const pageUrl = BASE_URL + withLangPrefix(currentLang(), "/claude-artifact-to-link");
    const faqs = Array.from({ length: 5 }, (_, i) => ({
      name: i18n.t(`claudeArtifact.faq${i + 1}.q`),
      text: i18n.t(`claudeArtifact.faq${i + 1}.a`),
    }));
    return {
      meta: [
        { title: i18n.t("claudeArtifact.title") },
        { name: "description", content: i18n.t("claudeArtifact.desc") },
        { name: "keywords", content: i18n.t("claudeArtifact.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("claudeArtifact.title") },
        { property: "og:description", content: i18n.t("claudeArtifact.desc") },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("claudeArtifact.title") },
        { name: "twitter:description", content: i18n.t("claudeArtifact.desc") },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: i18n.t("claudeArtifact.h1"),
            description: i18n.t("claudeArtifact.desc"),
            inLanguage: bcp,
            totalTime: "PT1M",
            step: Array.from({ length: 3 }, (_, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: i18n.t(`claudeArtifact.step${i + 1}.title`),
              text: i18n.t(`claudeArtifact.step${i + 1}.desc`),
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: bcp,
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.name,
              acceptedAnswer: { "@type": "Answer", text: faq.text },
            })),
          }),
        },
      ],
    };
  },
  component: ClaudeArtifactPage,
});

type TabMode = "paste" | "upload";

const STEP_ICONS = [ClipboardCopy, ClipboardPaste, Link2];

function ClaudeArtifactPage() {
  const { t } = useTranslation();
  const { user, refreshAuth } = useAuth();

  const [mode, setMode] = useState<TabMode>("paste");
  const [htmlContent, setHtmlContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const maxBytes = user ? MAX_USER_CONTENT_SIZE : MAX_CONTENT_SIZE;
  const contentSize = useMemo(
    () => (mode === "paste" ? new Blob([htmlContent]).size : file?.size ?? 0),
    [mode, htmlContent, file],
  );

  const canSubmit =
    (mode === "paste" ? htmlContent.trim().length > 0 : file !== null) &&
    contentSize <= maxBytes;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (mode === "paste") formData.append("content", htmlContent);
      else if (file) formData.append("file", file);
      else return;
      formData.append("title", "");
      formData.append("category", "general");
      formData.append("tags", "");
      formData.append("shareToSquare", "false");

      const res = await uploadPage(formData);
      if (!res.ok) throw new Error(res.error || t("common.error"));
      setResult(res.data);
      await refreshAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.errorRetry"));
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
            shareToSquare={result.isSharedToSquare}
          />
        </main>
        <AppFooter />
      </div>
    );
  }

  const faqs = Array.from({ length: 5 }, (_, i) => ({
    q: t(`claudeArtifact.faq${i + 1}.q`),
    a: t(`claudeArtifact.faq${i + 1}.a`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#006c49]/10 via-[#006c49]/[0.02] to-background dark:from-[#4edea3]/10 dark:via-[#4edea3]/[0.02] dark:to-background pb-10 pt-16 md:pt-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#006c49]/20 bg-[#006c49]/5 px-3 py-1 text-xs font-medium text-[#006c49] dark:border-[#4edea3]/20 dark:bg-[#4edea3]/5 dark:text-[#4edea3]">
              {t("claudeArtifact.badge")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t("claudeArtifact.h1")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              {t("claudeArtifact.subtitle")}
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-5xl px-6 pb-4">
          <div className="grid gap-6 md:grid-cols-3">
            {STEP_ICONS.map((Icon, i) => (
              <div key={i} className="flex flex-col items-center rounded-2xl border border-border/70 bg-card p-6 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                  <Icon className="size-6" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  {t(`claudeArtifact.step${i + 1}.title`)}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`claudeArtifact.step${i + 1}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tool */}
        <section className="mx-auto max-w-2xl px-6 py-10">
          <Card className="w-full">
            <CardContent className="p-6">
              <div role="tablist" className="mb-5 inline-flex w-fit items-center gap-1">
                <button
                  role="tab"
                  data-active={mode === "paste" ? "" : undefined}
                  onClick={() => { setMode("paste"); setFile(null); }}
                  className="rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-foreground/60 transition-all hover:text-foreground data-active:bg-muted data-active:text-foreground"
                >
                  {t("claudeArtifact.pasteTab")}
                </button>
                <button
                  role="tab"
                  data-active={mode === "upload" ? "" : undefined}
                  onClick={() => { setMode("upload"); setHtmlContent(""); }}
                  className="rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-foreground/60 transition-all hover:text-foreground data-active:bg-muted data-active:text-foreground"
                >
                  {t("claudeArtifact.uploadTab")}
                </button>
              </div>

              {mode === "paste" ? (
                <textarea
                  className="min-h-[260px] w-full rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder={t("claudeArtifact.placeholder")}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <div className="min-h-[260px]">
                  <DropZone file={file} onFileSelect={setFile} maxBytes={maxBytes} />
                </div>
              )}

              {contentSize > maxBytes && (
                <p className="mt-2 text-xs text-destructive">
                  {t("claudeArtifact.tooLarge", { max: Math.round(maxBytes / (1024 * 1024)) })}
                </p>
              )}

              {error && (
                <div className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                className="mt-4 w-full gap-2 py-6 text-base"
                disabled={!canSubmit || loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> {t("common.submitting")}</>
                ) : (
                  <>{t("claudeArtifact.publish")} <ArrowRight className="size-4" /></>
                )}
              </Button>

              {!user && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {t("claudeArtifact.anonHint")}
                </p>
              )}
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t("claudeArtifact.notClaude")}{" "}
            <Link to="/" className="font-medium text-[#0058be] dark:text-[#adc6ff] hover:underline">
              {t("claudeArtifact.notClaudeLink")}
            </Link>
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight md:text-3xl">
            {t("claudeArtifact.faq.title")}
          </h2>
          <div className="rounded-2xl border border-border bg-card px-6">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border-b border-border last:border-b-0">
                <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80 [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
