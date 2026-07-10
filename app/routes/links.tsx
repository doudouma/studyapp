import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Link as LinkIcon, User, Crown, Clock, Hash, ArrowUpRight } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { LinksTable } from "~/components/LinksTable";
import { useAuth } from "~/lib/auth-context";

export const Route = createFileRoute("/links")({
  head: () => ({
    title: "个人中心 - 100mini",
    meta: [
      {
        name: "description",
        content: "管理你的账号、链接和番茄数据",
      },
    ],
  }),
  component: LinksPage,
});

interface PageData {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  createdAt: number;
}

interface PagesResponse {
  pages: PageData[];
  total: number;
  limit: number;
}

interface PomodoroCount {
  today: number;
  total: number;
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-5 flex items-center gap-4">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${accent || "bg-[#006c49]/10 dark:bg-[#4edea3]/10"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function LinksPage() {
  const { user, authLoading, isMember, membershipExpiresAt, refreshAuth } = useAuth();
  const [data, setData] = useState<PagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pomoCount, setPomoCount] = useState<PomodoroCount>({ today: 0, total: 0 });

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error || "加载失败");
      }
      const json = (await res.json()) as PagesResponse;
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
      fetch("/api/pomodoro/today-count").then(r => r.json()).then(d => {
        if (d && typeof d.today === "number") setPomoCount(d);
      }).catch(() => {});
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 dark:bg-[#4edea3]/10">
              <User className="size-6 text-[#006c49] dark:text-[#4edea3]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">个人中心</h1>
            <p className="mt-2 text-muted-foreground">
              请登录后查看你的数据和链接
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

  const memberLabel = isMember
    ? `会员 ${membershipExpiresAt ? `· ${new Date(membershipExpiresAt).toLocaleDateString("zh-CN")} 到期` : ""}`
    : "普通用户";

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12">
          {/* Profile Header */}
          <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary font-bold text-xl text-primary-foreground overflow-hidden shrink-0">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="size-full object-cover" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">个人中心</h1>
                  {isMember ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Crown className="size-3" /> 会员
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{memberLabel}</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#006c49] px-5 text-sm font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] transition-all hover:bg-[#006c49]/90 active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)] dark:bg-[#4edea3] dark:text-[#002113] dark:hover:bg-[#4edea3]/90"
            >
              发布新链接
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Crown className="size-5 text-amber-600 dark:text-amber-400" />}
              label="会员状态"
              value={isMember ? "已开通" : "未开通"}
              accent="bg-amber-100 dark:bg-amber-900/20"
            />
            <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-5 flex items-center gap-4 col-span-2 md:col-span-1">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#006c49]/10 dark:bg-[#4edea3]/10">
                <span className="text-lg">🍅</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">番茄</p>
                <div className="flex gap-4 mt-0.5">
                  <div>
                    <span className="text-xl font-bold text-foreground">{pomoCount.today}</span>
                    <span className="text-xs text-muted-foreground ml-1">今日</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-foreground">{pomoCount.total}</span>
                    <span className="text-xs text-muted-foreground ml-1">累计</span>
                  </div>
                </div>
              </div>
            </div>
            <StatCard
              icon={<LinkIcon className="size-5 text-[#006c49] dark:text-[#4edea3]" />}
              label="管理链接"
              value={data?.total ?? "-"}
            />
          </div>

          {/* Links Section */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <LinkIcon className="size-5 text-[#006c49] dark:text-[#4edea3]" />
              链接管理
            </h2>
          </div>

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
              onRefresh={fetchPages}
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
