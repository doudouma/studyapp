import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * 目录站徽章：图片加载失败时回退成文字。
 * 徽章图是对方站点的外链，可能挂掉或被墙；只放 <img> 的话加载失败会渲染成一个
 * 空锚点，页面上看起来这条外链「消失了」。回退文字保证链接始终可见。
 */
function TextLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      title={label}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
    >
      {label}
    </a>
  );
}

function BadgeLink({
  href,
  imgSrc,
  label,
  width,
  height,
  rel = "sponsored nofollow noopener",
  eager = false,
}: {
  href: string;
  imgSrc: string;
  label: string;
  width?: number;
  height?: number;
  rel?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      {...(rel ? { rel } : {})}
      className="inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
    >
      {failed ? (
        label
      ) : (
        <img
          src={imgSrc}
          alt={label}
          width={width}
          height={height}
          style={
            width || height
              ? { width: width ?? "auto", height: height ?? "auto" }
              : { height: 24, width: "auto" }
          }
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      )}
    </a>
  );
}

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
            to="/games"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.games")}
          </Link>
          <Link
            to="/showcase"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.showcase")}
          </Link>
          <Link
            to="/alternatives"
            className="text-xs text-muted-foreground transition-colors hover:text-[#006c49] dark:hover:text-[#4edea3]"
          >
            {t("footer.alternatives")}
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
            这些链接出现在全站共享页脚，N 个页面 × N 条即跨全站 dofollow 外链，
            会触发 link spam 判定（降权的是链接来源站，也就是我们自己）。 */}
        <TextLink href="https://mossai.org" label="MossAI Tools" />
        <TextLink href="https://realisticai.io" label="Realistic AI" />
        {/* <BadgeLink
          href="https://dironix.com"
          imgSrc="https://dironix.com/bage.png"
          label="dironix.com"
        /> */}
        <BadgeLink
          href="https://gets.tools"
          imgSrc="https://gets.tools/badge/badge_light.svg"
          label="Gets.Tools"
        />
        <BadgeLink
          href="https://goodaitools.com/ai/100mini"
          imgSrc="https://goodaitools.com/assets/images/badge.png"
          label="Good AI Tools"
        />
        <BadgeLink
          href="https://startupfa.me/s/100mini?utm_source=100mini.com"
          imgSrc="https://startupfa.me/badges/featured/default.webp"
          label="100mini - Featured on Startup Fame"
          width={76}
          height={24}
          rel=""
          eager
        />
        <BadgeLink
          href="https://deeplaunch.io"
          imgSrc="https://deeplaunch.io/badge/badge_light.svg"
          label="DeepLaunch.io"
        />
        <BadgeLink
          href="https://tooldirs.com"
          imgSrc="https://tooldirs.com/badge/badge_light.svg"
          label="Featured on ToolDirs"
        />
        <BadgeLink
          href="https://firstlook.tools"
          imgSrc="https://firstlook.tools/badge/badge_transparent.svg"
          label="Featured on First Look"
        />
        <BadgeLink
          href="https://shipgrowth.dev"
          imgSrc="https://storage.shipgrowth.dev/badge-light.png"
          label="Featured on ShipGrowth"
        />
        <BadgeLink
          href="https://submitaitools.org"
          imgSrc="https://submitaitools.org/static_submitaitools/images/submitaitools.png"
          label="Submit AI Tools"
        />
        <BadgeLink
          href="https://launchigniter.com/product/100mini-instant-html-hosting-no-signup?ref=badge-100mini-instant-html-hosting-no-signup"
          imgSrc="https://launchigniter.com/api/badge/100mini-instant-html-hosting-no-signup?theme=light"
          label="Featured on LaunchIgniter"
        />
        <BadgeLink
          href="https://startuptrusted.com?ref=100mini.com"
          imgSrc="https://startuptrusted.com/api/badge?type=featured&style=light"
          label="100mini on StartupTrusted"
        />
        <BadgeLink
          href="https://doforai.tools"
          imgSrc="https://doforai.tools/badge/feature-badge-white.webp"
          label="Featured on doforai.tools"
        />
        <BadgeLink
          href="https://findly.tools/100mini?utm_source=100mini"
          imgSrc="https://findly.tools/badges/findly-tools-badge-light.svg"
          label="Featured on Findly.tools"
          width={76}
          height={24}
          rel="noopener noreferrer"
        />
        <BadgeLink
          href="https://productwatch.io/products/100mini?utm_source=badge"
          imgSrc="https://productwatch.io/backend/api/v1/badge/featured?productId=2fbe6162-b55b-41a9-97e7-808b630e264e&darkMode=false"
          label="Featured on ProductWatch"
          width={116}
          height={24}
          rel=""
        />
        <BadgeLink
          href="https://tinylaunch.com"
          imgSrc="https://tinylaunch.com/tinylaunch_badge_featured_on.svg"
          label="Featured on TinyLaunch"
          width={79}
          height={24}
          rel="noopener"
        />
        {/* Fazier 校验器要求链接不含 nofollow，故此处用 rel="noopener"（跟随链接）。 */}
        <BadgeLink
          href="https://fazier.com/launches/100mini.com"
          imgSrc="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light"
          label="Featured on Fazier"
          rel="noopener"
        />
      </div>
    </footer>
  );
}
