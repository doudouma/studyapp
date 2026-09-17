import { cn } from "~/lib/utils";
import type { ShowcaseFact } from "@shared/types/showcase";

/**
 * 详情页 facts 键值表
 * 强调色由祖先元素上的 --sc-accent / --sc-accent-dark 变量提供
 * （见 app/features/showcase/cases.ts 的 accentVars）
 */
export function CaseFacts({ facts }: { facts: ShowcaseFact[] }) {
  if (facts.length === 0) return null;
  return (
    <dl className="overflow-hidden rounded-lg border border-[#d9d9d0] bg-white dark:border-[#243244] dark:bg-[#0f1720]">
      {facts.map((f) => (
        <div
          key={f.key}
          className="grid grid-cols-[110px_1fr] gap-3 border-b border-dashed border-[#e6e6de] px-3.5 py-1.5 last:border-b-0 sm:grid-cols-[130px_1fr] dark:border-[#243244]"
        >
          <dt className="truncate text-[11px] text-muted-foreground">{f.key}</dt>
          <dd
            className={cn(
              "text-[11px] font-bold",
              f.highlight &&
                "text-[15px] leading-tight text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]",
            )}
          >
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
