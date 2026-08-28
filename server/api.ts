/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { count, eq, and, desc, sql, gte, lt } from "drizzle-orm";
import {
  LANGS,
  DEFAULT_LANG,
  withLangPrefix,
  BASE_URL,
  getBcp47,
  type Lang,
} from "../app/lib/lang";
import { page, user, pomodoroSession, wardrobeItem, wardrobeJob, wardrobeOutfit } from "./db/schema";
import { createDb } from "./db";
import { squareRoutes } from "./features/square/square.routes";
import { pagesRoutes } from "./features/pages/pages.routes";
import { adminRoutes } from "./features/admin/admin.routes";

type Variables = {
  user: { id: string; name: string; email: string; image?: string; role?: string } | null;
  session: any;
};

const api = new Hono<{
  Bindings: { BUCKET?: R2Bucket; D1?: D1Database; AI?: Ai };
  Variables: Variables;
}>();

api.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

// --- SEO: multilingual sitemaps & robots ---
//
// Language URL strategy: en (default) at root (no prefix); zh/es/pt/fr at
// /{lang}/... . Each language has its own sitemap for individual Google Search
// Console submission, plus a sitemap index at /sitemap.xml listing them all.
// Every URL advertises its hreflang alternates via <xhtml:link> so search
// engines know the language-region correspondence.

const STATIC_PAGES: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/square", changefreq: "hourly", priority: "0.9" },
  { loc: "/md2html", changefreq: "weekly", priority: "0.8" },
  { loc: "/any2md", changefreq: "weekly", priority: "0.8" },
  { loc: "/freetool", changefreq: "weekly", priority: "0.7" },
  { loc: "/idphoto", changefreq: "weekly", priority: "0.7" },
  { loc: "/links", changefreq: "weekly", priority: "0.7" },
  { loc: "/pomodoro", changefreq: "weekly", priority: "0.6" },
  { loc: "/rhythm", changefreq: "weekly", priority: "0.6" },
  { loc: "/contact", changefreq: "yearly", priority: "0.3" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  { loc: "/cookie", changefreq: "yearly", priority: "0.3" },
];

const XML_HDR = '<?xml version="1.0" encoding="UTF-8"?>';

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (ch) =>
    ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch === "'" ? "&apos;" : "&quot;"
  );
}

api.get("/robots.txt", (c) => {
  const sitemapLines = LANGS.map((l) => `Sitemap: ${BASE_URL}/sitemap-${l}.xml`).join("\n");
  return c.text(`User-agent: *
Allow: /
Allow: /p/
Disallow: /api/
Disallow: /admin

${sitemapLines}
`);
});

// Sitemap index — lists each per-language sitemap.
api.get("/sitemap.xml", (c) => {
  const entries = LANGS.map(
    (l) => `\n  <sitemap>\n    <loc>${BASE_URL}/sitemap-${l}.xml</loc>\n  </sitemap>`
  ).join("");
  return c.text(
    `${XML_HDR}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}\n</sitemapindex>`,
    200,
    { "Content-Type": "application/xml" }
  );
});

// hreflang alternates for a static page (one <xhtml:link> per language + x-default)
function alternateLinksXml(basePath: string): string {
  const lines = LANGS.map(
    (l) =>
      `\n    <xhtml:link rel="alternate" hreflang="${getBcp47(l)}" href="${BASE_URL}${withLangPrefix(l, basePath)}"/>`
  );
  lines.push(
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${withLangPrefix(DEFAULT_LANG, basePath)}"/>`
  );
  return lines.join("");
}

async function buildLangSitemap(c: any, lang: Lang): Promise<string> {
  const urls: string[] = STATIC_PAGES.map((p) => {
    const loc = `${BASE_URL}${withLangPrefix(lang, p.loc)}`;
    return `
  <url>
    <loc>${loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${alternateLinksXml(p.loc)}
  </url>`;
  });

  // User-generated shared pages live at root only (single canonical URL, no
  // language variants — /{lang}/p/:id 301-redirects to /p/:id). Include them
  // only in the default-language (en) sitemap.
  if (lang === DEFAULT_LANG && c.env?.D1) {
    const db = createDb(c.env.D1);
    const dynamicPages = await db
      .select({ id: page.id, sharedAt: page.sharedAt })
      .from(page)
      .where(eq(page.isSharedToSquare, true))
      .orderBy(desc(page.sharedAt))
      .limit(1000);
    for (const p of dynamicPages) {
      if (!p.sharedAt) continue;
      const lastmod = new Date(p.sharedAt).toISOString().split("T")[0];
      urls.push(`
  <url>
    <loc>${BASE_URL}/p/${escapeXml(p.id)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`);
    }
  }

  return `${XML_HDR}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}\n</urlset>`;
}

// Register one sitemap route per language: /sitemap-zh.xml, /sitemap-en.xml, ...
for (const lang of LANGS) {
  api.get(`/sitemap-${lang}.xml`, async (c) => {
    const body = await buildLangSitemap(c, lang as Lang);
    return c.text(body, 200, { "Content-Type": "application/xml" });
  });
}


// Record a completed pomodoro session
api.post("/api/pomodoro/sessions", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const { duration } = await c.req.json<{ duration: number }>();
  if (!duration || duration <= 0) return c.json({ error: "无效的时长" }, 400);

  const db = createDb(c.env.D1);
  await db.insert(pomodoroSession).values({
    id: nanoid(12),
    userId: user.id,
    duration,
    completedAt: new Date(),
  });

  return c.json({ success: true });
});

// Get today's pomodoro count
api.get("/api/pomodoro/today-count", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ today: 0, total: 0 });
  if (!c.env.D1) return c.json({ today: 0, total: 0 });

  const db = createDb(c.env.D1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayResult, totalResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pomodoroSession).where(
      and(eq(pomodoroSession.userId, user.id), gte(pomodoroSession.completedAt, today), lt(pomodoroSession.completedAt, tomorrow)),
    ),
    db.select({ count: sql<number>`count(*)` }).from(pomodoroSession).where(eq(pomodoroSession.userId, user.id)),
  ]);

  return c.json({
    today: Number(todayResult[0]?.count || 0),
    total: Number(totalResult[0]?.count || 0),
  });
});

// ==================== Wardrobe API ====================

// AI 模型配置
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

// 视觉分析提示词
const ANALYSIS_PROMPT = `Analyze this image and identify all clothing items.

For each clothing item, provide:
- name: specific clothing name
- part: category (upperbody, wholebody_up, lowerbody, accessories_up, shoes)
- color: hex color code
- secondaryColor: hex or null
- tags: array of descriptive tags
- boundingBox: {x, y, width, height} normalized to 0-1000

Return the result as a JSON object with an "items" array.`;

// 从 Markdown 响应中提取服装信息
function extractItemsFromMarkdown(content: string): any[] {
  const items: any[] = [];
  
  // 尝试识别服装项目 - 更精确的匹配
  const lines = content.split('\n');
  let currentItem: any = null;
  
  // 服装关键词映射到类别
  const categoryMap: Record<string, string> = {
    'shirt': 'upperbody', 'blouse': 'upperbody', 'top': 'upperbody', 't-shirt': 'upperbody',
    'sweater': 'upperbody', 'cardigan': 'upperbody', 'hoodie': 'upperbody', 'sweatshirt': 'upperbody',
    'dress': 'wholebody_up', 'jumpsuit': 'wholebody_up', 'romper': 'wholebody_up',
    'jacket': 'wholebody_up', 'coat': 'wholebody_up', 'blazer': 'wholebody_up', 'vest': 'wholebody_up',
    'pants': 'lowerbody', 'jeans': 'lowerbody', 'trousers': 'lowerbody', 'shorts': 'lowerbody',
    'skirt': 'lowerbody', 'leggings': 'lowerbody',
    'shoes': 'shoes', 'boots': 'shoes', 'sneakers': 'shoes', 'sandals': 'shoes', 'heels': 'shoes', 'slippers': 'shoes',
    'hat': 'accessories_up', 'cap': 'accessories_up', 'beanie': 'accessories_up',
    'bag': 'accessories_up', 'purse': 'accessories_up', 'backpack': 'accessories_up',
    'sunglasses': 'accessories_up', 'glasses': 'accessories_up', 'scarf': 'accessories_up', 'belt': 'accessories_up',
  };
  
  // 颜色关键词映射到 hex
  const colorMap: Record<string, string> = {
    'white': '#FFFFFF', 'black': '#000000', 'red': '#FF0000', 'blue': '#0000FF', 'green': '#008000',
    'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'brown': '#A52A2A',
    'gray': '#808080', 'grey': '#808080', 'navy': '#000080', 'beige': '#F5F5DC', 'cream': '#FFFDD0',
    'maroon': '#800000', 'olive': '#808000', 'teal': '#008080', 'cyan': '#00FFFF', 'magenta': '#FF00FF',
  };
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // 检测新的服装项 - 查找包含服装关键词的行
    let detectedCategory = null;
    let detectedName = null;
    
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerLine.includes(keyword)) {
        detectedCategory = category;
        // 提取名称 - 尝试从行中提取
        const nameMatch = line.match(new RegExp(`([^.,]*${keyword}[^.,]*)`, 'i'));
        if (nameMatch) {
          detectedName = nameMatch[1].replace(/[*#]/g, '').trim();
          // 清理名称
          detectedName = detectedName.replace(/^(a|an|the|this|that|these|those)\s+/i, '');
          detectedName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);
        } else {
          detectedName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        }
        break;
      }
    }
    
    if (detectedCategory && detectedName) {
      // 提取颜色
      let color = '#808080';
      for (const [colorName, hex] of Object.entries(colorMap)) {
        if (lowerLine.includes(colorName)) {
          color = hex;
          break;
        }
      }
      
      // 检查是否已经存在相同的项目
      const existingItem = items.find(item => 
        item.name.toLowerCase() === detectedName.toLowerCase() || 
        (item.part === detectedCategory && item.name.toLowerCase().includes(detectedName.toLowerCase().split(' ')[0]))
      );
      
      if (!existingItem) {
        currentItem = {
          name: detectedName,
          part: detectedCategory,
          color: color,
          secondaryColor: null,
          tags: [],
          boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
        };
        items.push(currentItem);
      }
    }
    
    // 提取标签 - 从描述性词语中提取
    if (currentItem) {
      const tagPatterns = [
        /pattern:\s*([^.,]+)/i,
        /style:\s*([^.,]+)/i,
        /material:\s*([^.,]+)/i,
        /design:\s*([^.,]+)/i,
        /floral/i, /striped/i, /plaid/i, /denim/i, /leather/i, /cotton/i, /silk/i, /wool/i,
        /casual/i, /formal/i, /sporty/i, /vintage/i, /modern/i,
      ];
      
      for (const pattern of tagPatterns) {
        const match = line.match(pattern);
        if (match) {
          const tag = (match[1] || match[0]).toLowerCase().trim();
          if (tag && !currentItem.tags.includes(tag) && currentItem.tags.length < 4) {
            currentItem.tags.push(tag);
          }
        }
      }
    }
  }
  
  // 如果没有识别到任何项目，尝试从整体描述中提取
  if (items.length === 0) {
    // 尝试识别常见的服装组合
    if (content.toLowerCase().includes('shirt') || content.toLowerCase().includes('top')) {
      items.push({
        name: 'Shirt',
        part: 'upperbody',
        color: '#FFFFFF',
        secondaryColor: null,
        tags: [],
        boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
      });
    }
    if (content.toLowerCase().includes('pants') || content.toLowerCase().includes('jeans')) {
      items.push({
        name: 'Pants',
        part: 'lowerbody',
        color: '#0000FF',
        secondaryColor: null,
        tags: [],
        boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
      });
    }
    if (content.toLowerCase().includes('boots') || content.toLowerCase().includes('shoes')) {
      items.push({
        name: 'Boots',
        part: 'shoes',
        color: '#000000',
        secondaryColor: null,
        tags: [],
        boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
      });
    }
  }
  
  // 如果还是没有识别到任何项目，创建一个默认项目
  if (items.length === 0) {
    items.push({
      name: 'Clothing Item',
      part: 'upperbody',
      color: '#808080',
      secondaryColor: null,
      tags: [],
      boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
    });
  }
  
  return items;
}

// 同意 Meta 许可证
let metaLicenseAgreed = false;
async function ensureMetaLicense(ai: Ai) {
  if (metaLicenseAgreed) return;
  try {
    await (ai as any).run(VISION_MODEL, {
      prompt: "agree",
    });
    metaLicenseAgreed = true;
  } catch (e) {
    // 如果错误不是许可证相关，则已经同意
    metaLicenseAgreed = true;
  }
}

// Wardrobe 上传限制
const WARDROBE_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const WARDROBE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// 上传图片并创建任务
api.post("/api/wardrobe/upload", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const formData = await c.req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return c.json({ error: "No image provided" }, 400);

  // 检查文件类型
  if (!WARDROBE_ALLOWED_TYPES.includes(file.type)) {
    return c.json({ 
      error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" 
    }, 400);
  }

  // 检查文件大小
  if (file.size > WARDROBE_MAX_FILE_SIZE) {
    const maxSizeMB = WARDROBE_MAX_FILE_SIZE / (1024 * 1024);
    return c.json({ 
      error: `File too large. Maximum size: ${maxSizeMB}MB` 
    }, 400);
  }

  const jobId = nanoid(10);
  const buffer = await file.arrayBuffer();

  // 存储原始图片到 R2
  const key = `wardrobe/${jobId}/original.png`;
  await c.env.BUCKET!.put(key, buffer, {
    httpMetadata: { contentType: file.type || "image/png" },
  });

  const imageUrl = `/api/wardrobe/assets/${jobId}/original.png`;

  // 创建任务记录
  const db = createDb(c.env.D1!);
  await db.insert(wardrobeJob).values({
    id: jobId,
    userId: user.id,
    status: "pending",
    originalImageUrl: imageUrl,
  });

  return c.json({ jobId, imageUrl });
});

// 获取任务状态
api.get("/api/wardrobe/jobs/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const jobId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const job = await db.select().from(wardrobeJob).where(eq(wardrobeJob.id, jobId)).get();
  if (!job || job.userId !== user.id) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({
    id: job.id,
    status: job.status,
    originalImageUrl: job.originalImageUrl,
    analysisResult: job.analysisResult ? JSON.parse(job.analysisResult) : null,
    error: job.error,
  });
});

// 分析图片
api.post("/api/wardrobe/jobs/:id/analyze", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const jobId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const job = await db.select().from(wardrobeJob).where(eq(wardrobeJob.id, jobId)).get();
  if (!job || job.userId !== user.id) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (!c.env.AI) {
    return c.json({ error: "AI not configured" }, 500);
  }

  // 更新状态为分析中
  await db.update(wardrobeJob)
    .set({ status: "analyzing", updatedAt: new Date() })
    .where(eq(wardrobeJob.id, jobId));

  const maxRetries = 5; // 增加重试次数
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 同意 Meta 许可证 (首次使用需要)
      await ensureMetaLicense(c.env.AI);

      // 从 R2 读取图片
      const imageKey = `wardrobe/${jobId}/original.png`;
      const imageObject = await c.env.BUCKET!.get(imageKey);
      if (!imageObject) throw new Error("Image not found");

      const imageBuffer = await imageObject.arrayBuffer();
      // 使用分块编码避免堆栈溢出
      const bytes = new Uint8Array(imageBuffer);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
      }
      const base64 = btoa(binary);
      const imageDataUrl = `data:image/png;base64,${base64}`;

      // 调用视觉分析 (带超时)
      const aiPromise = c.env.AI.run(VISION_MODEL, {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: ANALYSIS_PROMPT },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI request timeout")), 120000)
      );
      const response = await Promise.race([aiPromise, timeoutPromise]);

      // 解析响应
      const content = (response as any).response || (response as any).choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from AI model");

      console.log("[wardrobe] AI response:", content.substring(0, 500));

      let items;
      try {
        // 尝试直接解析 JSON
        const parsed = JSON.parse(content);
        items = parsed.items || [];
      } catch (e) {
        // 尝试从文本中提取 JSON - 找到第一个 { 和最后一个 }
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = content.substring(firstBrace, lastBrace + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            items = parsed.items || [];
          } catch (e2) {
            // 尝试提取多个 JSON 对象
            const allMatches = jsonStr.match(/\{[^{}]*\}/g);
            if (allMatches && allMatches.length > 0) {
              // 找到包含 "items" 的 JSON
              for (const match of allMatches) {
                try {
                  const parsed = JSON.parse(match);
                  if (parsed.items) {
                    items = parsed.items;
                    break;
                  }
                } catch (e3) {
                  // 继续尝试下一个
                }
              }
            }
            if (!items) {
              // 尝试从 Markdown 中提取信息
              items = extractItemsFromMarkdown(content);
            }
          }
        } else {
          // 尝试从 Markdown 中提取信息
          items = extractItemsFromMarkdown(content);
        }
      }

      if (!Array.isArray(items)) {
        throw new Error("Invalid items format in AI response");
      }

      // 更新任务状态
      await db.update(wardrobeJob)
        .set({
          status: "completed",
          analysisResult: JSON.stringify(items),
          updatedAt: new Date(),
        })
        .where(eq(wardrobeJob.id, jobId));

      return c.json({ items });
    } catch (error: any) {
      lastError = error;
      console.log(`[wardrobe] Attempt ${attempt} failed:`, error.message);
      
      // 如果是容量限制、网络错误或超时，等待后重试
      if (
        error.message.includes("3040") ||
        error.message.includes("Capacity temporarily exceeded") ||
        error.message.includes("rate limit") ||
        error.message.includes("timeout") ||
        error.message.includes("Network connection lost") ||
        error.message.includes("network")
      ) {
        if (attempt < maxRetries) {
          // 递增等待时间：10秒、20秒、30秒、40秒
          const waitTime = attempt * 10000;
          console.log(`[wardrobe] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // 其他错误直接抛出
      break;
    }
  }

  // 所有重试都失败
  const errorMessage = lastError?.message || "Analysis failed";
  await db.update(wardrobeJob)
    .set({
      status: "failed",
      error: errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(wardrobeJob.id, jobId));

  return c.json({ error: errorMessage }, 500);
});

// 提取服装项并生成图片
api.post("/api/wardrobe/jobs/:id/extract/:itemIndex", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const jobId = c.req.param("id");
  const itemIndex = parseInt(c.req.param("itemIndex"));
  const db = createDb(c.env.D1!);

  const job = await db.select().from(wardrobeJob).where(eq(wardrobeJob.id, jobId)).get();
  if (!job || job.userId !== user.id) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (!job.analysisResult) {
    return c.json({ error: "No analysis result" }, 400);
  }

  const items = JSON.parse(job.analysisResult);
  if (itemIndex < 0 || itemIndex >= items.length) {
    return c.json({ error: "Invalid item index" }, 400);
  }

  const item = items[itemIndex];

  if (!c.env.AI) {
    return c.json({ error: "AI not configured" }, 500);
  }

  const maxRetries = 5; // 增加重试次数
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 从 R2 读取原始图片
      const imageKey = `wardrobe/${jobId}/original.png`;
      const imageObject = await c.env.BUCKET!.get(imageKey);
      if (!imageObject) throw new Error("Original image not found");

      const originalBuffer = await imageObject.arrayBuffer();
      
      // 使用 Cloudflare Images API 的 segment 功能移除背景
      // 构建图片 URL - 需要通过公共 URL 访问
      const imageUrl = `https://www.100mini.com/api/wardrobe/assets/${jobId}/original.png`;
      
      // 使用 fetch 的 cf.image 选项进行背景移除
      const imageResponse = await fetch(imageUrl, {
        cf: {
          image: {
            segment: "foreground",
            background: "#ffffff",
            format: "png",
            width: 512,
            height: 512,
            fit: "contain",
          },
        },
      });

      if (!imageResponse.ok) {
        throw new Error(`Image processing failed: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // 存储生成的图片
      const itemId = nanoid(10);
      const itemImageKey = `wardrobe/items/${itemId}.png`;
      await c.env.BUCKET!.put(itemImageKey, imageBuffer, {
        httpMetadata: { contentType: "image/png" },
      });

      const itemImageUrl = `/api/wardrobe/assets/items/${itemId}.png`;

      // 创建服装项记录
      await db.insert(wardrobeItem).values({
        id: itemId,
        userId: user.id,
        name: item.name,
        part: item.part,
        color: item.color,
        secondaryColor: item.secondaryColor || null,
        tags: JSON.stringify(item.tags || []),
        imageUrl: itemImageUrl,
      });

      return c.json({
        item: {
          id: itemId,
          name: item.name,
          part: item.part,
          color: item.color,
          secondaryColor: item.secondaryColor,
          tags: item.tags,
          image: itemImageUrl,
        },
      });
    } catch (error: any) {
      lastError = error;
      console.log(`[wardrobe] Image generation attempt ${attempt} failed:`, error.message);
      
      // 如果是容量限制、网络错误或超时，等待后重试
      if (
        error.message.includes("3040") ||
        error.message.includes("Capacity temporarily exceeded") ||
        error.message.includes("rate limit") ||
        error.message.includes("timeout") ||
        error.message.includes("Network connection lost") ||
        error.message.includes("network")
      ) {
        if (attempt < maxRetries) {
          // 递增等待时间：10秒、20秒、30秒、40秒
          const waitTime = attempt * 10000;
          console.log(`[wardrobe] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // 其他错误直接抛出
      break;
    }
  }

  // 所有重试都失败
  const errorMessage = lastError?.message || "Image generation failed";
  return c.json({ error: errorMessage }, 500);
});

// 获取用户的服装列表
api.get("/api/wardrobe/items", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDb(c.env.D1!);
  const items = await db.select()
    .from(wardrobeItem)
    .where(eq(wardrobeItem.userId, user.id))
    .orderBy(desc(wardrobeItem.createdAt))
    .all();

  return c.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      part: item.part,
      color: item.color,
      secondaryColor: item.secondaryColor,
      tags: item.tags ? JSON.parse(item.tags) : [],
      image: item.imageUrl,
      thumbnail: item.thumbnailUrl || item.imageUrl,
      createdAt: item.createdAt,
    })),
  });
});

// 更新服装项
api.put("/api/wardrobe/items/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const itemId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const item = await db.select().from(wardrobeItem).where(eq(wardrobeItem.id, itemId)).get();
  if (!item || item.userId !== user.id) {
    return c.json({ error: "Item not found" }, 404);
  }

  const body = await c.req.json();
  const updates: any = {};

  if (body.name) updates.name = body.name;
  if (body.part) updates.part = body.part;
  if (body.color) updates.color = body.color;
  if (body.secondaryColor !== undefined) updates.secondaryColor = body.secondaryColor;
  if (body.tags) updates.tags = JSON.stringify(body.tags);

  updates.updatedAt = new Date();

  await db.update(wardrobeItem)
    .set(updates)
    .where(eq(wardrobeItem.id, itemId));

  return c.json({ success: true });
});

// 删除服装项
api.delete("/api/wardrobe/items/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const itemId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const item = await db.select().from(wardrobeItem).where(eq(wardrobeItem.id, itemId)).get();
  if (!item || item.userId !== user.id) {
    return c.json({ error: "Item not found" }, 404);
  }

  // 删除 R2 中的图片
  if (item.imageUrl) {
    const key = item.imageUrl.replace("/api/wardrobe/assets/", "wardrobe/");
    await c.env.BUCKET!.delete(key);
  }

  // 删除记录
  await db.delete(wardrobeItem).where(eq(wardrobeItem.id, itemId));

  return c.json({ success: true });
});

// 获取 wardrobe 资源文件
api.get("/api/wardrobe/assets/*", async (c) => {
  const path = c.req.path.replace("/api/wardrobe/assets/", "");
  const key = `wardrobe/${path}`;

  const object = await c.env.BUCKET!.get(key);
  if (!object) {
    return c.json({ error: "Not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return c.body(object.body, { headers });
});

// ==================== Outfit API ====================

// 异步生成 outfit 图片（FLUX.2 klein 4B，multipart 输入，固定 4 步），并更新记录状态
async function generateOutfitImage(
  env: { AI?: Ai; BUCKET?: R2Bucket; D1?: D1Database },
  db: ReturnType<typeof createDb>,
  outfitId: string,
  prompt: string
) {
  try {
    await db.update(wardrobeOutfit)
      .set({ status: "generating" })
      .where(eq(wardrobeOutfit.id, outfitId));

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("width", "1024");
    form.append("height", "1024");

    // FormData 不暴露序列化后的 body 和 boundary，通过 Response 构造函数生成 Content-Type
    const formResponse = new Response(form);
    const formStream = formResponse.body;
    const formContentType = formResponse.headers.get("content-type") || "multipart/form-data";

    const response = await (env.AI as any).run(IMAGE_MODEL, {
      multipart: {
        body: formStream,
        contentType: formContentType,
      },
    });

    let imageBuffer: ArrayBuffer;
    if (response instanceof ArrayBuffer) {
      imageBuffer = response;
    } else if (response instanceof Uint8Array) {
      imageBuffer = response.buffer as ArrayBuffer;
    } else if (response && typeof response === "object" && typeof response.image === "string") {
      // klein-4b 输出为 { image: "<base64>" }
      const binary = atob(response.image);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      imageBuffer = bytes.buffer as ArrayBuffer;
    } else {
      throw new Error("Invalid response format");
    }

    const imageKey = `wardrobe/outfits/${outfitId}.png`;
    await env.BUCKET!.put(imageKey, imageBuffer, {
      httpMetadata: { contentType: "image/png" },
    });

    await db.update(wardrobeOutfit)
      .set({
        status: "completed",
        imageUrl: `/api/wardrobe/assets/outfits/${outfitId}.png`,
        updatedAt: new Date(),
      })
      .where(eq(wardrobeOutfit.id, outfitId));
  } catch (error: any) {
    console.error("[outfit] Generation failed:", error.message);
    await db.update(wardrobeOutfit)
      .set({
        status: "failed",
        error: error.message,
        updatedAt: new Date(),
      })
      .where(eq(wardrobeOutfit.id, outfitId));
  }
}

// 获取用户的 outfit 列表
api.get("/api/wardrobe/outfits", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDb(c.env.D1!);
  const outfits = await db.select()
    .from(wardrobeOutfit)
    .where(eq(wardrobeOutfit.userId, user.id))
    .orderBy(desc(wardrobeOutfit.createdAt))
    .all();

  return c.json({
    outfits: outfits.map((outfit) => ({
      id: outfit.id,
      name: outfit.name,
      occasion: outfit.occasion,
      itemIds: outfit.itemIds ? JSON.parse(outfit.itemIds) : [],
      imageUrl: outfit.imageUrl,
      status: outfit.status,
      createdAt: outfit.createdAt,
    })),
  });
});

// 创建 outfit
api.post("/api/wardrobe/outfits", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { name, occasion, itemIds } = body;

  if (!name || !itemIds || !Array.isArray(itemIds) || itemIds.length < 2) {
    return c.json({ error: "Name and at least 2 items required" }, 400);
  }

  const db = createDb(c.env.D1!);
  
  // 验证所有 items 属于当前用户
  const items = await db.select()
    .from(wardrobeItem)
    .where(
      and(
        eq(wardrobeItem.userId, user.id),
        sql`${wardrobeItem.id} IN (${sql.join(itemIds.map((id: string) => sql`${id}`), sql`, `)})`
      )
    )
    .all();

  if (items.length !== itemIds.length) {
    return c.json({ error: "Some items not found" }, 400);
  }

  const outfitId = nanoid(10);
  
  // 生成 outfit 图片提示词
  const itemDescriptions = items.map((item) => `${item.name} (${item.part}, ${item.color})`).join(", ");
  const prompt = `Create a stylish outfit combination photo featuring: ${itemDescriptions}. 
Professional fashion photography, clean white background, well-lit, high quality product styling.`;

  // 创建 outfit 记录
  await db.insert(wardrobeOutfit).values({
    id: outfitId,
    userId: user.id,
    name,
    occasion: occasion || null,
    itemIds: JSON.stringify(itemIds),
    status: "planned",
  });

  // 异步生成图片
  if (c.env.AI) {
    c.executionCtx.waitUntil(generateOutfitImage(c.env, db, outfitId, prompt));
  }

  return c.json({ 
    outfit: { 
      id: outfitId, 
      name, 
      occasion, 
      itemIds, 
      status: "planned" 
    } 
  });
});

// 参考 wardrobe-main 的 outfit 自动化创建：自动从服装库策划色彩和谐的组合并批量生成
api.post("/api/wardrobe/outfits/auto", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json().catch(() => ({}));
  const count = Math.max(1, Math.min(6, Number(body.count) || 3));

  const db = createDb(c.env.D1!);
  const allItems = await db.select()
    .from(wardrobeItem)
    .where(eq(wardrobeItem.userId, user.id))
    .all();

  if (allItems.length === 0) {
    return c.json({ error: "Your wardrobe is empty. Import some clothes first." }, 400);
  }

  const tops = allItems.filter((i) => i.part === "upperbody");
  const jackets = allItems.filter((i) => i.part === "wholebody_up");
  const bottoms = allItems.filter((i) => i.part === "lowerbody");
  const shoes = allItems.filter((i) => i.part === "shoes");
  const accessories = allItems.filter((i) => i.part === "accessories_up");

  if (tops.length === 0 || bottoms.length === 0) {
    return c.json({ error: "You need at least one top and one bottom to create outfits." }, 400);
  }

  // ---- 颜色工具 ----
  const hexToRgb = (hex: string | null): { red: number; green: number; blue: number } => {
    if (!hex) return { red: 128, green: 128, blue: 128 };
    const clean = hex.replace("#", "");
    const value = parseInt(clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean, 16);
    return { red: (value >> 16) & 255, green: (value >> 8) & 255, blue: value & 255 };
  };
  const colorDist = (a: { red: number; green: number; blue: number }, b: { red: number; green: number; blue: number }) =>
    Math.sqrt((a.red - b.red) ** 2 + (a.green - b.green) ** 2 + (a.blue - b.blue) ** 2);

  // 近似命名色（用于生成 outfit 名称）
  const NAMED_COLORS: [string, number, number, number][] = [
    ["black", 0, 0, 0], ["white", 255, 255, 255], ["grey", 128, 128, 128],
    ["navy", 0, 0, 128], ["blue", 0, 0, 255], ["teal", 0, 128, 128],
    ["green", 0, 128, 0], ["olive", 128, 128, 0], ["khaki", 195, 176, 145],
    ["brown", 139, 69, 19], ["camel", 193, 154, 107], ["beige", 245, 245, 220],
    ["cream", 255, 253, 208], ["maroon", 128, 0, 0], ["red", 255, 0, 0],
    ["burgundy", 144, 0, 32], ["coral", 255, 127, 80], ["pink", 255, 192, 203],
    ["purple", 128, 0, 128], ["violet", 238, 130, 238], ["lavender", 230, 230, 250],
    ["orange", 255, 165, 0], ["amber", 255, 191, 0], ["yellow", 255, 255, 0],
    ["gold", 255, 215, 0], ["cyan", 0, 255, 255], ["turquoise", 64, 224, 208],
  ];
  const colorName = (hex: string | null): string => {
    if (!hex) return "neutral";
    const rgb = hexToRgb(hex);
    let best = "neutral";
    let bestScore = Infinity;
    for (const [label, r, g, b] of NAMED_COLORS) {
      const score = colorDist(rgb, { red: r, green: g, blue: b });
      if (score < bestScore) { bestScore = score; best = label; }
    }
    return best;
  };

  // ---- 策划组合：色彩和谐 + 公平使用 ----
  const usage = new Map<string, number>();
  const bump = (id: string) => usage.set(id, (usage.get(id) || 0) + 1);
  const leastUsed = (pool: (typeof allItems)[number][]) =>
    pool.length === 0 ? null : [...pool].sort((a, b) => (usage.get(a.id) || 0) - (usage.get(b.id) || 0))[0];
  const harmonicPick = (pool: (typeof allItems)[number][], ref: { red: number; green: number; blue: number }) => {
    if (pool.length === 0) return null;
    let best: (typeof allItems)[number] | null = null;
    let bestScore = Infinity;
    for (const item of pool) {
      const score = colorDist(ref, hexToRgb(item.color)) + (usage.get(item.id) || 0) * 60;
      if (score < bestScore) { bestScore = score; best = item; }
    }
    return best;
  };

  const STYLE_WORDS = ["Classic", "Minimal", "Urban", "Layered", "Chic", "Everyday"];
  const OCCASIONS = ["casual", "smart-casual", "office", "weekend", "date night", "city walk"];
  const SETTINGS = [
    "a quiet warm-stone courtyard with restrained greenery",
    "a minimal concrete studio with soft natural light",
    "soft daylight by a large window in an airy room",
    "a city rooftop at golden hour with clean lines",
    "a calm beige-toned street corner in morning light",
    "a park path with soft blurred foliage in the background",
  ];

  const maxCombos = Math.min(count, tops.length * bottoms.length);
  const combos: { top: any; bottom: any; jacket: any; shoes: any; accessory: any }[] = [];
  for (let i = 0; i < maxCombos; i++) {
    const top = leastUsed(tops)!;
    bump(top.id);
    const bottom = harmonicPick(bottoms, hexToRgb(top.color))!;
    bump(bottom.id);
    const jacket = harmonicPick(jackets, hexToRgb(top.color));
    if (jacket) bump(jacket.id);
    const shoe = leastUsed(shoes);
    if (shoe) bump(shoe.id);
    const accessory = leastUsed(accessories);
    if (accessory) bump(accessory.id);
    combos.push({ top, bottom, jacket, shoes: shoe, accessory });
  }

  // ---- 写入数据库并异步生成 ----
  const created: any[] = [];
  for (let i = 0; i < combos.length; i++) {
    const combo = combos[i];
    const outfitId = nanoid(10);
    const topColor = colorName(combo.top.color);
    const bottomColor = colorName(combo.bottom.color);
    const name = `${topColor.charAt(0).toUpperCase() + topColor.slice(1)} & ${bottomColor.charAt(0).toUpperCase() + bottomColor.slice(1)} ${STYLE_WORDS[i % STYLE_WORDS.length]}`;
    const occasion = OCCASIONS[i % OCCASIONS.length];
    const itemIds = [combo.top, combo.bottom, combo.jacket, combo.shoes, combo.accessory]
      .filter((item): item is any => !!item)
      .map((item) => item.id);

    const partLabel = (part: string) => {
      const map: Record<string, string> = {
        upperbody: "top", wholebody_up: "jacket", lowerbody: "bottoms", shoes: "shoes", accessories_up: "accessory",
      };
      return map[part] || part;
    };
    const describe = (item: any) => `${item.name} (${partLabel(item.part)}, ${colorName(item.color)})`;
    const setting = SETTINGS[i % SETTINGS.length];
    const prompt = `Full-body editorial fashion photo of a complete outfit: ${[
      describe(combo.top), describe(combo.bottom), combo.jacket ? describe(combo.jacket) : null,
      combo.shoes ? describe(combo.shoes) : null, combo.accessory ? describe(combo.accessory) : null,
    ].filter(Boolean).join(", ")}. Harmonious ${topColor} and ${bottomColor} tonal palette, one dominant piece. Natural layered look, ${setting}, clean composition, square 1:1, photorealistic, professional fashion photography.`;

    await db.insert(wardrobeOutfit).values({
      id: outfitId,
      userId: user.id,
      name,
      occasion,
      itemIds: JSON.stringify(itemIds),
      status: "planned",
    });

    if (c.env.AI) {
      c.executionCtx.waitUntil(generateOutfitImage(c.env, db, outfitId, prompt));
    }

    created.push({ id: outfitId, name, occasion, itemIds, status: "planned" });
  }

  return c.json({ outfits: created });
});

// 获取 outfit 详情
api.get("/api/wardrobe/outfits/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const outfitId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const outfit = await db.select()
    .from(wardrobeOutfit)
    .where(eq(wardrobeOutfit.id, outfitId))
    .get();

  if (!outfit || outfit.userId !== user.id) {
    return c.json({ error: "Outfit not found" }, 404);
  }

  // 获取关联的服装项
  const itemIds = outfit.itemIds ? JSON.parse(outfit.itemIds) : [];
  const items = itemIds.length > 0
    ? await db.select()
        .from(wardrobeItem)
        .where(
          and(
            eq(wardrobeItem.userId, user.id),
            sql`${wardrobeItem.id} IN (${sql.join(itemIds.map((id: string) => sql`${id}`), sql`, `)})`
          )
        )
        .all()
    : [];

  return c.json({
    outfit: {
      id: outfit.id,
      name: outfit.name,
      occasion: outfit.occasion,
      itemIds,
      imageUrl: outfit.imageUrl,
      status: outfit.status,
      error: outfit.error,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        part: item.part,
        color: item.color,
        image: item.imageUrl,
      })),
      createdAt: outfit.createdAt,
    },
  });
});

// 删除 outfit
api.delete("/api/wardrobe/outfits/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const outfitId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const outfit = await db.select()
    .from(wardrobeOutfit)
    .where(eq(wardrobeOutfit.id, outfitId))
    .get();

  if (!outfit || outfit.userId !== user.id) {
    return c.json({ error: "Outfit not found" }, 404);
  }

  // 删除 R2 中的图片
  if (outfit.imageUrl) {
    const key = outfit.imageUrl.replace("/api/wardrobe/assets/", "wardrobe/");
    await c.env.BUCKET!.delete(key);
  }

  await db.delete(wardrobeOutfit).where(eq(wardrobeOutfit.id, outfitId));

  return c.json({ success: true });
});

// Mount feature routers (server/features/*，各自按 repo/service/routes 分层)
const apiWithFeatures = api.route("/", squareRoutes).route("/", pagesRoutes).route("/", adminRoutes);

// Hono RPC 类型：前端通过 hc<AppType> 获得端到端类型安全的客户端
export type AppType = typeof apiWithFeatures;

export default api;