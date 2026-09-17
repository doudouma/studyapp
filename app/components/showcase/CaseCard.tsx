import { Link } from "@tanstack/react-router";
import { accentVars, getCaseAccent, getLeadFact } from "~/features/showcase/cases";
import { TERMINAL_FONT } from "./TerminalWindow";
import type { ShowcaseCase } from "@shared/types/showcase";

/** 列表页案例卡片（终端风格） */
export function CaseCard({ item, index = 0 }: { item: ShowcaseCase; index?: number }) {
  const accent = getCaseAccent(item);
  const lead = getLeadFact(item);
  const eager = index < 6;

  return (
    <Link
      to="/showcase/$slug"
      params={{ slug: item.slug }}
      style={{ ...accentVars(item), fontFamily: TERMINAL_FONT }}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#d9d9d0] bg-white transition-colors hover:border-[#006c49] dark:border-[#243244] dark:bg-[#0f1720] dark:hover:border-[#4edea3]"
    >
      <div
        className="relative h-24 shrink-0"
        style={{
          background: `linear-gradient(135deg, ${accent}26, ${accent}59 55%, ${accent}99)`,
        }}
      >
        {item.cover?.src ? (
          <img
            src={item.cover.src}
            alt=""
            className="absolute inset-0 size-full object-cover"
            loading={eager ? undefined : "lazy"}
            fetchPriority={index === 0 ? "high" : undefined}
          />
        ) : (
          <span className="absolute bottom-2 left-3 text-sm font-bold tracking-tight text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]">
            {item.name}
          </span>
        )}
        <span className="absolute right-2 top-2 flex items-center gap-1">
          {item.cover?.video ? (
            <span
              aria-hidden
              className="rounded-full bg-[#26302b]/85 px-1.5 py-0.5 text-[9px] font-semibold text-white"
            >
              ▶
            </span>
          ) : null}
          <span className="rounded-full bg-[#26302b]/85 px-2 py-0.5 text-[9px] font-semibold text-white">
            {item.category}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="text-[9px] font-bold uppercase tracking-wider text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]">
          {item.category}
          {item.tags[0] ? <span className="text-muted-foreground"> · {item.tags[0]}</span> : null}
        </div>
        <h3 className="mt-1 text-sm font-bold leading-snug text-[#26302b] dark:text-[#e6edf6]">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {item.summary}
        </p>

        {lead ? (
          <div className="mt-2 border-t border-dashed border-[#e6e6de] pt-2 text-[10px] text-muted-foreground dark:border-[#243244]">
            <span className="font-bold text-[#26302b] dark:text-[#c9d5e4]">{lead.value}</span>{" "}
            {lead.key}
          </div>
        ) : null}

        <div className="mt-auto pt-2 text-[10px] text-muted-foreground transition-colors group-hover:text-[#006c49] dark:group-hover:text-[#4edea3]">
          → {item.slug}
        </div>
      </div>
    </Link>
  );
}
