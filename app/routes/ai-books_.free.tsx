import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Building2,
  Bot,
  ChevronDown,
  Code2,
  Compass,
  GraduationCap,
  Gamepad2,
  Info,
  Library,
  Route as PathIcon,
  Search,
  Star,
  Video,
  type LucideIcon,
} from "lucide-react";
import i18n from "~/lib/i18n";
import { BASE_URL, currentLang, withLangPrefix } from "~/lib/seo";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { AIX_CSS } from "~/components/aix/aix-styles";
import { BOOKS_CSS } from "~/components/aix/books-styles";
import {
  FREE_ITEMS,
  FREE_TOPICS,
  FREE_TOTAL,
  FREE_COURSE_COUNT,
  FREE_EBOOK_COUNT,
  FREE_GENERATED_AT,
  type FreeItem,
  type FreeKind,
  type FreeTopic,
} from "~/features/books/free-data";
import { LEARNING_PATH } from "~/features/books/free-path";
import { LearningPathCalculator } from "~/features/books/LearningPathCalculator";
import {
  FREE_RESOURCES,
  FREE_RESOURCE_COUNT,
  type FreeResource,
  type FreeResourceGroup,
  type ResourceLocale,
} from "~/features/books/free-resources";

type TypeFilter = "all" | FreeKind;
type TopicFilter = "all" | FreeTopic;
type SortKey = "reviews" | "rating" | "short";

const TYPE_OPTIONS: TypeFilter[] = ["all", "course", "ebook"];
const SORT_OPTIONS: SortKey[] = ["reviews", "rating", "short"];

const TOPIC_COUNTS = FREE_ITEMS.reduce<Record<string, number>>((acc, item) => {
  acc[item.topic] = (acc[item.topic] ?? 0) + 1;
  return acc;
}, {});

const numberFormat = new Intl.NumberFormat("en-US");

function fmt(n: number): string {
  return numberFormat.format(n || 0);
}

function short(n: number): string {
  const value = Number(n) || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

function sortItems(items: FreeItem[], sort: SortKey): FreeItem[] {
  const list = items.slice();
  if (sort === "rating") {
    return list.sort(
      (a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0),
    );
  }
  if (sort === "short") {
    return list.sort((a, b) => (a.minutes ?? 999) - (b.minutes ?? 999));
  }
  return list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
}

function courseBadge(item: FreeItem, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (item.minutes) {
    const hours = item.hours || (item.minutes / 60).toFixed(1);
    return t("freeLib.hoursBadge", { hours });
  }
  if (item.lectures) {
    return t("freeLib.lecturesBadge", { count: item.lectures });
  }
  return t("freeLib.freeBadge");
}

export const Route = createFileRoute("/ai-books_/free")({
  head: () => {
    const lang = currentLang();
    const pageUrl = BASE_URL + withLangPrefix(lang, "/ai-books/free");
    return {
      meta: [
        { title: i18n.t("freeLib.title") },
        { name: "description", content: i18n.t("freeLib.desc") },
        { name: "keywords", content: i18n.t("freeLib.keywords") },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("freeLib.title") },
        { property: "og:description", content: i18n.t("freeLib.desc") },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "100mini" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: i18n.t("freeLib.title") },
        { name: "twitter:description", content: i18n.t("freeLib.desc") },
      ],
      links: [
        { rel: "preconnect", href: "https://img-c.udemycdn.com" },
        { rel: "preconnect", href: "https://m.media-amazon.com" },
      ],
    };
  },
  component: FreeLibraryPage,
});

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`ab-chip${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ab-filterrow">
      <span>{label}</span>
      {children}
    </div>
  );
}

function ResourceSection({
  id,
  num,
  title,
  desc,
  items,
  lang,
  columns = "two",
}: {
  id: string;
  num: string;
  title: string;
  desc: string;
  items: FreeResource[];
  lang: ResourceLocale;
  columns?: "two" | "three";
}) {
  const { t } = useTranslation();
  return (
    <section id={id} className="free-section">
      <div className="aix-sec-head">
        <div>
          <div className="aix-section-num">{num}</div>
          <h2 className="aix-sec-title">{title}</h2>
        </div>
        <span className="aix-dot-sm" />
      </div>
      <p className="aix-body">{desc}</p>
      <div className={`free-res-grid${columns === "three" ? " three" : ""}`}>
        {items.map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noopener" className="free-res">
            <div className="free-res-top">
              <h3>{item.name}</h3>
              <span className="free-tag">{t(`freeLib.resTag.${item.tag}`)}</span>
            </div>
            <p className="free-by">{item.by}</p>
            <p className="free-desc">{item.desc[lang] ?? item.desc.en}</p>
            {item.cost && (
              <p className="free-cost">
                <span className="free-cost-label">{t("freeLib.costLabel")}</span>
                {item.cost[lang] ?? item.cost.en}
              </p>
            )}
            {item.review && (
              <div className="free-review">
                <p className="free-review-quote">{item.review.quote[lang] ?? item.review.quote.en}</p>
                <p className="free-review-meta">
                  {item.review.score && <b>{item.review.score}</b>}
                  <span>{item.review.source}</span>
                </p>
              </div>
            )}
            <span className="free-open">{t("freeLib.openResource")} →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function resourcesFor(group: FreeResourceGroup): FreeResource[] {
  return FREE_RESOURCES.filter((item) => item.group === group);
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active = false,
  external = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  external?: boolean;
}) {
  const className = `ab-nav-item${active ? " is-active" : ""}`;
  const content = (
    <>
      <Icon className="ic" />
      <span>{label}</span>
    </>
  );
  if (external) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {content}
    </Link>
  );
}

function TopicButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ab-topic${active ? " is-active" : ""}`}
    >
      <span>{label}</span>
      <span className="n">{fmt(count)}</span>
    </button>
  );
}

const FREE_CSS = `
.free-section{margin-top:34px;scroll-margin-top:130px}
.free-res-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:16px}
@media(min-width:640px){.free-res-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1280px){.free-res-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}}
.free-res{
  display:flex;flex-direction:column;gap:6px;min-height:150px;padding:14px;border:1px solid var(--aix-line);
  border-radius:2px;background:var(--aix-paper);color:inherit;text-decoration:none;transition:.15s;
}
.free-res:hover{border-color:var(--aix-ink);background:var(--aix-grey)}
.free-res-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.free-res h3{margin:0;font-size:13px;font-weight:800;line-height:1.35}
.free-tag{flex:none;background:var(--aix-lime);color:#111214;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:3px 6px;border-radius:2px}
.free-by{font-size:10.5px;color:var(--aix-mute)}
.free-desc{flex:1;font-size:12px;line-height:1.55;color:var(--aix-mute)}
.free-open{margin-top:auto;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--aix-ink)}
.free-res:hover .free-open{text-decoration:underline}
.free-review{margin-top:2px;padding-left:9px;border-left:2px solid var(--aix-lime)}.free-review-quote{margin:0;font-size:11px;line-height:1.5;color:var(--aix-ink);font-style:italic}
.free-review-quote::before{content:"“"}
.free-review-quote::after{content:"”"}
.free-review-meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin:4px 0 0;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--aix-mute)}
.free-review-meta b{font-weight:800;color:var(--aix-ink)}
.free-cost{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin:2px 0 0;padding:6px 8px;border:1px dashed var(--aix-line);font-size:10.5px;line-height:1.5;color:var(--aix-ink)}
.free-cost-label{flex:none;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--aix-mute)}


.free-rule{margin:14px 0 0;border:1px solid var(--aix-line);border-left:3px solid var(--aix-lime);background:var(--aix-grey);padding:12px 14px;font-size:12.5px;line-height:1.6;color:var(--aix-mute)}
.free-pathcards{display:grid;gap:10px;padding:14px}
@media(min-width:640px){.free-pathcards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1280px){.free-pathcards{grid-template-columns:repeat(3,minmax(0,1fr))}}
.free-pathcard{border:1px solid var(--aix-line);border-radius:2px;background:var(--aix-paper);padding:14px}
.free-kicker{display:inline-block;background:var(--aix-lime);color:#111214;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:2px 5px;border-radius:2px}
.free-pathcard h3{margin:8px 0 0;font-size:14px;font-weight:800;line-height:1.3}
.free-pathcard p{margin:4px 0 0;font-size:11.5px;line-height:1.55;color:var(--aix-mute)}
.free-pathcard ul{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}
.free-pathcard a{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px solid var(--aix-line);text-decoration:none}
.free-pathcard a:hover .name{text-decoration:underline}
.free-pathcard .name{font-size:11.5px;font-weight:700;color:var(--aix-ink)}
.free-pathcard .by2{display:block;font-size:10px;color:var(--aix-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.free-pathcard .tag{flex:none;font-size:9px;font-weight:700;background:var(--aix-grey);color:var(--aix-mute);padding:2px 5px;border-radius:2px}

.free-cards{display:grid;gap:18px 12px;padding:18px 0}
.free-cards.courses{grid-template-columns:1fr}
@media(min-width:640px){.free-cards.courses{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1280px){.free-cards.courses{grid-template-columns:repeat(3,minmax(0,1fr))}}
.free-cards.ebooks{grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:640px){.free-cards.ebooks{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:768px){.free-cards.ebooks{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(min-width:1024px){.free-cards.ebooks{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(min-width:1280px){.free-cards.ebooks{grid-template-columns:repeat(6,minmax(0,1fr))}}
.free-card{display:flex;min-width:0;flex-direction:column;color:inherit;text-decoration:none}
.free-cover{position:relative;overflow:hidden;border:1px solid var(--aix-line);border-radius:2px;background:var(--aix-grey);transition:.2s}
.free-cover.course{aspect-ratio:16/9}
.free-cover.ebook{aspect-ratio:3/4}
.free-card:hover .free-cover{transform:translateY(-3px);border-color:var(--aix-ink)}
.free-cover img{display:block;width:100%;height:100%;object-fit:cover}
.free-badge{position:absolute;bottom:6px;left:6px;background:#111214;color:var(--aix-lime);font-size:9px;font-weight:700;padding:2px 6px;border-radius:2px}
.free-card h3{margin:9px 0 0;font-size:12.5px;font-weight:800;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.free-card .by{margin:2px 0 0;font-size:10.5px;color:var(--aix-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.free-card .meta{margin:5px 0 0;display:flex;justify-content:space-between;gap:8px;font-size:10px;color:var(--aix-mute);white-space:nowrap}
.free-card .meta b{font-weight:800;color:var(--aix-ink)}
.dark .free-card .meta b{color:var(--aix-lime)}
.free-head-meta{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--aix-mute)}
.free-empty{padding:56px 0;text-align:center;font-size:12px;color:var(--aix-mute)}
.free-about{margin-top:36px;border-top:1px solid var(--aix-line);padding-top:16px;font-size:11px;line-height:1.6;color:var(--aix-mute);scroll-margin-top:130px}
.free-about strong{color:var(--aix-ink);font-weight:800}
.free-about a{color:var(--aix-ink);text-decoration:underline;text-underline-offset:2px}
`;

function FreeLibraryPage() {
  const { t } = useTranslation();
  const resourceLocale = currentLang();
  const [type, setType] = useState<TypeFilter>("all");
  const [topic, setTopic] = useState<TopicFilter>("all");
  const [sort, setSort] = useState<SortKey>("reviews");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") searchRef.current?.blur();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FREE_ITEMS.filter((item) => {
      if (topic !== "all" && item.topic !== topic) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.displayTitle,
        item.displayAuthor,
        item.provider,
        item.topic,
        t(`freeLib.topic.${item.topic}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [topic, query, t]);

  const courses = useMemo(
    () => sortItems(filtered.filter((item) => item.kind === "course"), sort),
    [filtered, sort],
  );
  const ebooks = useMemo(
    () => sortItems(filtered.filter((item) => item.kind === "ebook"), sort),
    [filtered, sort],
  );

  const showCourses = type !== "ebook";
  const showEbooks = type !== "course";

  // 话题按钮在侧边栏，结果列表在页面下方很多屏之外——点完不滚动的话
  // 视觉上完全没反应。选中话题后把滤镜区滚进视口，并让状态在列表旁也可见。
  const filtersRef = useRef<HTMLDivElement>(null);
  const selectTopic = useCallback((next: TopicFilter) => {
    setTopic(next);
    // 用即时滚动而不是 smooth：这里只求「点了有反馈」，smooth 在部分环境
    // （后台标签、减少动效设置）会被跳过，反而又变成「没反应」。
    filtersRef.current?.scrollIntoView({ block: "start" });
  }, []);

  const freeJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("freeLib.h1"),
    description: t("freeLib.desc"),
    url: BASE_URL + withLangPrefix(currentLang(), "/ai-books/free"),
    inLanguage: resourceLocale,
    dateModified: FREE_GENERATED_AT,
    isPartOf: { "@type": "WebSite", name: "100mini", url: BASE_URL },
    about: { "@type": "Thing", name: "Free AI courses and ebooks" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: FREE_TOTAL,
      itemListElement: FREE_ITEMS.slice()
        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        .slice(0, 10)
        .map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.displayTitle || item.title,
          url: item.url,
        })),
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#ededed] dark:bg-[#0c0d0f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(freeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AppNav />
      <main className="flex-1">
        <div className="aix">
          <style dangerouslySetInnerHTML={{ __html: AIX_CSS + BOOKS_CSS + FREE_CSS }} />

          {/* CATALOG */}
          <section className="aix-frame">
            <div className="aix-lead">
              <div>
                <div className="aix-topline">
                  <span className="aix-pill lime">
                    <span className="dot" />
                    {t("freeLib.freeLibrary")}
                  </span>
                </div>
                <h1>{t("freeLib.h1")}</h1>
                <p>{t("freeLib.intro")}</p>
              </div>
              <div className="aix-lead-meta">
                <span>
                  {t("freeLib.sideStats", {
                    courses: FREE_COURSE_COUNT,
                    ebooks: FREE_EBOOK_COUNT,
                    extras: FREE_RESOURCE_COUNT,
                  })}
                </span>
                <Link to="/ai-books">
                  {t("freeLib.allBooks")}
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
            <div className="ab-layout">
              <aside className="ab-side">
                <nav className="ab-nav">
                  <SidebarLink href="/ai-books" icon={Star} label={t("freeLib.allBooks")} />
                  <SidebarLink
                    href="/ai-books/free"
                    icon={Library}
                    label={t("freeLib.freeLibrary")}
                    active
                  />
                  <SidebarLink href="#start" icon={Compass} label={t("freeLib.startHere")} external />
                  <SidebarLink href="#path" icon={PathIcon} label={t("freeLib.learningPath")} external />
                  <SidebarLink
                    href="#courses"
                    icon={GraduationCap}
                    label={t("freeLib.freeCourses")}
                    external
                  />
                  <SidebarLink href="#ebooks" icon={BookOpen} label={t("freeLib.freeEbooks")} external />
                  <SidebarLink
                    href="#books"
                    icon={BookMarked}
                    label={t("freeLib.freeBooksPdf")}
                    external
                  />
                  <SidebarLink href="#repos" icon={Code2} label={t("freeLib.githubRepos")} external />
                  <SidebarLink href="#videos" icon={Video} label={t("freeLib.videoChannels")} external />
                  <SidebarLink
                    href="#games"
                    icon={Gamepad2}
                    label={t("freeLib.playAndLearn")}
                    external
                  />
                  <SidebarLink
                    href="#vendors"
                    icon={Building2}
                    label={t("freeLib.vendorCourses")}
                    external
                  />
                  <SidebarLink
                    href="#robotics"
                    icon={Bot}
                    label={t("freeLib.roboticsCourses")}
                    external
                  />
                  <SidebarLink href="#about" icon={Info} label={t("freeLib.about")} external />
                </nav>

                <div className="ab-label">{t("freeLib.topics")}</div>
                <div className="ab-nav">
                  <TopicButton
                    active={topic === "all"}
                    label={t("freeLib.topic.all")}
                    count={FREE_TOTAL}
                    onClick={() => selectTopic("all")}
                  />
                  {FREE_TOPICS.map((key) => (
                    <TopicButton
                      key={key}
                      active={topic === key}
                      label={t(`freeLib.topic.${key}`)}
                      count={TOPIC_COUNTS[key] ?? 0}
                      onClick={() => selectTopic(key)}
                    />
                  ))}
                </div>

                <p className="ab-side-note hidden lg:block">
                  {t("freeLib.sideStats", {
                    courses: FREE_COURSE_COUNT,
                    ebooks: FREE_EBOOK_COUNT,
                    extras: FREE_RESOURCE_COUNT,
                  })}
                  <br />
                  {t("freeLib.sideNote")}
                </p>
              </aside>

              <div className="min-w-0">
                <div className="ab-search">
                  <Search className="ic" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("freeLib.searchPlaceholder")}
                    autoComplete="off"
                  />
                  <kbd>/</kbd>
                </div>

                <ResourceSection
                  id="start"
                  num="01"
                  title={t("freeLib.section.start.title")}
                  desc={t("freeLib.section.start.desc")}
                  items={resourcesFor("start")}
                  lang={resourceLocale}
                  columns="three"
                />

                <section id="path" className="free-section">
                  <div className="aix-sec-head">
                    <div>
                      <div className="aix-section-num">02</div>
                      <h2 className="aix-sec-title">{t("freeLib.learningPath")}</h2>
                    </div>
                    <span className="aix-dot-sm" />
                  </div>
                  <p className="free-rule">{t("freeLib.pathRule")}</p>
                  <div className="aix-calc">
                    <LearningPathCalculator compact />
                  </div>

                  <details className="ab-details">
                    <summary>
                      <ChevronDown className="chev" />
                      <span>{t("freeLib.path.details")}</span>
                    </summary>
                    <div className="free-pathcards">
                      {LEARNING_PATH.map((stage) => (
                        <article key={stage.id} className="free-pathcard">
                          <span className="free-kicker">
                            {t(`freeLib.path.${stage.id}.kicker`)}
                          </span>
                          <h3>{t(`freeLib.path.${stage.id}.title`)}</h3>
                          <p>{t(`freeLib.path.${stage.id}.desc`)}</p>
                          <ul>
                            {stage.resources.map((resource) => (
                              <li key={resource.url + resource.name}>
                                <a href={resource.url} target="_blank" rel="noopener">
                                  <span className="min-w-0">
                                    <span className="name">{resource.name}</span>
                                    <span className="by2">{resource.by}</span>
                                  </span>
                                  <span className="tag">{resource.tag}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                    <p className="note">{t("freeLib.pathFoot")}</p>
                  </details>
                </section>

                <div className="ab-filters" style={{ marginTop: 28 }} ref={filtersRef}>
                  <FilterRow label={t("freeLib.typeLabel")}>
                    {TYPE_OPTIONS.map((value) => (
                      <Chip key={value} active={type === value} onClick={() => setType(value)}>
                        {t(`freeLib.type.${value}`)}
                      </Chip>
                    ))}
                  </FilterRow>
                  <FilterRow label={t("freeLib.topics")}>
                    <Chip active={topic === "all"} onClick={() => setTopic("all")}>
                      {t("freeLib.topic.all")}
                    </Chip>
                    {FREE_TOPICS.map((key) => (
                      <Chip key={key} active={topic === key} onClick={() => setTopic(key)}>
                        {t(`freeLib.topic.${key}`)}
                      </Chip>
                    ))}
                  </FilterRow>
                  <FilterRow label={t("freeLib.sortLabel")}>
                    {SORT_OPTIONS.map((value) => (
                      <Chip key={value} active={sort === value} onClick={() => setSort(value)}>
                        {t(`freeLib.sort.${value}`)}
                      </Chip>
                    ))}
                  </FilterRow>
                </div>

                {showCourses && (
                  <section id="courses" className="free-section">
                    <div className="aix-sec-head">
                      <div>
                        <div className="aix-section-num">03</div>
                        <h2 className="aix-sec-title">{t("freeLib.coursesTitle")}</h2>
                      </div>
                      <div className="free-head-meta">
                        <span>{t("freeLib.countFree", { count: courses.length })}</span>
                        <span className="free-tag">{t("freeLib.coursesBadge")}</span>
                      </div>
                    </div>
                    {courses.length === 0 ? (
                      <div className="free-empty">{t("freeLib.empty")}</div>
                    ) : (
                      <div className="free-cards courses">
                        {courses.map((item, index) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener"
                            className="free-card"
                          >
                            <div className="free-cover course">
                              <img
                                src={item.image}
                                alt={item.title}
                                loading={index < 6 ? undefined : "lazy"}
                                fetchPriority={index === 0 ? "high" : undefined}
                                decoding="async"
                              />
                              <span className="free-badge">{courseBadge(item, t)}</span>
                            </div>
                            <h3 title={item.title}>{item.displayTitle || item.title}</h3>
                            <p className="by">{item.displayAuthor || item.provider}</p>
                            <p className="meta">
                              <span>
                                ★ {Number(item.rating || 0).toFixed(1)} · {short(item.reviews)}
                              </span>
                              <b>{t("freeLib.viewCourse")} →</b>
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {showEbooks && (
                  <section id="ebooks" className="free-section">
                    <div className="aix-sec-head">
                      <div>
                        <div className="aix-section-num">04</div>
                        <h2 className="aix-sec-title">{t("freeLib.ebooksTitle")}</h2>
                      </div>
                      <div className="free-head-meta">
                        <span>{t("freeLib.countFree", { count: ebooks.length })}</span>
                        <span className="free-tag">{t("freeLib.ebooksBadge")}</span>
                      </div>
                    </div>
                    {ebooks.length === 0 ? (
                      <div className="free-empty">{t("freeLib.empty")}</div>
                    ) : (
                      <div className="free-cards ebooks">
                        {ebooks.map((item, index) => (
                          <a
                            key={item.id}
                            href={`${item.url}&ascsubtag=free-${item.id}-${index + 1}`}
                            target="_blank"
                            rel="nofollow sponsored noopener"
                            className="free-card"
                          >
                            <div className="free-cover ebook">
                              <img
                                src={item.image}
                                alt={item.title}
                                loading={index < 8 ? undefined : "lazy"}
                                fetchPriority={index === 0 ? "high" : undefined}
                                decoding="async"
                              />
                              <span className="free-badge">{t("freeLib.freeBadge")}</span>
                            </div>
                            <h3 title={item.title}>{item.displayTitle || item.title}</h3>
                            <p className="by">{item.displayAuthor || "—"}</p>
                            <p className="meta">
                              <span>
                                ★ {Number(item.rating || 0).toFixed(1)} · {short(item.reviews)}
                              </span>
                              <b>{t("freeLib.getAmazon")} →</b>
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <ResourceSection
                  id="books"
                  num="05"
                  title={t("freeLib.section.books.title")}
                  desc={t("freeLib.section.books.desc")}
                  items={resourcesFor("books")}
                  lang={resourceLocale}
                />

                <ResourceSection
                  id="repos"
                  num="06"
                  title={t("freeLib.section.repos.title")}
                  desc={t("freeLib.section.repos.desc")}
                  items={resourcesFor("repos")}
                  lang={resourceLocale}
                />

                <ResourceSection
                  id="videos"
                  num="07"
                  title={t("freeLib.section.videos.title")}
                  desc={t("freeLib.section.videos.desc")}
                  items={resourcesFor("videos")}
                  lang={resourceLocale}
                  columns="three"
                />

                <ResourceSection
                  id="games"
                  num="08"
                  title={t("freeLib.section.games.title")}
                  desc={t("freeLib.section.games.desc")}
                  items={resourcesFor("games")}
                  lang={resourceLocale}
                  columns="three"
                />

                <ResourceSection
                  id="vendors"
                  num="09"
                  title={t("freeLib.section.vendors.title")}
                  desc={t("freeLib.section.vendors.desc")}
                  items={resourcesFor("vendors")}
                  lang={resourceLocale}
                  columns="three"
                />

                <ResourceSection
                  id="robotics"
                  num="10"
                  title={t("freeLib.section.robotics.title")}
                  desc={t("freeLib.section.robotics.desc")}
                  items={resourcesFor("robotics")}
                  lang={resourceLocale}
                  columns="three"
                />

                <footer id="about" className="free-about">
                  <strong>{t("freeLib.disclosureTitle")}</strong>{" "}
                  {t("freeLib.disclosure", { date: FREE_GENERATED_AT })}{" "}
                  <Link to="/ai-books">{t("freeLib.browsePaid")}</Link>
                </footer>
              </div>
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
