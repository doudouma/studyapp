import { useState, useRef, useEffect, memo, useMemo, useCallback } from "react";
import { ArrowDown, Code2, Clock, Infinity, Tags, Share2, List, Crown, LogIn, Loader2, Puzzle, Flame } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DropZone } from "~/components/DropZone";
import { SuccessCard } from "~/components/SuccessCard";
import { AppNav } from "~/components/HomeHeader";
import { StatsSection } from "~/components/StatsSection";
import { GuideSection } from "~/components/GuideSection";
import { AgentSection } from "~/components/AgentSection";
import { AppFooter } from "~/components/AppFooter";
import { AIX_CSS } from "~/components/aix/aix-styles";
import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";

const MemoStatsSection = memo(StatsSection);
const MemoGuideSection = memo(GuideSection);
const MemoAppNav = memo(AppNav);
const MemoAppFooter = memo(AppFooter);

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TagInput } from "~/components/TagInput";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth-context";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { uploadPage, checkSlugAvailable } from "~/features/pages/api";
import { MAX_CONTENT_SIZE, MAX_USER_CONTENT_SIZE, POINTS_PER_CUSTOM_SLUG, computeUploadFees } from "@shared/types/pages";
import type { UploadResult, UploadExpiryOptions } from "@shared/types/pages";
import { ExpiryOptions, DEFAULT_EXPIRY_OPTIONS } from "~/components/ExpiryOptions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: i18n.t("home.title") },
      {
        name: "keywords",
        content: i18n.t("app.keywords"),
      },
    ],
  }),
  component: HomePage,
});

type TabMode = "paste" | "drop";

/** 自定义地址可用性状态 */
type SlugStatus = "idle" | "checking" | "ok" | "length" | "invalid" | "reserved" | "taken";

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
  expiry,
  setExpiry,
  slug,
  setSlug,
  slugStatus,
  loading,
  error,
  handleSubmit,
  contentSize,
  formatSize,
  canSubmit,
  user,
  maxBytes,
  sizeFee,
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
  expiry: UploadExpiryOptions;
  setExpiry: (v: UploadExpiryOptions) => void;
  slug: string;
  setSlug: (v: string) => void;
  slugStatus: SlugStatus;
  loading: boolean;
  error: string | null;
  handleSubmit: () => void;
  contentSize: number;
  formatSize: (bytes: number) => string;
  canSubmit: boolean;
  user: any;
  maxBytes: number;
  sizeFee: number;
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
              <DropZone file={file} onFileSelect={setFile} maxBytes={maxBytes} />
            </div>
          )}
        </div>

        <div className="mt-2 mb-2 flex items-center justify-end gap-2">
          {sizeFee > 0 && contentSize <= maxBytes && (
            <span className="text-xs text-[#735c00] dark:text-[#eec200]">
              {t("home.points.sizeFee", { points: sizeFee })}
            </span>
          )}
          <span
            className={`text-xs ${
              contentSize > maxBytes
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {formatSize(contentSize)} / {Math.round(maxBytes / (1024 * 1024))} MB
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
              <label className="text-sm font-medium text-foreground">
                {t("home.form.slug")}{" "}
                <span className="font-normal text-muted-foreground">
                  {t("home.form.slugFeeHint", { points: POINTS_PER_CUSTOM_SLUG })}
                </span>
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  /p/
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder={t("home.form.slugPlaceholder")}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                />
              </div>
              {slug.trim() && slugStatus !== "idle" && (
                <p
                  className={`mt-1 text-xs ${
                    slugStatus === "ok"
                      ? "text-[#111214] dark:text-[#d8ff00]"
                      : slugStatus === "checking"
                        ? "text-muted-foreground"
                        : "text-destructive"
                  }`}
                >
                  {t(`home.form.slugStatus.${slugStatus}`)}
                </p>
              )}
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

            <ExpiryOptions value={expiry} onChange={setExpiry} />

            {expiry.expiryPreset === "permanent" && expiry.maxViews == null && (
              <label className="mb-3 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                  checked={shareToSquare}
                  onChange={(e) => setShareToSquare(e.target.checked)}
                />
                <span className="text-sm text-foreground">{t("home.form.shareToSquare")}</span>
              </label>
            )}
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
                <Infinity className="size-3.5 text-[#111214] dark:text-[#d8ff00]" />
                <span className="text-xs text-[#111214] dark:text-[#d8ff00] font-medium">{t("home.upsell.permanent")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.noTitle")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tags className="size-3.5 text-[#111214] dark:text-[#d8ff00]" />
                <span className="text-xs text-[#111214] dark:text-[#d8ff00] font-medium">{t("home.upsell.withTitle")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.noShare")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="size-3.5 text-[#111214] dark:text-[#d8ff00]" />
                <span className="text-xs text-[#111214] dark:text-[#d8ff00] font-medium">{t("home.upsell.canShare")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.noManage")}</span>
              </div>
              <div className="flex items-center gap-2">
                <List className="size-3.5 text-[#111214] dark:text-[#d8ff00]" />
                <span className="text-xs text-[#111214] dark:text-[#d8ff00] font-medium">{t("home.upsell.canManage")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#735c00] dark:text-[#eec200]/80">{t("home.upsell.anonFixedExpiry")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="size-3.5 text-[#111214] dark:text-[#d8ff00]" />
                <span className="text-xs text-[#111214] dark:text-[#d8ff00] font-medium">{t("home.upsell.userExpiry")}</span>
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
          {loading ? <><Loader2 className="size-4 animate-spin" /> {t("common.submitting")}</> : t("common.submit")}
        </Button>
      </CardContent>
    </Card>
  );
}

const HOME_CSS = `
.aix-home{padding:26px 20px 44px}
.aix-home .rounded-xl,.aix-home .rounded-2xl,.aix-home .rounded-lg,.aix-home .rounded-md{border-radius:2px}
.aix-home .bg-card{background:var(--aix-paper)}
.aix-home .bg-background{background:var(--aix-paper)}
.aix-home .bg-muted{background:var(--aix-grey)}
.aix-home .bg-white{background:var(--aix-paper)}
.aix-home .border-border,.aix-home .border-input{border-color:var(--aix-line)}
.aix-home .text-muted-foreground{color:var(--aix-mute)}
.aix-home .text-primary{color:var(--aix-ink)}
.aix-home .bg-primary{background:#111214;color:var(--aix-lime)}
.aix-home .text-primary-foreground{color:var(--aix-lime)}
.aix-home .accent-primary{accent-color:#111214}
.aix-home .shadow-sm,.aix-home .shadow-md,.aix-home .shadow-lg{box-shadow:none}
.aix-home input,.aix-home textarea,.aix-home select,.aix-home button{border-radius:2px}
.aix-cta-btn{
  display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px;
  border:1px solid var(--aix-line);background:var(--aix-paper);color:var(--aix-ink);
  font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
  border-radius:2px;text-decoration:none;cursor:pointer;transition:.15s;
}
.aix-cta-btn:hover{border-color:var(--aix-ink);background:var(--aix-grey)}
.aix-cta-btn.primary{background:#111214;color:var(--aix-lime);border-color:#111214}
.aix-cta-btn.primary:hover{background:var(--aix-lime);color:#111214;border-color:var(--aix-lime)}

/* hero */
.aix-hero-stage{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(20px,3.4vw,48px);align-items:stretch}
.aix-hero-left{display:flex;flex-direction:column;gap:clamp(20px,3vw,34px);min-width:0}
.aix-hero-h1{margin:0;font-size:clamp(36px,5.2vw,68px);line-height:.98;font-weight:800;letter-spacing:-.045em;text-transform:uppercase;text-wrap:balance;word-break:keep-all}
.aix-hero-sub{margin:18px 0 0;max-width:52ch;font-size:13px;line-height:1.65;color:var(--aix-mute)}
.aix-hero-ctas{display:flex;flex-wrap:wrap;gap:8px}
.aix-hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:auto}
.aix-stat{border:1px solid var(--aix-line);background:var(--aix-grey);border-radius:2px;padding:14px 14px 12px;display:flex;flex-direction:column;gap:7px;min-width:0}
.aix-stat b{font-size:clamp(26px,3.4vw,40px);line-height:1;letter-spacing:-.05em;font-weight:800}
.aix-stat b em{font-style:normal;font-size:.42em;font-weight:700;letter-spacing:0;margin-left:2px;vertical-align:super}
.aix-stat > span{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--aix-mute)}
.aix-stat.lime{background:var(--aix-lime);border-color:var(--aix-lime)}
.aix-stat.lime > span{color:#111214}
.aix-stat.ink{background:#111214;border-color:#111214;color:var(--aix-lime)}
.aix-stat.ink > span{color:#a5a5a5}

.aix-hero-visual{
  position:relative;min-height:clamp(320px,38vw,460px);border:1px solid var(--aix-line);
  background:var(--aix-grey);border-radius:2px;overflow:hidden;
  display:flex;align-items:center;justify-content:center;padding:clamp(16px,3vw,36px);
}
.aix-hero-contour{
  position:absolute;inset:-20%;
  background-image:repeating-radial-gradient(circle at 78% 44%, transparent 0 30px, rgba(17,18,20,.07) 30px 31px);
  pointer-events:none;
}
.dark .aix-hero-contour{background-image:repeating-radial-gradient(circle at 78% 44%, transparent 0 30px, rgba(255,255,255,.07) 30px 31px)}
.aix-hero-browser{
  position:relative;z-index:2;width:100%;max-width:420px;background:var(--aix-paper);
  border:1px solid var(--aix-ink);border-radius:2px;
  box-shadow:12px 12px 0 rgba(17,18,20,.10);transform:rotate(-1.2deg);
  transition:transform .4s ease,box-shadow .4s ease;
}
.aix-hero-browser:hover{transform:rotate(0) translateY(-3px);box-shadow:14px 17px 0 rgba(17,18,20,.12)}
.dark .aix-hero-browser{box-shadow:12px 12px 0 rgba(255,255,255,.06)}
.dark .aix-hero-browser:hover{box-shadow:14px 17px 0 rgba(255,255,255,.08)}
.aix-hero-browser .bar{display:flex;align-items:center;gap:5px;height:34px;padding:0 10px;border-bottom:1px solid var(--aix-line);background:var(--aix-grey2)}
.aix-hero-browser .bar i{width:7px;height:7px;border-radius:50%;background:#cfcfcf;border:1px solid #b5b5b5;flex:none}
.aix-hero-browser .bar i:first-child{background:var(--aix-lime);border-color:#111214}
.aix-hero-browser .url{margin-left:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:8px;letter-spacing:.02em;color:var(--aix-mute);background:var(--aix-paper);border:1px solid var(--aix-line);border-radius:2px;padding:3px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62%}
.aix-hero-browser .url b{color:var(--aix-ink);font-weight:700}
.aix-hero-browser .screen{padding:14px}
.aix-hero-browser .sl{height:7px;background:var(--aix-grey2);border-radius:2px;margin-bottom:8px}
.aix-hero-browser .sl.w88{width:88%}
.aix-hero-browser .sl.w62{width:62%}
.aix-hero-browser .sl.w45{width:45%}
.aix-hero-browser .code{margin:12px 0;background:#111214;border-radius:2px;padding:12px;display:flex;flex-direction:column;gap:6px;position:relative}
.aix-hero-browser .code::after{content:"</>";position:absolute;right:9px;top:7px;font-size:8px;letter-spacing:.08em;color:#5c5c5c}
.aix-hero-browser .code i{height:5px;border-radius:1px;background:#3a3a3a;display:block}
.aix-hero-browser .code i:nth-child(1){width:52%;background:var(--aix-lime)}
.aix-hero-browser .code i:nth-child(2){width:78%}
.aix-hero-browser .code i:nth-child(3){width:64%;background:#8f8f8f}
.aix-hero-browser .code i:nth-child(4){width:38%;background:var(--aix-lime);opacity:.55}
.aix-hero-browser .chips{display:flex;gap:5px;margin-top:10px}
.aix-hero-browser .chips i{height:12px;width:34px;background:var(--aix-grey);border:1px solid var(--aix-line);border-radius:2px}
.aix-hero-browser .chips i:first-child{background:var(--aix-lime);border-color:#111214}
.aix-hero-badge{
  position:absolute;left:clamp(14px,3vw,28px);bottom:clamp(14px,3vw,28px);z-index:3;
  background:var(--aix-lime);border:1px solid #111214;padding:8px 12px;
  font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#111214;
}
.aix-hero-corner{position:absolute;right:16px;top:16px;width:10px;height:10px;border-radius:50%;background:var(--aix-lime);border:1px solid #111214;z-index:3}
@media(max-width:900px){
  .aix-hero-stage{grid-template-columns:1fr}
  .aix-hero-visual{min-height:300px}
}
@media(max-width:520px){
  .aix-hero-stats{grid-template-columns:1fr 1fr}
  .aix-stat:last-child{grid-column:span 2}
}
`;

function HeroSection({ onUpload, onBrowse }: { onUpload: () => void; onBrowse: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="aix-frame aix-hero" style={{ marginTop: 0 }}>
      <div className="aix-mininav">
        <span className="brand">
          <span className="dot" />
          100MINI / HTML
        </span>
        <a href="#upload">
          {t("home.hero.cta1")}
          <ArrowDown className="size-3.5" />
        </a>
      </div>

      <div className="aix-hero-stage">
        <div className="aix-hero-left">
          <div>
            <div className="aix-topline">
              <span className="aix-pill lime">
                <span className="dot" />
                HTML HOSTING / 2026
              </span>
            </div>
            <h1 className="aix-hero-h1">{t("home.hero.title")}</h1>
            <p className="aix-hero-sub">{t("home.hero.subtitle")}</p>
          </div>

          <div className="aix-hero-ctas">
            <button type="button" className="aix-cta-btn primary" onClick={onUpload}>
              {t("home.hero.cta1")}
              <ArrowDown className="size-4" />
            </button>
            <a
              href="https://chromewebstore.google.com/detail/dmmhkdcmifenlihbbhihkagnebgiekep?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              className="aix-cta-btn"
            >
              <Puzzle className="size-4" />
              {t("home.hero.chromeExtension")}
            </a>
            <button type="button" className="aix-cta-btn" onClick={onBrowse}>
              {t("home.hero.cta2")}
            </button>
          </div>

          <div className="aix-hero-stats">
            <div className="aix-stat">
              <b>
                30<em>s</em>
              </b>
              <span>{t("home.hero.stat1Label")}</span>
            </div>
            <div className="aix-stat lime">
              <b>0</b>
              <span>{t("home.hero.stat2Label")}</span>
            </div>
            <div className="aix-stat ink">
              <b>
                7<em>d</em>
              </b>
              <span>{t("home.hero.stat3Label")}</span>
            </div>
          </div>
        </div>

        <div className="aix-hero-visual" aria-hidden="true">
          <div className="aix-hero-contour" />
          <div className="aix-hero-browser">
            <div className="bar">
              <i />
              <i />
              <i />
              <span className="url">
                100mini.com/<b>your-page</b>
              </span>
            </div>
            <div className="screen">
              <div className="sl w88" />
              <div className="sl w62" />
              <div className="code">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="sl w88" />
              <div className="sl w45" />
              <div className="chips">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
          <span className="aix-hero-badge">HTML → LINK</span>
          <span className="aix-hero-corner" />
        </div>
      </div>
    </section>
  );
}

const MemoHero = memo(HeroSection);

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isMember, points, pageCount, limit, refreshAuth } = useAuth();
  const uploadRef = useRef<HTMLElement>(null);

  const [mode, setMode] = useState<TabMode>("paste");
  const [htmlContent, setHtmlContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
  const [shareToSquare, setShareToSquare] = useState(false);
  const [expiry, setExpiry] = useState<UploadExpiryOptions>(DEFAULT_EXPIRY_OPTIONS);
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPointsConfirm, setShowPointsConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const contentSize = useMemo(
    () => (mode === "paste" ? new Blob([htmlContent]).size : file?.size ?? 0),
    [mode, htmlContent, file],
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 自定义地址防抖可用性检查（与服务端同一套校验规则，服务端仍会最终校验）
  useEffect(() => {
    const s = slug.trim();
    if (!s) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const r = await checkSlugAvailable(s);
        setSlugStatus(r.available ? "ok" : r.reason ?? "taken");
      } catch {
        // 检查失败不锁定状态，等待用户下次输入重试
        setSlugStatus("idle");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  // 配额费（非会员超出免费链接数）+ 尺寸费（内容超过 5MB）+ 自定义地址费，三者叠加
  const maxBytes = user ? MAX_USER_CONTENT_SIZE : MAX_CONTENT_SIZE;
  const isPermanentUpload = expiry.expiryPreset === "permanent" && expiry.maxViews == null;
  const fees = computeUploadFees({
    isAnonymous: !user,
    isMember,
    // 到期/限次（即焚）页面不占用永久配额 → 免配额费
    pageCount: isPermanentUpload ? pageCount : 0,
    userLimit: limit,
    contentBytes: contentSize,
    points,
    customSlug: !!slug.trim(),
  });
  const sizeFee = fees.sizeFee;
  const totalFee = fees.totalFee;
  const needsPoints = totalFee > 0;
  const canAffordPoints = fees.affordable;

  const canSubmit =
    (mode === "paste" ? htmlContent.trim().length > 0 : file !== null) &&
    (!user || title.trim().length > 0) &&
    contentSize <= maxBytes &&
    (!slug.trim() || slugStatus === "ok");

  const doSubmit = async () => {
    setLoading(true);
    setError(null);
    setShowPointsConfirm(false);

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
      if (user) {
        formData.append("expiryPreset", expiry.expiryPreset);
        if (expiry.expiryPreset === "custom" && expiry.expiryCustomMs) {
          formData.append("expiryCustomMs", String(expiry.expiryCustomMs));
        }
        formData.append("maxViews", expiry.maxViews == null ? "inf" : String(expiry.maxViews));
      }
      if (user && slug.trim()) {
        formData.append("customSlug", slug.trim());
      }

      const result = await uploadPage(formData);
      if (!result.ok) {
        throw new Error(result.error || t("common.error"));
      }

      setResult(result.data);
      // Refresh auth to update points and pageCount (await so the
      // deduction is reflected in the UI before we show success)
      await refreshAuth();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("common.errorRetry")
      );
    } finally {
      setLoading(false);
      setPendingSubmit(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (needsPoints) {
      if (!canAffordPoints) {
        setError(t("home.points.insufficient"));
        return;
      }
      setShowPointsConfirm(true);
      setPendingSubmit(true);
      return;
    }
    await doSubmit();
  };

  const handleReset = () => {
    setResult(null);
    setHtmlContent("");
    setFile(null);
    setTitle("");
    setTags([]);
    setShareToSquare(false);
    setExpiry(DEFAULT_EXPIRY_OPTIONS);
    setSlug("");
    setSlugStatus("idle");
    setError(null);
  };

  const scrollToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const browseSquare = useCallback(() => navigate({ to: "/square", search: { q: "" } }), [navigate]);

  if (result) {
    return (
      <div className="flex min-h-screen flex-col bg-[#ededed] dark:bg-[#0c0d0f]">
        <MemoAppNav />
        <main className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="aix aix-home w-full" style={{ padding: 0 }}>
            <style dangerouslySetInnerHTML={{ __html: AIX_CSS + HOME_CSS }} />
            <div className="aix-frame" style={{ maxWidth: 560, margin: "0 auto" }}>
              <SuccessCard
                url={result.url}
                expiresAt={result.expiresAt || undefined}
                isPermanent={result.isPermanent}
                pageId={result.id}
                onReset={handleReset}
                user={user}
                shareToSquare={result.isSharedToSquare}
                maxViews={result.maxViews}
                isOneTime={result.isOneTime}
              />
            </div>
          </div>
        </main>
        <MemoAppFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#ededed] dark:bg-[#0c0d0f]">
      <MemoAppNav />
      <main className="flex-1">
        <div className="aix aix-home">
          <style dangerouslySetInnerHTML={{ __html: AIX_CSS + HOME_CSS }} />
          <MemoHero onUpload={scrollToUpload} onBrowse={browseSquare} />

          {/* Upload area */}
          <section id="upload" ref={uploadRef} className="aix-frame" style={{ scrollMarginTop: 84 }}>
            <div className="aix-sec-head">
              <div>
                <div className="aix-section-num">01</div>
                <h2 className="aix-sec-title">{t("home.section.upload")}</h2>
              </div>
              <span className="aix-dot-sm" />
            </div>
            <p className="aix-body" style={{ marginBottom: 18 }}>{t("home.section.uploadDesc")}</p>
            <div className="mx-auto max-w-2xl">
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
            expiry={expiry}
            setExpiry={setExpiry}
            slug={slug}
            setSlug={setSlug}
            slugStatus={slugStatus}
            loading={loading}
            error={error}
            handleSubmit={handleSubmit}
            contentSize={contentSize}
            formatSize={formatSize}
            canSubmit={canSubmit}
            user={user}
            maxBytes={maxBytes}
            sizeFee={sizeFee}
          />
            </div>
          </section>

          <div className="aix-frame"><AgentSection /></div>
          <div className="aix-frame"><MemoStatsSection /></div>
          <div className="aix-frame"><MemoGuideSection /></div>
        </div>
      </main>
      <MemoAppFooter />

      {/* Points deduction confirmation dialog */}
      <Dialog open={showPointsConfirm} onOpenChange={setShowPointsConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("home.points.confirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("home.points.confirmDesc", { points: totalFee, remain: points - totalFee })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPointsConfirm(false); setPendingSubmit(false); }}>
              {t("common.cancel")}
            </Button>
            <Button onClick={doSubmit} disabled={loading}>
              {loading ? <><Loader2 className="size-4 animate-spin" /> {t("common.submitting")}</> : t("home.points.confirmBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
