import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { FileText, ExternalLink, Copy, Trash2, Loader2, QrCode, Pencil, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { DropZone } from "~/components/DropZone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";

export interface PageLink {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  createdAt: number;
}

interface LinksTableProps {
  pages: PageLink[];
  total: number;
  limit: number;
  onDelete: (id: string) => void;
  onRefresh: () => void;
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

export function LinksTable({ pages, total, limit, onDelete, onRefresh }: LinksTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [editPage, setEditPage] = useState<PageLink | null>(null);

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
                          title="编辑"
                          onClick={() => setEditPage(pg)}
                        >
                          <Pencil className="size-4" />
                        </Button>
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

      <EditDialog
        page={editPage}
        onClose={() => setEditPage(null)}
        onSaved={() => {
          setEditPage(null);
          onRefresh();
        }}
      />
    </>
  );
}

function EditDialog({
  page,
  onClose,
  onSaved,
}: {
  page: PageLink | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<"meta" | "content">("meta");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [contentMode, setContentMode] = useState<"paste" | "upload">("paste");
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (page) {
      setTab("meta");
      setTitle(page.title);
      setCategory(page.category || "general");
      setTags(page.tags ? page.tags.split(",").filter(Boolean) : []);
      setTagInput("");
      setContent("");
      setContentFile(null);
      setError("");
    }
  }, [page]);

  const loadContent = async () => {
    if (!page) return;
    setContentLoading(true);
    setContentFile(null);
    try {
      const res = await fetch(`/api/pages/${page.id}/content`);
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json() as { content: string };
      setContent(data.content);
    } catch {
      setError("内容加载失败");
    } finally {
      setContentLoading(false);
    }
  };

  const addTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    const existing = new Set(tags);
    const newTags = raw.split(/[,，\s]+/).filter(t => t && !existing.has(t));
    if (newTags.length > 0) {
      setTags([...tags, ...newTags].slice(0, 10));
    }
    setTagInput("");
  };

  const removeTag = (i: number) => {
    setTags(tags.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!page || saving) return;
    setError("");
    setSaving(true);
    try {
      let res: Response;
      if (contentFile) {
        // Send file to server (multipart) — server handles ZIP extraction
        const formData = new FormData();
        formData.append("file", contentFile);
        formData.append("title", title);
        formData.append("category", category);
        formData.append("tags", tags.join(","));
        res = await fetch(`/api/pages/${page.id}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        const body: { title: string; category: string; tags: string; content?: string } = { title, category, tags: tags.join(",") };
        if (content) body.content = content;
        res = await fetch(`/api/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error || "保存失败");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!page} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={tab === "content" ? "sm:max-w-3xl" : "sm:max-w-md"} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>编辑链接</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-1">
          <button
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${tab === "meta" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("meta")}
          >
            基本信息
          </button>
          <button
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${tab === "content" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setTab("content"); loadContent(); }}
          >
            内容编辑
          </button>
        </div>

        {tab === "meta" ? (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">
                标题 <span className="text-destructive">*</span>
              </label>
              <Input
                className="mt-1"
                placeholder="输入页面标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">类型</label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="general">通用</option>
                <option value="chinese">语文</option>
                <option value="math">数学</option>
                <option value="english">英语</option>
                <option value="physics">物理</option>
                <option value="chemistry">化学</option>
                <option value="history">历史</option>
                <option value="biology">生物</option>
                <option value="geography">地理</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                标签{" "}
                <span className="font-normal text-muted-foreground">
                  (可选，最多10个)
                </span>
              </label>
              <div className="mt-1 flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border-2 border-input bg-transparent px-2 py-1.5 cursor-text" onClick={() => document.getElementById('edit-tag-input')?.focus()}>
                {tags.map((t, i) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                    {t}
                    <button type="button" className="rounded-sm hover:bg-primary/30 transition-colors text-primary/70" onClick={(e) => { e.stopPropagation(); removeTag(i); }}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <input
                  id="edit-tag-input"
                  className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={tags.length === 0 ? "输入标签后按回车添加" : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
                      removeTag(tags.length - 1);
                    }
                  }}
                  onBlur={addTag}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 min-h-[300px] flex flex-col">
            {contentLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin mr-2" />
                加载内容…
              </div>
            ) : (
              <Tabs value={contentMode} onValueChange={(v) => setContentMode(v as "paste" | "upload")}>
                <TabsList variant="line" className="mb-4">
                  <TabsTrigger value="paste">粘贴代码</TabsTrigger>
                  <TabsTrigger value="upload">上传文件</TabsTrigger>
                </TabsList>
                <TabsContent value="paste">
                  <textarea
                    className="w-full min-h-[40vh] rounded-lg border border-border bg-background p-4 text-sm font-mono outline-none resize-y leading-relaxed focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="在此粘贴你的 HTML/CSS/JS 代码..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    spellCheck={false}
                  />
                </TabsContent>
                <TabsContent value="upload">
                  <DropZone file={contentFile} onFileSelect={(f) => { setContentFile(f); if (f) setContent(""); }} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? <><Loader2 className="size-4 animate-spin mr-1" /> 保存中</> : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
