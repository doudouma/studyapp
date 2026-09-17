import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, Share2 } from "lucide-react";
import { BASE_URL, DEFAULT_LANG, withLangPrefix } from "~/lib/lang";
import { ShareModal } from "~/components/share/ShareModal";
import type { ShowcaseCase } from "@shared/types/showcase";

/** 案例的永久 URL（英文单版本，恒在根路径，无语言前缀） */
export function canonicalCaseUrl(slug: string): string {
  return BASE_URL + withLangPrefix(DEFAULT_LANG, `/showcase/${slug}`);
}

const BTN =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-colors";
const BTN_PRIMARY = `${BTN} bg-[color:var(--sc-accent)] text-white hover:opacity-90`;
const BTN_SECONDARY = `${BTN} border border-[#cfcfcf] bg-white text-[#000000] hover:bg-[#ececec] dark:border-[#243244] dark:bg-[#0f1720] dark:text-[#c9d5e4] dark:hover:bg-[#151d2b]`;

/**
 * 案例主要动作：直接访问原站 + 分享（复用通用 ShareModal）。
 *
 * 不占版面：桌面端固定在视口右侧中部，移动端固定在视口底部，
 * 读到任何位置都能操作。强调色从祖先 `--sc-accent` 变量继承
 * （position: fixed 不影响 CSS 变量继承）。
 */
export function CaseActions({ item }: { item: ShowcaseCase }) {
  const { t } = useTranslation();
  const [shareOpen, setShareOpen] = useState(false);

  const share = (
    <button
      type="button"
      onClick={() => setShareOpen(true)}
      className={BTN_SECONDARY}
      style={{ boxShadow: "0 4px 14px -4px rgba(16,24,40,.22)" }}
    >
      <Share2 className="size-3.5 shrink-0" />
      {t("showcase.cite.share")}
    </button>
  );

  const visit = item.externalUrl ? (
    <a
      href={item.externalUrl}
      target="_blank"
      rel="noopener"
      className={BTN_PRIMARY}
      style={{ boxShadow: "0 4px 14px -4px rgba(16,24,40,.22)" }}
    >
      <ExternalLink className="size-3.5 shrink-0" />
      {t("showcase.cite.visit")}
    </a>
  ) : null;

  return (
    <>
      {/*
        桌面：视口右侧竖排，但**贴着正文栏的右边缘**而不是视口边缘。
        23.25rem = max-w-3xl/2 (24rem) − 详情页 px-6 (1.5rem) + 与正文栏的间距 (0.75rem)。
        lg 以下隐藏（此时窗口宽度 < 正文栏 + 按钮宽，会把按钮压在正文上）。
      */}
      <div className="fixed left-[calc(50%+23.25rem)] top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        {visit}
        {share}
      </div>

      {/* 移动端/平板：底部横排 */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-[#cfcfcf] bg-[#ffffff]/95 px-4 py-3 backdrop-blur lg:hidden dark:border-[#243244] dark:bg-[#0d1117]/95">
        {visit ? <span className="flex-1 [&>*]:w-full">{visit}</span> : null}
        <span className="flex-1 [&>*]:w-full">{share}</span>
      </div>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={canonicalCaseUrl(item.slug)}
        text={item.name}
        title={t("showcase.share.title")}
        subtitle={t("showcase.share.subtitle")}
        fileName={`${item.slug}.png`}
      />
    </>
  );
}
