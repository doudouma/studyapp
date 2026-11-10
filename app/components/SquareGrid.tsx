import { useState } from "react";
import { FileText, Eye, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SquareItem } from "@shared/types/square";
import { useAuth } from "~/lib/auth-context";
import { deleteAdminPage } from "~/features/admin/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface SquareGridProps {
  items: SquareItem[];
  onDeleted?: (id: string) => void;
}

function PreviewCell({ item, index }: { item: SquareItem; index: number }) {
  const [showIframe, setShowIframe] = useState(false);
  const isPriority = index < 8;

  if (showIframe || !item.previewPath) {
    return (
      <iframe
        src={`/p/${item.slug ?? item.id}`}
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
      className="absolute inset-0 w-full h-full object-contain transition-transform group-hover:scale-105"
      loading={isPriority ? undefined : "lazy"}
      fetchPriority={index === 0 ? "high" : undefined}
      onError={() => setShowIframe(true)}
    />
  );
}

export function SquareGrid({ items, onDeleted }: SquareGridProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [deleteTarget, setDeleteTarget] = useState<SquareItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (target: SquareItem) => {
    setDeleting(true);
    setDeleteError("");
    try {
      const result = await deleteAdminPage(target.id);
      if (!result.ok) {
        setDeleteError(result.error || t("admin.page.deleteFailed"));
        return;
      }
      onDeleted?.(target.id);
      setDeleteTarget(null);
    } catch {
      setDeleteError(t("admin.page.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      general: t("home.select.default"),
      chinese: t("home.select.chinese"),
      math: t("home.select.math"),
      english: t("home.select.english"),
      physics: t("home.select.physics"),
      chemistry: t("home.select.chemistry"),
      history: t("home.select.history"),
      biology: t("home.select.biology"),
      geography: t("home.select.geography"),
      other: t("home.select.other"),
    };
    return labels[cat] || cat;
  };

  if (items.length === 0) {
    return (
      <div className="rounded-[2px] border border-[#e3e3e3] bg-white p-14 text-center dark:border-[#2a2d32] dark:bg-[#15171a]">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-[2px] bg-[#d8ff00]">
          <FileText className="size-6 text-[#111214] dark:text-[#d8ff00]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{t("square.empty.title")}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("square.empty.desc")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-[2px] border border-[#e3e3e3] bg-white transition-colors hover:border-[#111214] dark:border-[#2a2d32] dark:bg-[#15171a] dark:hover:border-[#d8ff00]"
          >
            {/* HTML preview via iframe */}
            <a
              href={`/p/${item.slug ?? item.id}`}
              target="_blank"
              className="relative block overflow-hidden"
            >
              <div className="relative overflow-hidden bg-[#f2f2f2] dark:bg-[#1b1e22]" style={{ aspectRatio: "2/3" }}>
                <PreviewCell item={item} index={index} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 z-10">
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <Eye className="size-4" />
                    {t("square.viewPage")}
                  </span>
                </div>
              </div>
            </a>

            {/* Info */}
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span
                  className="inline-block rounded-[2px] bg-[#f2f2f2] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.06em] text-[#111214] dark:bg-[#1b1e22] dark:text-[#ededed]"
                >
                  {getCategoryLabel(item.category)}
                </span>
                {item.tags && item.tags.split(/[,，]+/).map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-[2px] bg-[#f2f2f2] px-2 py-0.5 text-[9px] font-semibold text-[#6f6f6f] dark:bg-[#1b1e22] dark:text-[#9a9a9a]"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
              <h3 className="truncate text-[13px] font-bold text-foreground">
                {item.title || t("square.unnamed")}
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.userName ? (
                    <>
                      {item.userImage ? (
                        <img
                          src={item.userImage}
                          alt={item.userName}
                          className="size-5 rounded-[2px]"
                        />
                      ) : (
                        <div className="flex size-5 items-center justify-center rounded-[2px] bg-[#d8ff00] text-[10px] font-bold text-[#111214]">
                          {item.userName.charAt(0)}
                        </div>
                      )}
                      <span>{item.userName}</span>
                    </>
                  ) : (
                    <span>{t("square.anonymous")}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {item.viewCount}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteTarget(item);
                      }}
                      className="flex items-center gap-1 text-destructive hover:text-destructive/80 transition-colors"
                      title={t("common.delete")}
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="size-3.5" />
                      {t("common.delete")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("admin.page.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.page.deleteDesc", {
                name: deleteTarget?.title || t("square.unnamed"),
              })}
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={deleting}>{t("common.cancel")}</Button>} />
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => handleDelete(deleteTarget as SquareItem)}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" />
                  {t("common.deleting")}
                </>
              ) : (
                t("common.confirmDelete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
