import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shield, Globe, Trash2 } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    title: "管理后台 - 100mini",
    meta: [
      { name: "description", content: "管理员后台，管理用户和会员" },
    ],
  }),
  component: AdminPage,
});

interface MembershipInfo {
  expiresAt: number;
  isActive: boolean;
  startedAt: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: number;
  membership: MembershipInfo | null;
}

interface AdminUsersResponse {
  users: UserData[];
  total: number;
  page: number;
  pageSize: number;
}

interface AdminPageData {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  isSharedToSquare: boolean;
  createdAt: number;
  userName: string | null;
  userEmail: string | null;
}

interface AdminPagesResponse {
  items: AdminPageData[];
  total: number;
  page: number;
  pageSize: number;
}

type DurationOption = 1 | 3 | 6 | 12;

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"users" | "pages">("users");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User list state
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Page list state
  const [pages, setPages] = useState<AdminPageData[]>([]);
  const [pagesTotal, setPagesTotal] = useState(0);
  const [pagesPage, setPagesPage] = useState(1);
  const [pagesLoading, setPagesLoading] = useState(false);

  // Membership dialog state
  const [membershipUser, setMembershipUser] = useState<UserData | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(3);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Cancel dialog state
  const [cancelUser, setCancelUser] = useState<UserData | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Delete page dialog
  const [deletePage, setDeletePage] = useState<AdminPageData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageSize = 20;

  // Check auth and admin role
  useEffect(() => {
    authClient.getSession().then((session: any) => {
      const currentUser = session?.data?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser || currentUser.role !== "admin") {
        navigate({ to: "/" });
      }
    });
  }, []);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error((await res.json()).error || "加载失败");
      const data: AdminUsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      if (tab === "users") fetchUsers(1);
      else fetchPages(1);
    }
  }, [authLoading, tab]);

  const fetchPages = async (p: number) => {
    setPagesLoading(true);
    try {
      const res = await fetch(`/api/admin/pages?page=${p}&pageSize=${pageSize}&scope=all`);
      if (!res.ok) throw new Error("加载失败");
      const data: AdminPagesResponse = await res.json();
      setPages(data.items);
      setPagesTotal(data.total);
      setPagesPage(data.page);
    } catch {
      // ignore
    } finally {
      setPagesLoading(false);
    }
  };

  const handleDeletePage = async () => {
    if (!deletePage) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${deletePage.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setDeletePage(null);
      fetchPages(pagesPage);
      // Invalidate square cache so deleted page disappears immediately
      (window as any).__invalidateSquareCache?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSetMembership = async () => {
    if (!membershipUser) return;
    setDialogLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${membershipUser.id}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMonths: selectedDuration }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setMembershipUser(null);
      fetchUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!cancelUser) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${cancelUser.id}/membership`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setCancelUser(null);
      fetchUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  if (authLoading) return null;

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav user={user} />

      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12">
          {/* Header */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="size-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">管理后台</h1>
              </div>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setTab("users")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                tab === "users"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              用户管理
            </button>
            <button
              onClick={() => setTab("pages")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                tab === "pages"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              页面管理
            </button>
          </div>

          {/* ===== User Management ===== */}
          {tab === "users" && (
            loading ? (
            <div className="rounded-xl border border-border bg-card p-12">
              <p className="text-center text-muted-foreground">加载中...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-destructive">{error}</p>
              <button
                className="mt-4 text-sm text-primary hover:underline"
                onClick={() => fetchUsers(page)}
              >
                重试
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">用户</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">邮箱</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">注册时间</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">角色</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">会员状态</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">过期时间</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={u.role === "admin" ? "text-primary font-semibold" : "text-muted-foreground"}>
                            {u.role === "admin" ? "管理员" : "用户"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.membership?.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">有效会员</span>
                          ) : u.membership && !u.membership.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">已过期</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">非会员</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {u.membership?.expiresAt ? formatDate(u.membership.expiresAt) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.membership?.isActive ? (
                            <Button variant="destructive" size="sm" onClick={() => setCancelUser(u)}>取消会员</Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => { setMembershipUser(u); setSelectedDuration(3); }}>设置会员</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">暂无用户数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>上一页</Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchUsers(page + 1)}>下一页</Button>
                </div>
              )}
            </>
          ))}

          {/* ===== Page Management ===== */}
          {tab === "pages" && (
            pagesLoading ? (
              <div className="rounded-xl border border-border bg-card p-12">
                <p className="text-center text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">标题</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">作者</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">分类</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">浏览</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">广场</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">创建时间</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.title || "未命名"}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.userName || p.userEmail || "匿名"}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.viewCount}</td>
                          <td className="px-4 py-3">
                            {p.isSharedToSquare ? (
                              <span className="text-xs font-medium text-green-600">已分享</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(p.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="destructive" size="sm" onClick={() => setDeletePage(p)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {pages.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">暂无页面数据</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {pagesTotal > pageSize && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={pagesPage <= 1} onClick={() => fetchPages(pagesPage - 1)}>上一页</Button>
                    <span className="text-sm text-muted-foreground">{pagesPage} / {Math.ceil(pagesTotal / pageSize)}</span>
                    <Button variant="outline" size="sm" disabled={pagesPage >= Math.ceil(pagesTotal / pageSize)} onClick={() => fetchPages(pagesPage + 1)}>下一页</Button>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </main>

      {/* Set Membership Dialog */}
      <Dialog open={!!membershipUser} onOpenChange={(open) => !open && setMembershipUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>设置会员</DialogTitle>
            <DialogDescription>
              为用户 "{membershipUser?.name}" 设置会员身份
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">选择会员时长：</p>
            <div className="flex gap-2">
              {([1, 3, 6, 12] as DurationOption[]).map((m) => (
                <Button
                  key={m}
                  variant={selectedDuration === m ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedDuration(m)}
                >
                  {m}个月
                </Button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={dialogLoading}
              onClick={handleSetMembership}
            >
              {dialogLoading ? "设置中..." : "确认设置"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Membership Confirmation Dialog */}
      <Dialog open={!!cancelUser} onOpenChange={(open) => !open && setCancelUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>取消会员</DialogTitle>
            <DialogDescription>
              确定取消 "{cancelUser?.name}" 的会员资格？
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setCancelUser(null)}>
              返回
            </Button>
            <Button
              variant="destructive"
              disabled={cancelLoading}
              onClick={handleCancelMembership}
            >
              {cancelLoading ? "取消中..." : "确认取消"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Page Confirmation Dialog */}
      <Dialog open={!!deletePage} onOpenChange={(open) => !open && setDeletePage(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>删除页面</DialogTitle>
            <DialogDescription>
              确定删除 "{deletePage?.title || "未命名"}"？此操作不可撤销，页面将从广场移除。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeletePage(null)}>返回</Button>
            <Button variant="destructive" disabled={deleteLoading} onClick={handleDeletePage}>
              {deleteLoading ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
}
