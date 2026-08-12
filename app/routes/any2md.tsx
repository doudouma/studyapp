import { useState, useEffect, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, ShieldCheck, Files, Table2, ArrowRight, Check, ChevronDown } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { FileDrop } from "~/components/any2md/FileDrop";
import { ResultPanel } from "~/components/any2md/ResultPanel";
import { MdView } from "~/components/any2md/MdView";
import {
  ensureEngine,
  toMarkdownFromFile,
  isSupportedExt,
  errorKey,
  MAX_SIZE,
  PUBLISH_LIMIT,
  type EngineStatus,
  type ConvertResult,
} from "~/lib/any2md/convert";
import { useTranslation } from "react-i18next";
import i18n, { getBcp47 } from "~/lib/i18n";

const textEncoder = new TextEncoder();

export const Route = createFileRoute("/any2md")({
  head: () => {
    const lang = i18n.language?.startsWith("zh") ? "zh" : "en";
    const bcp = getBcp47(i18n.language);
    const pageUrl = "https://100mini.com/any2md";
    const ogImage = "https://100mini.com/spritesheet2/frame_38.webp";
    const faqs = Array.from({ length: 6 }, (_, i) => ({
      name: i18n.t(`any2md.faq${i + 1}.q`),
      text: i18n.t(`any2md.faq${i + 1}.a`),
    }));
    return {
      meta: [
        { title: i18n.t("any2md.title") },
        { name: "description", content: i18n.t("any2md.subtitle") },
        { name: "keywords", content: i18n.t("any2md.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:title", content: i18n.t("any2md.title") },
        { property: "og:description", content: i18n.t("any2md.subtitle") },
        { property: "og:image", content: ogImage },
        { property: "og:locale", content: bcp.replace("-", "_") },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("any2md.title") },
        { name: "twitter:description", content: i18n.t("any2md.subtitle") },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: pageUrl },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "100mini Any to MD",
            url: pageUrl,
            description: i18n.t("any2md.subtitle"),
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "All",
            browserRequirements: "Requires JavaScript and WebAssembly",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Convert Word, PPT, Excel and PDF to Markdown in the browser",
              "Runs 100% locally, files never leave the machine",
              "13 formats supported",
              "Download, copy, or continue to MD to HTML templates",
            ],
            author: { "@type": "Organization", name: "100mini", url: "https://100mini.com" },
            inLanguage: bcp,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
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
  component: Any2MdPage,
});

function Any2MdPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("idle");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadEngine = useCallback(() => {
    setEngineStatus((prev) => (prev === "ready" || prev === "loading" ? prev : "loading"));
    ensureEngine()
      .then(() => setEngineStatus("ready"))
      .catch(() => setEngineStatus("error"));
  }, []);

  useEffect(() => {
    loadEngine();
  }, [loadEngine]);

  const handleFile = async (file: File) => {
    setError(null);
    if (!isSupportedExt(file.name)) {
      setError(t("any2md.typeError"));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t("any2md.sizeError"));
      return;
    }
    if (engineStatus !== "ready") {
      setError(t("any2md.loading"));
      return;
    }
    setBusy(true);
    setResult(null);
    setFileName(file.name);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const res = toMarkdownFromFile(bytes, file.name);
      setResult(res);
    } catch (err) {
      const code = (err as { code?: unknown })?.code;
      setError(t(errorKey(code)));
      setFileName("");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const base = fileName.replace(/\.[^.]*$/, "") || "document";
    const blob = new Blob([result.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinue = () => {
    if (!result) return;
    try {
      sessionStorage.setItem("any2md.draft", result.markdown);
      navigate({ to: "/md2html" });
    } catch {
      setError(t("any2md.storageError"));
    }
  };

  const handleReset = () => {
    setResult(null);
    setFileName("");
    setError(null);
  };

  const features = [
    { icon: ShieldCheck, title: t("any2md.feature1.title"), desc: t("any2md.feature1.desc") },
    { icon: Files, title: t("any2md.feature2.title"), desc: t("any2md.feature2.desc") },
    { icon: Table2, title: t("any2md.feature3.title"), desc: t("any2md.feature3.desc") },
    { icon: ArrowRight, title: t("any2md.feature4.title"), desc: t("any2md.feature4.desc") },
  ];

  const pains = [
    t("any2md.pain1"),
    t("any2md.pain2"),
    t("any2md.pain3"),
    t("any2md.pain4"),
  ];

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    name: t(`any2md.faq${i + 1}.q`),
    text: t(`any2md.faq${i + 1}.a`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 pt-10 pb-12">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <FileText className="size-6 text-[#006c49] dark:text-[#4edea3]" />
              <h1 className="text-2xl font-bold text-foreground">{t("any2md.heading")}</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("any2md.subtitle")}</p>
          </div>

          <FileDrop
            engineStatus={engineStatus}
            busy={busy}
            onFile={handleFile}
            onRetry={loadEngine}
            error={error}
          />

          {result && (
            <div className="mt-4">
              <ResultPanel
                fileName={fileName}
                format={result.format}
                chars={result.markdown.length}
                ms={result.ms}
                markdown={result.markdown}
                canContinue={textEncoder.encode(result.markdown).length <= PUBLISH_LIMIT}
                onDownload={handleDownload}
                onCopy={() => {}}
                onContinue={handleContinue}
                onReset={handleReset}
              />
              <div className="mt-4">
                <MdView markdown={result.markdown} />
              </div>
            </div>
          )}

          {/* Features */}
          <section className="mt-14">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("any2md.features")}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-[#d3e4fe]/60 bg-white p-5 dark:border-[#3c4a42] dark:bg-[#15243b]">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                    <f.icon className="size-4.5" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pain points */}
          <section className="mt-12">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("any2md.pain")}</h2>
            <div className="mt-6 rounded-2xl border border-[#d3e4fe]/60 bg-white p-6 dark:border-[#3c4a42] dark:bg-[#15243b]">
              <ul className="space-y-3">
                {pains.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                      <Check className="size-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">{t("any2md.faq")}</h2>
            <div className="mt-6 rounded-2xl border border-[#d3e4fe]/60 bg-white px-6 shadow-sm dark:border-[#3c4a42] dark:bg-[#15243b]">
              {faqs.map((faq) => (
                <FaqItem key={faq.name} name={faq.name} text={faq.text} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

function FaqItem({ name, text }: { name: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#d3e4fe]/60 last:border-b-0 dark:border-[#3c4a42]">
      <button
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80"
        onClick={() => setOpen(!open)}
      >
        <span>{name}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{text}</div>}
    </div>
  );
}
