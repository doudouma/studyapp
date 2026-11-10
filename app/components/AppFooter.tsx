import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const FOOTER_LINK =
  "text-[11px] text-muted-foreground transition-colors hover:text-[#111214] dark:hover:text-[#d8ff00]";

function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#111214] dark:text-[#ededed]">
        {title}
      </h2>
      <ul className="mt-2 space-y-1.5">{children}</ul>
    </div>
  );
}

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
      className="text-[11px] text-muted-foreground transition-colors hover:text-[#111214] dark:hover:text-[#d8ff00]"
    >
      {label}
    </a>
  );
}

const BADGE_HEIGHT = 24;
const BADGE_WIDTH = 116;

function BadgeLink({
  href,
  imgSrc,
  label,
  rel = "sponsored nofollow noopener",
  eager = false,
  width = BADGE_WIDTH,
  height = BADGE_HEIGHT,
}: {
  href: string;
  imgSrc: string;
  label: string;
  rel?: string;
  eager?: boolean;
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      {...(rel ? { rel } : {})}
      style={{ height }}
      className="inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-[#111214] dark:hover:text-[#d8ff00]"
    >
      {failed ? (
        <span className="inline-flex items-center leading-6" style={{ height }}>{label}</span>
      ) : (
        <img
          src={imgSrc}
          alt={label}
          width={width}
          height={height}
          style={{ height, width: "auto", maxWidth: "100%" }}
          className="block shrink-0 object-contain"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </a>
  );
}

export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="aix-footer w-full border-t border-[#e3e3e3] bg-[#ededed] dark:border-[#2a2d32] dark:bg-[#0c0d0f]">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <Code2 className="size-4 text-[#111214] dark:text-[#d8ff00]" />
              <span className="text-[15px] font-extrabold uppercase tracking-[0.16em] text-[#111214] dark:text-[#ededed]">100mini</span>
            </Link>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <FooterGroup title={t("footer.group.product")}>
            <li><Link to="/freetool" className={FOOTER_LINK}>{t("footer.tools")}</Link></li>
            <li><Link to="/games" className={FOOTER_LINK}>{t("footer.games")}</Link></li>
            <li><Link to="/showcase" className={FOOTER_LINK}>{t("footer.showcase")}</Link></li>
            <li><Link to="/100-questions" className={FOOTER_LINK}>{t("footer.questions")}</Link></li>
            <li><Link to="/ai-books" className={FOOTER_LINK}>{t("footer.aiBooks")}</Link></li>
            <li><Link to="/ai-books/free" className={FOOTER_LINK}>{t("footer.freeLibrary")}</Link></li>
          </FooterGroup>

          <FooterGroup title={t("footer.group.company")}>
            <li><Link to="/alternatives" className={FOOTER_LINK}>{t("footer.alternatives")}</Link></li>
            <li><Link to="/contact" className={FOOTER_LINK}>{t("footer.contact")}</Link></li>
          </FooterGroup>

          <FooterGroup title={t("footer.group.legal")}>
            <li><Link to="/terms" className={FOOTER_LINK}>{t("footer.terms")}</Link></li>
            <li><Link to="/privacy" className={FOOTER_LINK}>{t("footer.privacy")}</Link></li>
            <li><Link to="/cookie" className={FOOTER_LINK}>{t("footer.cookie")}</Link></li>
          </FooterGroup>
        </div>

        <div className="mt-8 border-t border-[#e3e3e3] pt-5 dark:border-[#2a2d32]">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {t("footer.featured")}
          </p>
          <div className="mt-3 grid grid-cols-2 justify-items-center gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-5">
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
              rel="noopener"
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
              rel=""
              eager
            />
            <BadgeLink
              href="https://deeplaunch.io"
              imgSrc="https://deeplaunch.io/badge/badge_light.svg"
              label="DeepLaunch.io"
              rel="noopener"
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
              rel="noopener"
            />
            <BadgeLink
              href="https://turbo0.com/item/100mini"
              imgSrc="https://img.turbo0.com/badge-listed-light.svg"
              label="Listed on Turbo0"
              rel="noopener noreferrer"
            />
            <BadgeLink
              href="https://uno.directory"
              imgSrc="https://uno.directory/uno-directory.svg"
              label="Listed on Uno Directory"
              rel="noopener"
            />
            <BadgeLink
              href="https://toolfame.com/item/100mini"
              imgSrc="https://toolfame.com/badge-light.svg"
              label="Listed on ToolFame"
              rel="noopener noreferrer"
            />
            <BadgeLink
              href="https://launchbuff.com/products/100mini-a5vq73"
              imgSrc="https://launchbuff.com/badge-featured-dark.svg"
              label="Featured on LaunchBuff"
              rel="noopener noreferrer"
            />
            <BadgeLink
              href="https://saasfame.com/item/100mini"
              imgSrc="https://saasfame.com/badge-light.svg"
              label="Featured on SaaSFame"
              rel="noopener noreferrer"
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
              rel="noopener noreferrer"
            />
            <BadgeLink
              href="https://productwatch.io/products/100mini?utm_source=badge"
              imgSrc="https://productwatch.io/backend/api/v1/badge/featured?productId=2fbe6162-b55b-41a9-97e7-808b630e264e&darkMode=false"
              label="Featured on ProductWatch"
              rel=""
            />
            <BadgeLink
              href="https://tinylaunch.com"
              imgSrc="https://tinylaunch.com/tinylaunch_badge_featured_on.svg"
              label="Featured on TinyLaunch"
              rel="noopener"
            />
            {/* Fazier 校验器要求链接不含 nofollow，故此处用 rel="noopener"（跟随链接）。 */}
            <BadgeLink
              href="https://fazier.com/launches/100mini.com"
              imgSrc="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light"
              label="Featured on Fazier"
              rel="noopener"
            />
            <BadgeLink
              href="https://dofollow.tools"
              imgSrc="https://dofollow.tools/badge/badge_light.svg"
              label="Featured on Dofollow.Tools"
              rel="noopener"
            />
            <BadgeLink
              href="https://inventlist.com/sites/instant-html-hosting"
              imgSrc="https://inventlist.com/sites/instant-html-hosting/badge/listed"
              label="Listed on InventList"
              rel="noopener"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
