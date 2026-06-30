import { useState } from "react";
import { FileText, Upload, Share2, ChevronDown, FileImage, ImageDown, TestTube, Tag, Sparkles } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "准备内容",
    description: "用 AI 或编辑器生成 HTML 互动学习页，支持 CSS/JS 及各类静态资源",
  },
  {
    icon: Upload,
    title: "上传发布",
    description: "粘贴代码或拖拽上传 .html/.zip 文件，填写标题和分类信息",
  },
  {
    icon: Share2,
    title: "分享链接",
    description: "一键复制链接发微信群/小红书/朋友圈，或生成二维码方便传播",
  },
];

const faqs = [
  {
    q: "支持哪些文件格式？",
    a: "支持 .html、.htm 和 .zip 文件。上传 ZIP 时请确保其中包含 index.html 作为入口文件。",
  },
  {
    q: "文件大小有限制吗？",
    a: "单个文件或 ZIP 压缩包大小不能超过 5MB。建议压缩图片等资源以减小体积。",
  },
  {
    q: "页面能保留多久？",
    a: "匿名上传的页面 24 小时后自动销毁。登录后上传的页面可永久保留（免费赠送 5 个永久额度），会员用户不限数量。",
  },
  {
    q: "如何让页面出现在学习广场？",
    a: "登录后在上传时勾选「分享到广场」即可。你的页面将按学科分类展示，供全网用户浏览使用。",
  },
  {
    q: "安全方面有什么保障？",
    a: "所有用户页面强制注入安全 Banner，并通过 Content-Security-Policy 禁用表单提交，防止钓鱼行为。",
  },
];

const tips = [
  {
    icon: FileImage,
    title: "文件组织",
    description: "ZIP 上传时将主页命名为 index.html，CSS/JS 放在子文件夹中",
  },
  {
    icon: ImageDown,
    title: "图片压缩",
    description: "上传前压缩图片，减少加载时间，提升访问体验",
  },
  {
    icon: TestTube,
    title: "本地测试",
    description: "先在浏览器本地打开 HTML 确保效果正常，再上传到平台",
  },
  {
    icon: Tag,
    title: "清晰命名",
    description: "填写有意义的标题和分类标签，让别人更容易搜索到你的页面",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-foreground/80 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export function GuideSection() {
  return (
    <>
      {/* Quick Start */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
            快速上手
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                    <Icon className="size-7" />
                  </div>
                  <h4 className="text-lg font-semibold">{step.title}</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-[#eff4ff] dark:bg-[#1e314a] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
            常见问题
          </h2>
          <div className="rounded-2xl border border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#15243b] px-6">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
            小贴士
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="flex flex-col items-center rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-8 text-center shadow-sm"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                    <Icon className="size-6" />
                  </div>
                  <h4 className="text-base font-semibold">{tip.title}</h4>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
