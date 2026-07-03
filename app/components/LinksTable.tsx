import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { FileText, ExternalLink, Copy, Trash2, Loader2, QrCode } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";

interface PageLink {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  createdAt: number;
}

interface LinksTableProps {
  pages: PageLink[];
  total: number;
  limit: number;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
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

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}年${m}月${day}日`;
}

function QrPopover({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const [qrSvg, setQrSvg] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = `${window.location.origin}/p/${pageId}`;
    import("qrcode/lib/browser.js").then((QRCode) => {
      QRCode.toString(url, { type: "svg", width: 160, margin: 2 }).then(setQrSvg);
    });
  }, [pageId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 z-50 rounded-lg border border-border bg-card p-3 shadow-lg"
    >
      {qrSvg && (
        <div
          className="size-36 [&>svg]:block [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      )}
    </div>
  );
}

export function LinksTable({ pages, total, limit, onDelete }: LinksTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleCopy = async (id: string) => {
    const url = `${window.location.origin}/p/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeleteError("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data: { error?: string } = await res.json();
        setDeleteError(data.error || "删除失败");
        return;
      }
      onDelete(id);
    } catch {
      setDeleteError("删除失败，请稍后重试");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {pages.length === 0 ? (
        <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-14 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 dark:bg-[#4edea3]/10">
            <FileText className="size-6 text-[#006c49] dark:text-[#4edea3]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">还没有创建链接</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            上传你的第一个 HTML 页面，链接就会出现在这里
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#006c49] px-5 text-sm font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006c49]/90 dark:bg-[#4edea3] dark:text-[#002113] dark:hover:bg-[#4edea3]/90"
          >
            去上传
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    标题
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    创建日期
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    阅读量
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-right">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.map((pg) => (
                  <tr key={pg.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {pg.title || "未命名"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_ICONS[pg.category] || pg.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(pg.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-foreground">
                        {pg.viewCount}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-1 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          title="二维码"
                          onClick={() => setQrId(qrId === pg.id ? null : pg.id)}
                        >
                          <QrCode className="size-4" />
                        </Button>
                        {qrId === pg.id && (
                          <QrPopover pageId={pg.id} onClose={() => setQrId(null)} />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          title="查看"
                          onClick={() => window.open(`/p/${pg.id}`, "_blank")}
                        >
                          <ExternalLink className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          title="复制链接"
                          onClick={() => handleCopy(pg.id)}
                        >
                          {copiedId === pg.id ? (
                            <span className="text-xs font-medium text-primary">已复制</span>
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="删除"
                          disabled={deletingId === pg.id}
                          onClick={() => {
                            setConfirmDeleteId(pg.id);
                            setConfirmDeleteTitle(pg.title || "未命名");
                          }}
                        >
                          {deletingId === pg.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border bg-muted/20 px-6 py-3">
            <p className="text-xs text-muted-foreground">
              显示 {pages.length} / {total} 个链接
              {limit > 0 ? (
                <span className="ml-1">
                  · 已使用 {total}/{limit}
                </span>
              ) : limit === -1 ? (
                <span className="ml-1">
                  · 已使用 {total}（会员无限制）
                </span>
              ) : null}
            </p>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          <span>{deleteError}</span>
          <button
            className="ml-2 text-destructive/70 hover:text-destructive"
            onClick={() => setDeleteError("")}
          >
            关闭
          </button>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!confirmDeleteId}
        title={confirmDeleteTitle}
        deleting={deletingId === confirmDeleteId}
        onConfirm={async () => {
          const id = confirmDeleteId;
          if (!id) return;
          setConfirmDeleteId(null);
          await handleDelete(id);
        }}
        onClose={() => setConfirmDeleteId(null)}
      />
    </>
  );
}

function DeleteConfirmDialog({
  open,
  title,
  deleting,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除「{title}」吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">取消</Button>} />
          <Button variant="destructive" disabled={deleting} onClick={onConfirm}>
            {deleting ? (
              <><Loader2 className="size-4 animate-spin mr-1" /> 删除中</>
            ) : (
              "确认删除"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
