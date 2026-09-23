import { describe, it, expect, beforeAll } from "vitest";
import { loadCase, loadCases } from "../shared/showcase";
import type { ShowcaseCase } from "../shared/types/showcase";
import { loadLocale } from "../app/lib/i18n";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildCaseHead,
  caseUrl,
} from "../app/features/showcase/seo";

// i18n 按需加载 + 案例内容按语言懒加载：测试里显式加载一次
let SAMPLE: ShowcaseCase;
let ALL: ShowcaseCase[];

beforeAll(async () => {
  await loadLocale("en");
  await loadLocale("zh");
  ALL = await loadCases("en");
  SAMPLE = (await loadCase("photon", "en"))!;
});

describe("caseUrl", () => {
  it("omits the prefix for en and adds it for other locales", () => {
    expect(caseUrl("photon", "en")).toBe("https://100mini.com/showcase/photon");
    expect(caseUrl("photon", "zh")).toBe("https://100mini.com/zh/showcase/photon");
  });
});

describe("case detail Article structured data", () => {
  it("carries what Google's Article rich result needs", () => {
    const url = caseUrl(SAMPLE.slug, SAMPLE.locale);
    const a = buildArticleJsonLd(SAMPLE, url) as any;

    expect(a["@type"]).toBe("Article");
    expect(a["@id"]).toBe(`${url}#article`);
    expect(a.headline).toBe(SAMPLE.name);
    expect(a.description).toBe(SAMPLE.summary);
    expect(a.url).toBe(url);
    expect(a.mainEntityOfPage["@id"]).toBe(url);
    expect(a.datePublished).toBe(SAMPLE.publishedAt);
    expect(a.dateModified).toBe(SAMPLE.updatedAt ?? SAMPLE.publishedAt);
    // image 必须是绝对 URL 的 ImageObject，且带 1200×630 尺寸
    expect(a.image).toMatchObject({ "@type": "ImageObject", width: 1200, height: 630 });
    expect(a.image.url).toMatch(/^https:\/\//);
    // publisher.logo 是可选增强，但必须存在且为绝对 URL
    expect(a.publisher.logo.url).toMatch(/^https:\/\//);
    // author 是 Article 富结果的推荐项，缺作者时必须回退站点
    expect(a.author.name).toBeTruthy();
    expect(a.isAccessibleForFree).toBe(true);
    expect(a.breadcrumb["@id"]).toBe(`${url}#breadcrumb`);
  });

  it("gives every case an absolute image and a non-empty author", () => {
    for (const c of ALL) {
      const a = buildArticleJsonLd(c, caseUrl(c.slug, c.locale)) as any;
      expect(a.image.url, `${c.slug} image`).toMatch(/^https:\/\//);
      expect(a.author.name, `${c.slug} author`).toBeTruthy();
    }
  });

  it("makes VideoObject valid with an uploadDate when a real video exists", () => {
    const GIF = /\.gif($|[?#])/i;
    const withVideo = ALL.filter((c) => c.cover.video && !GIF.test(c.cover.video!));
    expect(withVideo.length).toBeGreaterThan(0);
    for (const c of withVideo) {
      const a = buildArticleJsonLd(c, caseUrl(c.slug, c.locale)) as any;
      expect(a.video["@type"]).toBe("VideoObject");
      expect(a.video.contentUrl).toBe(c.cover.video);
      // uploadDate 是 VideoObject 富结果的必填项
      expect(a.video.uploadDate, `${c.slug} video uploadDate`).toBe(c.publishedAt);
      expect(a.video.thumbnailUrl).toMatch(/^https:\/\//);
    }
  });

  it("omits VideoObject for gif previews (not a real video)", () => {
    const GIF = /\.gif($|[?#])/i;
    for (const c of ALL.filter((x) => x.cover.video && GIF.test(x.cover.video!))) {
      const a = buildArticleJsonLd(c, caseUrl(c.slug, c.locale)) as any;
      expect(a.video, `${c.slug} gif 不应生成 VideoObject`).toBeUndefined();
    }
  });

  it("falls back to the organization when the case has no author", () => {
    const a = buildArticleJsonLd(
      { ...SAMPLE, author: undefined },
      caseUrl(SAMPLE.slug, SAMPLE.locale),
    ) as any;
    expect(a.author["@type"]).toBe("Organization");
    expect(a.author.name).toBe("100mini");
  });

  it("carries source publisher/date into citations", () => {
    const withMeta = ALL.find((c) => c.sources?.some((s) => s.publisher && s.date));
    if (!withMeta) return;
    const a = buildArticleJsonLd(withMeta, caseUrl(withMeta.slug, withMeta.locale)) as any;
    const cited = a.citation.find((x: any) => x.publisher && x.datePublished);
    expect(cited).toBeTruthy();
    expect(cited.url).toMatch(/^https:\/\//);
  });
});

describe("case detail BreadcrumbList", () => {
  it("has three localized levels ending at the case URL", () => {
    const url = caseUrl(SAMPLE.slug, SAMPLE.locale);
    const b = buildBreadcrumbJsonLd(SAMPLE, url, "zh") as any;
    expect(b["@id"]).toBe(`${url}#breadcrumb`);
    expect(b.itemListElement).toHaveLength(3);
    expect(b.itemListElement[0].item).toBe("https://100mini.com/");
    expect(b.itemListElement[1].item).toBe("https://100mini.com/zh/showcase");
    expect(b.itemListElement[2].item).toBe(url);
    // 中文页面第二层面包屑走中文文案
    expect(b.itemListElement[1].name).toBe("案例库");
  });
});

describe("buildCaseHead", () => {
  const titleOf = (meta: any[]) => meta.find((m) => "title" in m)?.title as string;
  const byName = (meta: any[], key: string) => meta.find((m) => m.name === key)?.content;
  const byProp = (meta: any[], key: string) => meta.find((m) => m.property === key)?.content;

  it("emits a localized title and description", () => {
    const { meta } = buildCaseHead(SAMPLE, "en");
    expect(titleOf(meta)).toBe(`${SAMPLE.name} — 100mini Case Library`);
    expect(byName(meta, "description")).toBe(SAMPLE.summary);

    const zh = buildCaseHead(SAMPLE, "zh");
    expect(titleOf(zh.meta)).toContain("案例库");
  });

  it("emits Open Graph article tags", () => {
    const { meta } = buildCaseHead(SAMPLE, "en");
    expect(byProp(meta, "og:type")).toBe("article");
    expect(byProp(meta, "og:url")).toBe(caseUrl(SAMPLE.slug, SAMPLE.locale));
    expect(byProp(meta, "article:published_time")).toBe(SAMPLE.publishedAt);
    expect(byProp(meta, "article:modified_time")).toBe(
      SAMPLE.updatedAt ?? SAMPLE.publishedAt,
    );
    expect(byProp(meta, "article:section")).toBe(SAMPLE.category);
    const tags = meta.filter((m) => m.property === "article:tag").map((m) => m.content);
    expect(tags).toEqual(SAMPLE.tags);
  });

  it("points og:image at the absolute cover and adds alt text", () => {
    const { meta } = buildCaseHead(SAMPLE, "en");
    expect(byProp(meta, "og:image")).toMatch(/^https:\/\//);
    expect(byProp(meta, "og:image:alt")).toBe(SAMPLE.name);
    expect(byName(meta, "twitter:image:alt")).toBe(SAMPLE.name);
  });

  it("emits parseable JSON-LD scripts", () => {
    const { scripts } = buildCaseHead(SAMPLE, "en");
    expect(scripts).toHaveLength(2);
    const types = scripts.map((s) => {
      const parsed = JSON.parse(s.children);
      return parsed["@type"];
    });
    expect(types).toEqual(["Article", "BreadcrumbList"]);
  });
});
