import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  BookMarked,
  BookOpen,
  Code2,
  Compass,
  GraduationCap,
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
      className={
        active
          ? "h-[30px] whitespace-nowrap rounded-full border border-primary bg-primary px-3.5 text-xs font-medium text-primary-foreground"
          : "h-[30px] whitespace-nowrap rounded-full border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-14 text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function ResourceSection({
  id,
  title,
  desc,
  items,
  lang,
  columns = "sm:grid-cols-2",
}: {
  id: string;
  title: string;
  desc: string;
  items: FreeResource[];
  lang: ResourceLocale;
  columns?: string;
}) {
  const { t } = useTranslation();
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <div className="border-b border-border pb-2">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <div className={`mt-4 grid gap-3 ${columns}`}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener"
            className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {item.name}
              </h3>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {t(`freeLib.resTag.${item.tag}`)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.by}</p>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
              {item.desc[lang] ?? item.desc.en}
            </p>
            <span className="mt-3 text-xs font-semibold text-primary group-hover:underline">
              {t("freeLib.openResource")} →
            </span>
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
  const className = active
    ? "flex w-auto shrink-0 items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary lg:w-full"
    : "flex w-auto shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:w-full";
  const content = (
    <>
      <Icon className="size-4 shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
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
      className={
        active
          ? "flex shrink-0 items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-foreground lg:w-full"
          : "flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:w-full"
      }
    >
      <span className="whitespace-nowrap">{label}</span>
      <span className="text-xs tabular-nums text-muted-foreground">{fmt(count)}</span>
    </button>
  );
}

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
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(freeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
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
                <SidebarLink href="#books" icon={BookMarked} label={t("freeLib.freeBooksPdf")} external />
                <SidebarLink href="#repos" icon={Code2} label={t("freeLib.githubRepos")} external />
                <SidebarLink href="#videos" icon={Video} label={t("freeLib.videoChannels")} external />
                <SidebarLink href="#about" icon={Info} label={t("freeLib.about")} external />
              </nav>

              <p className="mt-6 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:block">
                {t("freeLib.topics")}
              </p>
              <div className="mt-1 flex gap-1.5 overflow-x-auto pb-3 lg:mt-1.5 lg:flex-col lg:gap-px lg:overflow-visible lg:pb-0">
                <TopicButton
                  active={topic === "all"}
                  label={t("freeLib.topic.all")}
                  count={FREE_TOTAL}
                  onClick={() => setTopic("all")}
                />
                {FREE_TOPICS.map((key) => (
                  <TopicButton
                    key={key}
                    active={topic === key}
                    label={t(`freeLib.topic.${key}`)}
                    count={TOPIC_COUNTS[key] ?? 0}
                    onClick={() => setTopic(key)}
                  />
                ))}
              </div>

              <div className="mt-7 hidden px-3 text-xs leading-relaxed text-muted-foreground lg:block">
                <div>
                  {t("freeLib.sideStats", {
                    courses: FREE_COURSE_COUNT,
                    ebooks: FREE_EBOOK_COUNT,
                    extras: FREE_RESOURCE_COUNT,
                  })}
                </div>
                <div className="mt-2">{t("freeLib.sideNote")}</div>
              </div>
            </aside>

            <section className="min-w-0">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("freeLib.searchPlaceholder")}
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                  /
                </kbd>
              </div>

              <div className="mt-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("freeLib.h1")}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {t("freeLib.intro")}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {t("freeLib.intro2")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    t("freeLib.stat.courses", { count: FREE_COURSE_COUNT }),
                    t("freeLib.stat.ebooks", { count: FREE_EBOOK_COUNT }),
                    t("freeLib.stat.extras", { count: FREE_RESOURCE_COUNT }),
                    t("freeLib.stat.topics", { count: FREE_TOPICS.length }),
                  ].map((stat) => (
                    <span
                      key={stat}
                      className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
                <div className="mt-4 max-w-3xl rounded-xl border border-border bg-card px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">
                    {t("freeLib.method.title")}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
                    <li>• {t("freeLib.method.sources")}</li>
                    <li>• {t("freeLib.method.filter")}</li>
                    <li>• {t("freeLib.method.update")}</li>
                  </ul>
                </div>
              </div>

              <ResourceSection
                id="start"
                title={t("freeLib.section.start.title")}
                desc={t("freeLib.section.start.desc")}
                items={resourcesFor("start")}
                lang={resourceLocale}
                columns="sm:grid-cols-2 xl:grid-cols-3"
              />

              <section id="path" className="mt-10 scroll-mt-24">
                <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {t("freeLib.pathRule")}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {LEARNING_PATH.map((stage) => (
                    <article
                      key={stage.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                        {t(`freeLib.path.${stage.id}.kicker`)}
                      </span>
                      <h2 className="mt-1 text-base font-semibold text-foreground">
                        {t(`freeLib.path.${stage.id}.title`)}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {t(`freeLib.path.${stage.id}.desc`)}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {stage.resources.map((resource) => (
                          <li key={resource.url + resource.name}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener"
                              className="group flex items-start justify-between gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-medium text-foreground group-hover:text-primary">
                                  {resource.name}
                                </span>
                                <span className="block truncate text-[11px] text-muted-foreground">
                                  {resource.by}
                                </span>
                              </span>
                              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {resource.tag}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t("freeLib.pathFoot")}
                </p>
              </section>

              <div className="mt-8 flex flex-col gap-2.5">
                <FilterRow label={t("freeLib.typeLabel")}>
                  {TYPE_OPTIONS.map((value) => (
                    <Chip key={value} active={type === value} onClick={() => setType(value)}>
                      {t(`freeLib.type.${value}`)}
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
                <section id="courses" className="mt-8 scroll-mt-24">
                  <div className="flex flex-wrap items-center gap-3 border-b border-border pb-2">
                    <h2 className="text-lg font-bold text-foreground">{t("freeLib.coursesTitle")}</h2>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {t("freeLib.countFree", { count: courses.length })}
                    </span>
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {t("freeLib.coursesBadge")}
                    </span>
                  </div>
                  {courses.length === 0 ? (
                    <div className="py-14 text-center text-sm text-muted-foreground">
                      {t("freeLib.empty")}
                    </div>
                  ) : (
                    <div className="grid gap-x-4 gap-y-6 py-5 sm:grid-cols-2 xl:grid-cols-3">
                      {courses.map((item, index) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener"
                          className="group flex min-w-0 flex-col"
                        >
                          <div className="relative aspect-video overflow-hidden rounded-md bg-muted shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                            <img
                              src={item.image}
                              alt={item.title}
                              loading={index < 6 ? undefined : "lazy"}
                              fetchPriority={index === 0 ? "high" : undefined}
                              decoding="async"
                              className="size-full object-cover"
                            />
                            <span className="absolute bottom-2 left-2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10.5px] text-white">
                              {courseBadge(item, t)}
                            </span>
                          </div>
                          <h3
                            className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground"
                            title={item.title}
                          >
                            {item.displayTitle || item.title}
                          </h3>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {item.displayAuthor || item.provider}
                          </p>
                          <p className="mt-1.5 flex items-center justify-between gap-2 whitespace-nowrap text-[11px] text-muted-foreground/80">
                            <span>
                              ★ {Number(item.rating || 0).toFixed(1)} · {short(item.reviews)}
                            </span>
                            <span className="font-semibold text-primary group-hover:underline">
                              {t("freeLib.viewCourse")}
                            </span>
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {showEbooks && (
                <section id="ebooks" className="mt-8 scroll-mt-24">
                  <div className="flex flex-wrap items-center gap-3 border-b border-border pb-2">
                    <h2 className="text-lg font-bold text-foreground">{t("freeLib.ebooksTitle")}</h2>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {t("freeLib.countFree", { count: ebooks.length })}
                    </span>
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {t("freeLib.ebooksBadge")}
                    </span>
                  </div>
                  {ebooks.length === 0 ? (
                    <div className="py-14 text-center text-sm text-muted-foreground">
                      {t("freeLib.empty")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-6 py-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {ebooks.map((item, index) => (
                        <a
                          key={item.id}
                          href={`${item.url}&ascsubtag=free-${item.id}-${index + 1}`}
                          target="_blank"
                          rel="nofollow sponsored noopener"
                          className="group flex min-w-0 flex-col"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                            <img
                              src={item.image}
                              alt={item.title}
                              loading={index < 8 ? undefined : "lazy"}
                              fetchPriority={index === 0 ? "high" : undefined}
                              decoding="async"
                              className="size-full object-cover"
                            />
                            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10.5px] font-semibold text-primary-foreground">
                              {t("freeLib.freeBadge")}
                            </span>
                          </div>
                          <h3
                            className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground"
                            title={item.title}
                          >
                            {item.displayTitle || item.title}
                          </h3>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {item.displayAuthor || "—"}
                          </p>
                          <p className="mt-1.5 flex items-center justify-between gap-2 whitespace-nowrap text-[11px] text-muted-foreground/80">
                            <span>
                              ★ {Number(item.rating || 0).toFixed(1)} · {short(item.reviews)}
                            </span>
                            <span className="font-semibold text-primary group-hover:underline">
                              {t("freeLib.getAmazon")}
                            </span>
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <ResourceSection
                id="books"
                title={t("freeLib.section.books.title")}
                desc={t("freeLib.section.books.desc")}
                items={resourcesFor("books")}
                lang={resourceLocale}
              />

              <ResourceSection
                id="repos"
                title={t("freeLib.section.repos.title")}
                desc={t("freeLib.section.repos.desc")}
                items={resourcesFor("repos")}
                lang={resourceLocale}
              />

              <ResourceSection
                id="videos"
                title={t("freeLib.section.videos.title")}
                desc={t("freeLib.section.videos.desc")}
                items={resourcesFor("videos")}
                lang={resourceLocale}
                columns="sm:grid-cols-2 xl:grid-cols-3"
              />

              <footer
                id="about"
                className="mt-6 scroll-mt-24 border-t border-border pb-2 pt-5 text-xs leading-relaxed text-muted-foreground"
              >
                <strong className="font-semibold text-foreground">
                  {t("freeLib.disclosureTitle")}
                </strong>{" "}
                {t("freeLib.disclosure", { date: FREE_GENERATED_AT })}{" "}
                <Link to="/ai-books" className="underline underline-offset-2 hover:text-primary">
                  {t("freeLib.browsePaid")}
                </Link>
              </footer>
            </section>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
