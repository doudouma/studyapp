import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="w-full border-t border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#0b1c30]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
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
    </footer>
  );
}
