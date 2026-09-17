import { cn } from "~/lib/utils";
import { toneVars } from "~/features/showcase/cases";
import type { ShowcaseBlock, ShowcaseCell } from "@shared/types/showcase";

/** 表格单元格：字符串写法补全为对象 */
function asCell(c: string | ShowcaseCell): ShowcaseCell {
  return typeof c === "string" ? { text: c } : c;
}

/**
 * 详情页正文的内容块渲染（清单 / 对照表 / 结论块）
 * 强调色来自祖先元素的 --sc-accent / --sc-accent-dark 变量，
 * 档位色调来自块自身的 --sc-tone / --sc-tone-dark 变量
 */
export function CaseBlocks({ blocks }: { blocks: ShowcaseBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "text":
            return (
              <p key={i} className="text-[11.5px] leading-[1.75] text-[#4b5563] dark:text-[#9fb0c3]">
                {block.text}
              </p>
            );

          case "list":
            return (
              <ul key={i} className="space-y-1.5">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[11.5px] leading-[1.7] text-[#4b5563] dark:text-[#9fb0c3]"
                  >
                    <span
                      aria-hidden
                      className="shrink-0 text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]"
                    >
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );

          case "table":
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-lg border border-[#d9d9d0] dark:border-[#243244]"
              >
                <table
                  className={cn(
                    "w-full border-collapse text-left",
                    block.columns.length >= 3 ? "min-w-[600px]" : "min-w-[320px]",
                  )}
                >
                  <thead>
                    <tr className="bg-[#f1f1ea] dark:bg-[#151d2b]">
                      {block.columns.map((col, j) => (
                        <th
                          key={j}
                          className="px-3 py-1.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr
                        key={r}
                        className="border-t border-dashed border-[#e6e6de] align-top dark:border-[#243244]"
                      >
                        {row.map((raw, ci) => {
                          const cell = asCell(raw);
                          return (
                            <td
                              key={ci}
                              className={cn(
                                "px-3 py-2 text-[11px] leading-[1.6]",
                                ci === 0
                                  ? "font-bold whitespace-nowrap text-[#26302b] dark:text-[#e6edf6]"
                                  : "text-[#4b5563] dark:text-[#9fb0c3]",
                              )}
                            >
                              {cell.tone ? (
                                <span
                                  style={toneVars(cell.tone)}
                                  className="font-bold whitespace-nowrap text-[color:var(--sc-tone)] dark:text-[color:var(--sc-tone-dark)]"
                                >
                                  {cell.text}
                                </span>
                              ) : (
                                cell.text
                              )}
                              {cell.sub ? (
                                <span className="block text-[10px] whitespace-nowrap text-muted-foreground">
                                  {cell.sub}
                                </span>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "note":
            return (
              <div
                key={i}
                style={block.tone ? toneVars(block.tone) : undefined}
                className={cn(
                  "rounded-lg border-l-2 bg-[#f7f7f1] px-3.5 py-2.5 dark:bg-[#101a24]",
                  block.tone
                    ? "border-l-[color:var(--sc-tone)] dark:border-l-[color:var(--sc-tone-dark)]"
                    : "border-l-[color:var(--sc-accent)] dark:border-l-[color:var(--sc-accent-dark)]",
                )}
              >
                {block.label ? (
                  <div
                    className={cn(
                      "text-[10px] font-bold tracking-wider uppercase",
                      block.tone
                        ? "text-[color:var(--sc-tone)] dark:text-[color:var(--sc-tone-dark)]"
                        : "text-[color:var(--sc-accent)] dark:text-[color:var(--sc-accent-dark)]",
                    )}
                  >
                    {block.label}
                  </div>
                ) : null}
                <p className="mt-0.5 text-[11.5px] leading-[1.7] text-[#374151] dark:text-[#c9d5e4]">
                  {block.text}
                </p>
              </div>
            );
        }
      })}
    </>
  );
}
