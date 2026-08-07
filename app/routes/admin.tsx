import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, Shield, Trash2 } from "lucide-react";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/admin")({
  head: () => ({
    title: i18n.t("admin.title"),
    meta: [
      { name: "description", content: i18n.t("admin.desc") },
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const [tab, setTab] = useState<"users" | "pages">("users");

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

  const pageSize = 10;

  // Check auth and admin role
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        navigate({ to: "/" });
      }
    }
  }, [user, authLoading]);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error || i18n.t("common.loadFailed"));
      const data: AdminUsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.t("common.loadFailed"));
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
      if (!res.ok) throw new Error(i18n.t("common.loadFailed"));
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
      if (!res.ok) throw new Error(i18n.t("admin.page.deleteFailed"));
      setDeletePage(null);
      fetchPages(pagesPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : i18n.t("admin.page.deleteFailed"));
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
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error || i18n.t("admin.page.actionFailed"));
      setMembershipUser(null);
      fetchUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : i18n.t("admin.page.actionFailed"));
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
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error || i18n.t("admin.page.actionFailed"));
      setCancelUser(null);
      fetchUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : i18n.t("admin.page.actionFailed"));
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
      <AppNav />

      <main className="flex-1 bg-[#eff4ff] dark:bg-[#1e314a]">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="size-6 text-[#006c49] dark:text-[#4edea3]" />
                <h1 className="text-2xl font-bold text-foreground">{t("admin.heading")}</h1>
              </div>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="mb-6 flex items-center gap-2 border-b border-[#d3e4fe] dark:border-[#3c4a42] pb-3">
            <button
              onClick={() => setTab("users")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                tab === "users"
                  ? "bg-[#006c49] text-white dark:bg-[#4edea3] dark:text-[#002113]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("admin.tab.users")}
            </button>
            <button
              onClick={() => setTab("pages")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                tab === "pages"
                  ? "bg-[#006c49] text-white dark:bg-[#4edea3] dark:text-[#002113]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("admin.tab.pages")}
            </button>
          </div>

          {/* ===== User Management ===== */}
          {tab === "users" && (
            loading ? (
            <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-12">
              <p className="text-center text-muted-foreground">{t("common.loading")}</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-12 text-center">
              <p className="text-destructive">{error}</p>
              <button
                className="mt-4 text-sm text-[#0058be] dark:text-[#adc6ff] hover:underline"
                onClick={() => fetchUsers(page)}
              >
                {t("common.retry")}
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#d3e4fe] dark:border-[#3c4a42] bg-[#e5eeff]/30 dark:bg-[#1e314a]/30">
                      <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.user")}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95] hidden md:table-cell">{t("admin.col.email")}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95] hidden sm:table-cell">{t("admin.col.regDate")}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.role")}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.memberStatus")}</th>
                      <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95] hidden md:table-cell">{t("admin.col.expiry")}</th>
                      <th className="px-4 py-3 text-right font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[#d3e4fe] dark:border-[#3c4a42] last:border-0 hover:bg-[#e5eeff]/20 dark:hover:bg-[#1e314a]/20">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={u.role === "admin" ? "text-[#006c49] dark:text-[#4edea3] font-semibold" : "text-muted-foreground"}>
                            {u.role === "admin" ? t("admin.role.admin") : t("admin.role.user")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.membership?.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">{t("admin.member.active")}</span>
                          ) : u.membership && !u.membership.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">{t("admin.member.expired")}</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">{t("admin.member.none")}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {u.membership?.expiresAt ? formatDate(u.membership.expiresAt) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.membership?.isActive ? (
                            <Button variant="destructive" size="sm" onClick={() => setCancelUser(u)}>{t("admin.member.cancel")}</Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => { setMembershipUser(u); setSelectedDuration(3); }}>{t("admin.member.set")}</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{t("admin.empty.users")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>{t("admin.pagination.prev")}</Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchUsers(page + 1)}>{t("admin.pagination.next")}</Button>
                </div>
              )}
            </>
          ))}

          {/* ===== Page Management ===== */}
          {tab === "pages" && (
            pagesLoading ? (
              <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-12">
                <p className="text-center text-muted-foreground">{t("common.loading")}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#d3e4fe] dark:border-[#3c4a42] bg-[#e5eeff]/30 dark:bg-[#1e314a]/30">
                        <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.title")}</th>
                        <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95] hidden md:table-cell">{t("admin.col.author")}</th>
                        <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95] hidden sm:table-cell">{t("admin.col.category")}</th>
                        <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.views")}</th>
                        <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.square")}</th>
                        <th className="px-4 py-3 text-left font-medium text-[#3c4a42] dark:text-[#8f9e95] hidden md:table-cell">{t("admin.col.createdAt")}</th>
                        <th className="px-4 py-3 text-right font-medium text-[#3c4a42] dark:text-[#8f9e95]">{t("admin.col.action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((p) => (
                        <tr key={p.id} className="border-b border-[#d3e4fe] dark:border-[#3c4a42] last:border-0 hover:bg-[#e5eeff]/20 dark:hover:bg-[#1e314a]/20">
                          <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.title || t("admin.unnamed")}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.userName || p.userEmail || t("admin.anonymous")}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.viewCount}</td>
                          <td className="px-4 py-3">
                            {p.isSharedToSquare ? (
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">{t("admin.shared")}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(p.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a href={`/p/${p.id}`} target="_blank" rel="noreferrer" title={t("admin.page.view")}>
                                <Button variant="outline" size="sm" className="px-2">
                                  <Eye className="size-3.5" />
                                </Button>
                              </a>
                              <Button variant="destructive" size="sm" onClick={() => setDeletePage(p)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pages.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{t("admin.empty.pages")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {pagesTotal > pageSize && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={pagesPage <= 1} onClick={() => fetchPages(pagesPage - 1)}>{t("admin.pagination.prev")}</Button>
                    <span className="text-sm text-muted-foreground">{pagesPage} / {Math.ceil(pagesTotal / pageSize)}</span>
                    <Button variant="outline" size="sm" disabled={pagesPage >= Math.ceil(pagesTotal / pageSize)} onClick={() => fetchPages(pagesPage + 1)}>{t("admin.pagination.next")}</Button>
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
            <DialogTitle>{t("admin.member.setTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.member.setDesc", { name: membershipUser?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{t("admin.member.selectDuration")}</p>
            <div className="flex gap-2">
              {([1, 3, 6, 12] as DurationOption[]).map((m) => (
                <Button
                  key={m}
                  variant={selectedDuration === m ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedDuration(m)}
                >
                  {m}{t("admin.member.months")}
                </Button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={dialogLoading}
              onClick={handleSetMembership}
            >
              {dialogLoading ? t("admin.member.setting") : t("admin.member.confirmSet")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Membership Confirmation Dialog */}
      <Dialog open={!!cancelUser} onOpenChange={(open) => !open && setCancelUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.member.cancelTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.member.cancelDesc", { name: cancelUser?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setCancelUser(null)}>
              {t("admin.return")}
            </Button>
            <Button
              variant="destructive"
              disabled={cancelLoading}
              onClick={handleCancelMembership}
            >
              {cancelLoading ? t("admin.member.cancelling") : t("admin.member.confirmCancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Page Confirmation Dialog */}
      <Dialog open={!!deletePage} onOpenChange={(open) => !open && setDeletePage(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.page.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.page.deleteDesc", { name: deletePage?.title || t("admin.unnamed") })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeletePage(null)}>{t("admin.return")}</Button>
            <Button variant="destructive" disabled={deleteLoading} onClick={handleDeletePage}>
              {deleteLoading ? t("common.deleting") : t("admin.page.confirmDelete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
}
