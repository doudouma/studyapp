import { useState, useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface PageItem {
  id: string;
  title: string;
  category: string;
  isPermanent: boolean;
  createdAt: number;
  expiresAt: number | null;
}

export function UserCenter() {
  const [user, setUser] = useState<any>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const session = await authClient.getSession();
    const u = session?.data?.user ?? null;
    setUser(u);

    if (u) {
      try {
        const res = await fetch("/api/pages");
        const data = await res.json() as { pages: PageItem[] };
        setPages(data.pages ?? []);
      } catch {}
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个页面？")) return;
    try {
      await fetch(`/api/pages/${id}`, { method: "DELETE" });
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  if (loading) return null;

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">我的页面</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.name} · {pages.length} / 5 个永久页面
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            退出登录
          </Button>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              还没有发布页面
            </p>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{page.title || "未命名"}</p>
                    <p className="text-xs text-muted-foreground">
                      /p/{page.id} · {page.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <a
                      href={`/p/${page.id}`}
                      target="_blank"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      打开
                    </a>
                    <button
                      className="text-xs text-destructive hover:underline"
                      onClick={() => handleDelete(page.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
