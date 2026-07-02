import { useState } from "react";
import { FileText, Eye } from "lucide-react";

interface SquareItem {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  sharedAt: number;
  previewPath: string | null;
  userName: string | null;
  userImage: string | null;
}

interface SquareGridProps {
  items: SquareItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "通用",
  chinese: "语文",
  math: "数学",
  english: "英语",
  physics: "物理",
  chemistry: "化学",
  history: "历史",
  biology: "生物",
  geography: "地理",
  other: "其他",
};

function PreviewCell({ item }: { item: SquareItem }) {
  const [showIframe, setShowIframe] = useState(false);

  if (showIframe || !item.previewPath) {
    return (
      <iframe
        src={`/p/${item.id}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        sandbox="allow-scripts"
        title={item.title}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={`/thumbnails/${item.id}`}
      alt={item.title}
      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
      loading="lazy"
      onError={() => setShowIframe(true)}
    />
  );
}

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    chinese: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    math: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    english: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    physics: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    chemistry: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    history: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    biology: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
    geography: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  };
  return colors[cat] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
}

export function SquareGrid({ items }: SquareGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-14 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 dark:bg-[#4edea3]/10">
          <FileText className="size-6 text-[#006c49] dark:text-[#4edea3]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">广场还没有内容</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          成为第一个分享者，把你的页面发布到广场
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] overflow-hidden group hover:shadow-sm transition-all duration-300"
        >
          {/* HTML preview via iframe */}
          <a
            href={`/p/${item.id}`}
            target="_blank"
            className="relative block overflow-hidden"
          >
            <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "3/4" }}>
              <PreviewCell item={item} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10">
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  <Eye className="size-4" />
                  查看页面
                </span>
              </div>
            </div>
          </a>

          {/* Info */}
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getCategoryColor(item.category)}`}
              >
                {CATEGORY_LABELS[item.category] || item.category}
              </span>
              {item.tags && item.tags.split(/[,，]+/).map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
            <h3 className="text-base font-semibold text-foreground truncate">
              {item.title || "未命名"}
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {item.userName ? (
                  <>
                    {item.userImage ? (
                      <img
                        src={item.userImage}
                        alt={item.userName}
                        className="size-5 rounded-full"
                      />
                    ) : (
                      <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {item.userName.charAt(0)}
                      </div>
                    )}
                    <span>{item.userName}</span>
                  </>
                ) : (
                  <span>匿名</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" />
                {item.viewCount}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
