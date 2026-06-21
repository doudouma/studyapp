import { FileText, Eye } from "lucide-react";

interface SquareItem {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  sharedAt: number;
  userName: string | null;
  userImage: string | null;
}

interface SquareGridProps {
  items: SquareItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
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

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    chinese: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    math: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    english: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    physics: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    chemistry: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    history: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    biology: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    geography: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return colors[cat] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
}

export function SquareGrid({ items }: SquareGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <FileText className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">广场还没有内容</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          成为第一个分享者，把你的页面发布到广场
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="mb-6 break-inside-avoid rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg transition-all duration-300"
        >
          {/* HTML preview via iframe */}
          <a
            href={`/p/${item.id}`}
            target="_blank"
            className="relative block overflow-hidden"
          >
            <div className="relative" style={{ aspectRatio: "4/3" }}>
              <iframe
                src={`/p/${item.id}`}
                className="absolute inset-0 w-full h-full pointer-events-none"
                sandbox="allow-scripts"
                title={item.title}
                loading="lazy"
              />
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
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 uppercase tracking-wider ${getCategoryColor(item.category)}`}
            >
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
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
