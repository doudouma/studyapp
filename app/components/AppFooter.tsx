import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="w-full border-t border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#0b1c30]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 pt-6 pb-3 md:flex-row">
        <div className="flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="size-4 text-[#006c49] dark:text-[#4edea3]" />
            <span className="text-sm font-bold text-[#006c49] dark:text-[#4edea3]">100mini</span>
             <p className="text-xs text-muted-foreground">
            {t("footer.tagline")}
          </p>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            to="/freetool"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.tools")}
          </Link>
          <Link
            to="/showcase"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.showcase")}
          </Link>
          <Link
            to="/contact"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.contact")}
          </Link>
          <Link
            to="/terms"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.terms")}
          </Link>
          <Link
            to="/privacy"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.privacy")}
          </Link>
          <Link
            to="/cookie"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.cookie")}
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-6 pb-6">
        {/* 目录站/徽章互链：显式标注 sponsored + nofollow。
            这三个链接出现在全站共享页脚，N 个页面 × 3 条即跨全站 dofollow 外链，
            会触发 link spam 判定（降权的是链接来源站，也就是我们自己）。 */}
        <a
          href="https://mossai.org"
          title="MossAI Tools"
          target="_blank"
          rel="sponsored nofollow noopener"
          className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
        >
          MossAI Tools
        </a>
        <a
          href="https://dironix.com"
          target="_blank"
          rel="sponsored nofollow noopener"
          className="inline-flex items-center"
        >
          <img src="https://dironix.com/bage.png" alt="Featured on dironix.com" style={{ height: 20, width: "auto" }} />
        </a>
        <a
          href="https://gets.tools"
          target="_blank"
          rel="sponsored nofollow noopener"
          className="inline-flex items-center"
        >
          <img src="https://gets.tools/badge/badge_light.svg" alt="Featured on Gets.Tools" style={{ height: 20, width: "auto" }} />
        </a>
      </div>
    </footer>
  );
}
