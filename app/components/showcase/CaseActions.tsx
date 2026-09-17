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

const ACTION_BTN =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-bold transition-colors";

/** 案例标题下的主要动作：直接访问原站 + 分享（复用通用 ShareModal） */
export function CaseActions({ item }: { item: ShowcaseCase }) {
  const { t } = useTranslation();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {item.externalUrl ? (
        <a
          href={item.externalUrl}
          target="_blank"
          rel="noopener"
          className={`${ACTION_BTN} bg-[color:var(--sc-accent)] text-white hover:opacity-90`}
        >
          <ExternalLink className="size-3.5" />
          {t("showcase.cite.visit")}
        </a>
      ) : null}

      <button
        type="button"
        onClick={() => setShareOpen(true)}
        className={`${ACTION_BTN} border border-[#d9d9d0] bg-white text-[#26302b] hover:bg-[#f1f1ea] dark:border-[#243244] dark:bg-[#0f1720] dark:text-[#c9d5e4] dark:hover:bg-[#151d2b]`}
      >
        <Share2 className="size-3.5" />
        {t("showcase.cite.share")}
      </button>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={canonicalCaseUrl(item.slug)}
        text={item.name}
        title={t("showcase.share.title")}
        subtitle={t("showcase.share.subtitle")}
        fileName={`${item.slug}.png`}
      />
    </div>
  );
}
