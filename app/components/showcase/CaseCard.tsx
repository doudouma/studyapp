import { Link } from "@tanstack/react-router";
import { accentVars, getLeadFact } from "~/features/showcase/cases";
import { TERMINAL_FONT } from "./TerminalWindow";
import { SHOWCASE_ACCENT, type ShowcaseCase } from "@shared/types/showcase";

/** 列表页案例卡片（终端风格） */
export function CaseCard({ item, index = 0 }: { item: ShowcaseCase; index?: number }) {
  const lead = getLeadFact(item);
  const eager = index < 6;

  return (
    <Link
      to="/showcase/$slug"
      params={{ slug: item.slug }}
      style={{ ...accentVars(), fontFamily: TERMINAL_FONT }}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#cfcfcf] bg-white transition-colors hover:border-[#006c49] dark:border-[#243244] dark:bg-[#0f1720] dark:hover:border-[#4edea3]"
    >
      {/* 缩略图按卡片宽度自适应（16:9），宽度越大图越大 */}
      <div
        className="relative aspect-video shrink-0 overflow-hidden"
        style={{
          // 图还没补上时的兜底底色（固定主绿）
          background: `linear-gradient(135deg, ${SHOWCASE_ACCENT}26, ${SHOWCASE_ACCENT}59 55%, ${SHOWCASE_ACCENT}99)`,
        }}
      >
        <img
          src={item.cover.src}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading={eager ? undefined : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
          // 图还没补进 public/showcase/ 时不要露出破图，回退到下面的分类渐变色块
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="absolute right-2 top-2 flex items-center gap-1">
          {item.cover.video ? (
            <span
              aria-hidden
              className="rounded-full bg-[#000000]/85 px-1.5 py-0.5 text-[9px] font-semibold text-white"
            >
              ▶
            </span>
          ) : null}
          <span className="rounded-full bg-[#000000]/85 px-2 py-0.5 text-[9px] font-semibold text-white">
            {item.category}
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="text-[9px] font-bold uppercase tracking-wider text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]">
          {item.category}
          {item.tags[0] ? <span className="text-muted-foreground"> · {item.tags[0]}</span> : null}
        </div>
        <h3 className="mt-1 text-sm font-bold leading-snug text-[#000000] dark:text-[#e6edf6]">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {item.summary}
        </p>

        {lead ? (
          <div className="mt-2 border-t border-dashed border-[#e0e0e0] pt-2 text-[10px] text-muted-foreground dark:border-[#243244]">
            <span className="font-bold text-[#000000] dark:text-[#c9d5e4]">{lead.value}</span>{" "}
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
