import { useTranslation } from "react-i18next";
import type { Book } from "./data";

function short(n: number): string {
  const value = Number(n) || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

export function BookCard({
  book,
  index,
  subtag,
}: {
  book: Book;
  index: number;
  /** Optional per-page tracking segment, e.g. a programmatic page slug. */
  subtag?: string;
}) {
  const { t } = useTranslation();
  const tracking = subtag ? `${subtag}-${book.asin}-${index + 1}` : `${book.asin}-${index + 1}`;
  const separator = book.url.includes("?") ? "&" : "?";

  return (
    <a
      href={`${book.url}${separator}ascsubtag=shelf-${tracking}`}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="group flex min-w-0 flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] border border-[#e3e3e3] bg-[#f2f2f2] transition dark:bg-[#1b1e22] duration-200 group-hover:-translate-y-1 group-hover:border-[#111214] dark:border-[#2a2d32] dark:group-hover:border-[#d8ff00]">
        <img
          src={book.image}
          alt={book.displayTitle || book.title}
          loading={index < 8 ? undefined : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
          decoding="async"
          className="size-full object-cover"
        />
        {book.rating ? (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-[#111214] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#d8ff00]">
            ★ {book.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <h3
        className="mt-2.5 line-clamp-2 text-[13px] font-bold leading-snug text-foreground"
        title={book.title}
      >
        {book.displayTitle || book.title}
      </h3>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{book.displayAuthor || "—"}</p>
      <p className="mt-1.5 flex items-center justify-between gap-2 whitespace-nowrap text-[10px] text-muted-foreground/80">
        <span>{t("aiBooks.ratingsCount", { count: short(book.reviews) })}</span>
        <span className="font-bold text-[#111214] group-hover:underline dark:text-[#d8ff00]">
          {t("aiBooks.checkPrice")}
        </span>
      </p>
    </a>
  );
}
