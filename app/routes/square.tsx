import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { SquareGrid } from "~/components/SquareGrid";
import { authClient } from "~/lib/auth-client";

export const Route = createFileRoute("/square")({
  head: () => ({
    title: "链接广场 - 100mini",
    meta: [
      {
        name: "description",
        content: "发现和分享 HTML 学习资源与创意页面",
      },
    ],
  }),
  component: SquarePage,
});

interface SquareItem {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  previewPath: string | null;
  sharedAt: number;
  userName: string | null;
  userImage: string | null;
}

const CATEGORIES = [
  { key: "", label: "全部" },
  { key: "chinese", label: "语文" },
  { key: "math", label: "数学" },
  { key: "english", label: "英语" },
  { key: "physics", label: "物理" },
  { key: "chemistry", label: "化学" },
  { key: "history", label: "历史" },
  { key: "biology", label: "生物" },
  { key: "geography", label: "地理" },
  { key: "other", label: "其他" },
];

function SquarePage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<SquareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    authClient.getSession().then((session: any) => {
      setUser(session?.data?.user ?? null);
    });
  }, []);

  const fetchSquare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/square");
      const json = await res.json();
      setItems(json.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquare();
  }, []);

  const filtered = activeCategory
    ? items.filter((i) => i.category === activeCategory)
    : items;

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav user={user} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-12">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Globe className="size-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">链接广场</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              发现来自社区的 HTML 分享页面
            </p>
          </div>

          {/* Category filter */}
          <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="mb-6 break-inside-avoid rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="aspect-[4/3] animate-pulse bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SquareGrid items={filtered} />
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
