import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Upload, Wand2, Loader2 } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TemplatePicker } from "~/components/md2html/TemplatePicker";
import { MdPreview } from "~/components/md2html/MdPreview";
import { ExportMenu } from "~/components/md2html/ExportMenu";
import { SuccessCard } from "~/components/SuccessCard";
import { renderMarkdown, extractTitle } from "~/lib/md2html/render";
import { getTemplate } from "~/lib/md2html/templates";
import { useAuth } from "~/lib/auth-context";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { TagInput } from "~/components/TagInput";
import { PUBLISH_LIMIT } from "~/lib/any2md/convert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export const Route = createFileRoute("/md2html")({
  head: () => ({
    meta: [
      { title: i18n.t("md2html.seoTitle") },
      { name: "description", content: i18n.t("md2html.seoDesc") },
      { name: "keywords", content: i18n.t("md2html.seoKeywords") },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://100mini.com/md2html" },
      { property: "og:title", content: i18n.t("md2html.seoTitle") },
      { property: "og:description", content: i18n.t("md2html.seoDesc") },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: i18n.t("md2html.seoTitle") },
      { name: "twitter:description", content: i18n.t("md2html.seoDesc") },
    ],
    links: [
      { rel: "canonical", href: "https://100mini.com/md2html" },
    ],
  }),
  component: Md2HtmlPage,
});

const DEFAULT_MD_ZH = `# 100mini · 让分享变得如此简单

**100mini** 是一款免费的 HTML / Markdown 在线托管工具，专为学习与分享设计。粘贴、选择模板、一键生成链接，**7 天内随时随地访问**。

---

## 🚀 产品亮点

- **秒级上线**：粘贴即发布，无需注册即可使用
- **9 套品牌模板**：Apple 到 Linear，风格一键切换
- **任意浏览器打开**：生成的链接支持手机、平板、电脑访问
- *免费额度*：登录用户可永久保存，匿名用户 7 天自动销毁

### 适用场景

1. 老师发布课堂讲义与学习资料
2. 学生提交作品与项目演示
3. 个人笔记与知识库整理
4. 微信/QQ 快速分享网页内容

---

## 📌 快速上手

> 💡 小贴士：把 Markdown 文件直接拖进左侧编辑器，立刻看到效果！

### 步骤

- [x] 粘贴 Markdown 或导入 \`.md\` 文件
- [x] 在顶部选择喜欢的模板
- [ ] 点击「生成链接」分享出去
- [ ] 复制链接发送给朋友

---

## ✨ 格式演示

下面的内容覆盖了 Markdown 的常用语法，可以在任意模板中查看渲染效果。

### 文字样式

普通文字，支持**粗体**、*斜体*、~~删除线~~，还有 \`行内代码\`。键盘快捷键用 <kbd>Ctrl</kbd> + <kbd>C</kbd> 这样展示。

### 列表嵌套

1. 一级列表
   - 二级无序列表
     - 三级缩进
2. 继续编号

### 表格对比

| 功能 | 免费用户 | 会员用户 |
| :--- | :---: | ---: |
| 匿名发布 | ✅ 7 天有效 | ✅ 永久 |
| 自定义标题 | ❌ | ✅ |
| 广场分享 | ❌ | ✅ |
| 容量上限 | 5 MB | 5 MB |

### 引用块

> **深度思考**：真正好用的工具，应该让人把时间花在内容上，而不是工具本身。

---

## 🛠️ 技术支持

\`\`\`js
// 渲染一份 Markdown 只需两步
import { renderMarkdown } from "./md2html";

const html = await renderMarkdown(md, "apple");
console.log(html.length); // 输出完整 HTML 长度
\`\`\`

\`\`\`bash
# 本地启动开发环境
npm run dev

# 生产构建
npm run build
\`\`\`

\`\`\`json
{
  "templates": 9,
  "anonymous": "7 days",
  "permanent": true,
  "maxSize": "5 MB"
}
\`\`\`

---

## 📮 联系我们

- **官网**：[https://100mini.com](https://100mini.com)
- **邮箱**：<hello@100mini.com>
- **反馈**：欢迎发送邮件告诉我们你的想法

> 每个人都能建的 mini 站 —— 立即体验 **100mini**！ ✨
`;

const DEFAULT_MD_EN = `# 100mini · Make Sharing Effortless

**100mini** is a free HTML / Markdown hosting tool built for learning and sharing. Paste your content, pick a template, generate a link — accessible **anywhere for 7 days**.

---

## 🚀 Key Features

- **Publish in seconds**: paste and publish, no sign-up required
- **9 brand templates**: from Apple to Linear, switch styles in one click
- **Opens in any browser**: works on phones, tablets, and desktops
- *Free quota*: logged-in users keep pages forever, anonymous pages self-destroy after 7 days

### Use Cases

1. Teachers share lecture notes and study materials
2. Students submit projects and demos
3. Personal notes and knowledge base
4. Quickly share web content via WeChat / QQ

---

## 📌 Quick Start

> 💡 Tip: drag a Markdown file into the editor on the left and see the result instantly!

### Steps

- [x] Paste Markdown or import a \`.md\` file
- [x] Pick a template at the top
- [ ] Click "Generate Link" to publish
- [ ] Copy the link and share it with friends

---

## ✨ Format Demos

The content below covers common Markdown syntax — check the rendered result across templates.

### Text Styles

Plain text with **bold**, *italic*, ~~strikethrough~~, and \`inline code\`. Keyboard shortcuts look like <kbd>Ctrl</kbd> + <kbd>C</kbd>.

### Nested Lists

1. First level
   - Second level (unordered)
     - Third level indented
2. Continue numbering

### Table Comparison

| Feature | Free User | Member |
| :--- | :---: | ---: |
| Anonymous publish | ✅ 7 days | ✅ Permanent |
| Custom title | ❌ | ✅ |
| Share to Square | ❌ | ✅ |
| Size limit | 5 MB | 5 MB |

### Blockquote

> **Deep thought**: a truly useful tool lets people spend their time on the content, not the tool itself.

---

## 🛠️ Technical Support

\`\`\`js
// Render a Markdown in just two steps
import { renderMarkdown } from "./md2html";

const html = await renderMarkdown(md, "apple");
console.log(html.length); // full HTML length
\`\`\`

\`\`\`bash
# Run the dev server locally
npm run dev

# Production build
npm run build
\`\`\`

\`\`\`json
{
  "templates": 9,
  "anonymous": "7 days",
  "permanent": true,
  "maxSize": "5 MB"
}
\`\`\`

---

## 📮 Contact Us

- **Website**: [https://100mini.com](https://100mini.com)
- **Email**: <hello@100mini.com>
- **Feedback**: please email us your thoughts

> Everyone can build a mini site —— try **100mini** now! ✨
`;

const MAX_SIZE = PUBLISH_LIMIT;

interface UploadResult {
  id: string;
  url: string;
  expiresAt: string | null;
  isPermanent?: boolean;
  title?: string;
  isSharedToSquare?: boolean;
}

function Md2HtmlPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { user } = useAuth();
  const lang = i18nInstance.language?.startsWith("zh") ? "zh" : "en";
  const defaultMd = lang === "zh" ? DEFAULT_MD_ZH : DEFAULT_MD_EN;
  const [md, setMd] = useState(defaultMd);
  const defaultMdRef = useRef(defaultMd);

  useEffect(() => {
    const currentDefault = lang === "zh" ? DEFAULT_MD_ZH : DEFAULT_MD_EN;
    if (md === defaultMdRef.current) {
      defaultMdRef.current = currentDefault;
      setMd(currentDefault);
    } else {
      defaultMdRef.current = currentDefault;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
  const [templateId, setTemplateId] = useState("apple");
  const [variantIndex, setVariantIndex] = useState(0);
  const [html, setHtml] = useState("");
  const [rendering, setRendering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
  const [shareToSquare, setShareToSquare] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [importToast, setImportToast] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const draft = sessionStorage.getItem("any2md.draft");
    if (draft) {
      sessionStorage.removeItem("any2md.draft");
      defaultMdRef.current = draft;
      setMd(draft);
      setImportToast(true);
      setTimeout(() => setImportToast(false), 2500);
    }
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const contentSize = new Blob([md]).size;
  const canStart = md.trim().length > 0 && contentSize <= MAX_SIZE;
  const canPublish = canStart && title.trim().length > 0;

  const doRender = useCallback(async (text: string, tpl: string, vi: number) => {
    if (!text.trim()) {
      setHtml("");
      return;
    }
    setRendering(true);
    try {
      const rendered = await renderMarkdown(text, tpl, vi);
      setHtml(rendered);
    } catch {
      setHtml(`<pre>${text.replace(/</g, "&lt;")}</pre>`);
    } finally {
      setRendering(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doRender(md, templateId, variantIndex);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [md, templateId, variantIndex, doRender]);

  const handleTemplateChange = useCallback((id: string, currentVariant: number) => {
    if (id === templateId) {
      const tpl = getTemplate(id);
      const total = 1 + (tpl.variants?.length ?? 0);
      setVariantIndex((currentVariant + 1) % total);
    } else {
      setTemplateId(id);
      setVariantIndex(0);
    }
  }, [templateId]);

  useEffect(() => {
    if (!title && md.trim()) {
      const auto = extractTitle(md);
      setTitle(auto === "未命名" ? "" : auto);
    }
  }, [md, title]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".md") && !ext.endsWith(".markdown") && !ext.endsWith(".txt")) {
      setError(t("md2html.fileTypeError"));
      return;
    }
    setError(null);
    const text = await file.text();
    setMd(text);
    setTitle("");
  };

  const startPublish = () => {
    if (!canStart || loading) return;
    if (user) {
      setPublishOpen(true);
      return;
    }
    void doAnonymousUpload();
  };

  const upload = async (finalHtml: string) => {
    if (new Blob([finalHtml]).size > MAX_SIZE) {
      throw new Error(t("md2html.sizeError"));
    }
    const formData = new FormData();
    formData.append("content", finalHtml);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("tags", tags.join(","));
    formData.append("shareToSquare", String(shareToSquare));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const json = (await res.json()) as { error?: string } & UploadResult;
    if (!res.ok) throw new Error(json.error || t("common.error"));
    setResult(json);
  };

  const doAnonymousUpload = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalHtml = await renderMarkdown(md, templateId, variantIndex);
      if (userRef.current) {
        setLoading(false);
        setPublishOpen(true);
        return;
      }
      await upload(finalHtml);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.errorRetry"));
    } finally {
      setLoading(false);
    }
  };

  const doPublish = async () => {
    if (!canPublish || loading) return;
    setLoading(true);
    setError(null);
    try {
      const finalHtml = await renderMarkdown(md, templateId, variantIndex);
      await upload(finalHtml);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.errorRetry"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setHtml("");
    const currentDefault = lang === "zh" ? DEFAULT_MD_ZH : DEFAULT_MD_EN;
    defaultMdRef.current = currentDefault;
    setMd(currentDefault);
    setTitle("");
    setTags([]);
    setError(null);
  };

  if (result) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav />
        <main className="flex flex-1 flex-col items-center justify-center p-8">
          <SuccessCard
            url={result.url}
            expiresAt={result.expiresAt || undefined}
            isPermanent={result.isPermanent}
            pageId={result.id}
            onReset={handleReset}
            user={user}
          />
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {importToast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-popover px-4 py-2 text-sm shadow-lg">
          {t("md2html.importedFromAny2md")}
        </div>
      )}
      <AppNav />
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-3 py-2">
          <div className="min-w-0 flex-1">
            <TemplatePicker value={templateId} variantIndex={variantIndex} onChange={handleTemplateChange} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ExportMenu html={html} md={md} />
            <Button
              className="gap-2 px-4"
              disabled={!canStart || loading}
              onClick={startPublish}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {loading ? t("md2html.generating") : t("md2html.generate")}
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-2">
          <div className="flex min-h-0 flex-col border-b border-border bg-background lg:border-b-0 lg:border-r">
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <FileText className="size-4" />
                {t("md2html.editor")}
                <span className="hidden items-baseline gap-1 text-sm font-bold tracking-tight text-foreground sm:flex">
                  — just write Markdown <span className="text-primary">&amp; go</span>
                </span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".md,.markdown,.txt"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 font-semibold shadow-sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="size-3.5" />
                  {t("md2html.importFile")}
                </Button>
              </div>
            </div>
            <textarea
              className="min-h-[400px] w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
              value={md}
              onChange={(e) => setMd(e.target.value)}
              placeholder={t("md2html.editorPlaceholder")}
              spellCheck={false}
            />
            <div className="flex justify-end border-t border-border px-3 py-1.5">
              <span className={contentSize > MAX_SIZE ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                {formatSize(contentSize)} / 5 MB
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                {t("md2html.preview")}
              </span>
            </div>
            <MdPreview html={html} loading={rendering} className="min-h-[400px] flex-1 rounded-none border-0" />
          </div>
        </div>

        {error && (
          <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </main>

      {/* 发布弹窗（登录用户） */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("md2html.publishTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("home.form.title")} <span className="text-destructive">{t("home.form.titleRequired")}</span>
              </label>
              <Input
                className="mt-1"
                placeholder={t("home.form.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t("home.form.category")}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="general">{t("home.select.default")}</option>
                <option value="chinese">{t("home.select.chinese")}</option>
                <option value="math">{t("home.select.math")}</option>
                <option value="english">{t("home.select.english")}</option>
                <option value="physics">{t("home.select.physics")}</option>
                <option value="chemistry">{t("home.select.chemistry")}</option>
                <option value="history">{t("home.select.history")}</option>
                <option value="biology">{t("home.select.biology")}</option>
                <option value="geography">{t("home.select.geography")}</option>
                <option value="other">{t("home.select.other")}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("home.form.tags")}{" "}
                <span className="font-normal text-muted-foreground">{t("home.form.tagsHint")}</span>
              </label>
              <div className="mt-1">
                <TagInput tags={tags} onChange={setTags} placeholder={t("home.form.tagsPlaceholder")} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                checked={shareToSquare}
                onChange={(e) => setShareToSquare(e.target.checked)}
              />
              <span className="text-sm text-foreground">{t("home.form.shareToSquare")}</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={!canPublish || loading}
              onClick={() => { setPublishOpen(false); doPublish(); }}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {t("md2html.publish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
