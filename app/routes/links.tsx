import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Link as LinkIcon } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { LinksTable } from "~/components/LinksTable";
import { useAuth } from "~/lib/auth-context";

export const Route = createFileRoute("/links")({
  head: () => ({
    title: "我的链接 - 100mini",
    meta: [
      {
        name: "description",
        content: "管理你上传的所有 HTML 分享链接",
      },
    ],
  }),
  component: LinksPage,
});

interface PageData {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  createdAt: number;
}

interface PagesResponse {
  pages: PageData[];
  total: number;
  limit: number;
}

function LinksPage() {
  const { user, authLoading } = useAuth();
  const [data, setData] = useState<PagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "加载失败");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPages();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) return null;

  // Not logged in — prompt to login
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 dark:bg-[#4edea3]/10">
              <LinkIcon className="size-6 text-[#006c49] dark:text-[#4edea3]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">我的链接</h1>
            <p className="mt-2 text-muted-foreground">
              请登录后查看和管理你的链接
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#006c49] px-5 text-sm font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006c49]/90 dark:bg-[#4edea3] dark:text-[#002113] dark:hover:bg-[#4edea3]/90"
            >
              返回首页登录
            </Link>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <LinkIcon className="size-6 text-[#006c49] dark:text-[#4edea3]" />
                <h1 className="text-2xl font-bold text-foreground">我的链接</h1>
              </div>
              <p className="mt-1.5 text-base text-muted-foreground">
                管理你上传的所有 HTML 分享链接
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#006c49] px-5 text-sm font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] transition-all hover:bg-[#006c49]/90 active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)] dark:bg-[#4edea3] dark:text-[#002113] dark:hover:bg-[#4edea3]/90"
            >
              发布新链接
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-12">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="size-10 animate-pulse rounded-xl bg-[#e5eeff] dark:bg-[#1e314a]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-[#e5eeff] dark:bg-[#1e314a]" />
                      <div className="h-3 w-1/5 animate-pulse rounded bg-[#e5eeff] dark:bg-[#1e314a]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-12 text-center">
              <p className="text-destructive">{error}</p>
              <button
                className="mt-4 text-sm text-[#0058be] dark:text-[#adc6ff] hover:underline"
                onClick={fetchPages}
              >
                重试
              </button>
            </div>
          ) : (
            <LinksTable
              pages={data?.pages || []}
              total={data?.total || 0}
              limit={data?.limit || 5}
              onDelete={(id) => {
                if (!data) return;
                setData({
                  ...data,
                  pages: data.pages.filter((p) => p.id !== id),
                  total: data.total - 1,
                });
              }}
            />
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
