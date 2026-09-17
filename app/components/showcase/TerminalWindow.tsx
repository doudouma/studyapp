import { cn } from "~/lib/utils";

/** 终端等宽字体栈（系统字体，不引入 webfont，避免与 LCP 字体预算冲突） */
export const TERMINAL_FONT =
  'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace';

/** 终端窗口外壳：标题栏（三个圆点 + 路径）+ 内容区 */
export function TerminalWindow({
  title,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      style={{ fontFamily: TERMINAL_FONT }}
      className={cn(
        "overflow-hidden rounded-xl border border-[#d9d9d0] bg-[#fbfbf8] text-[#26302b] dark:border-[#243244] dark:bg-[#0d1117] dark:text-[#c9d5e4]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-[#d9d9d0] bg-[#f1f1ea] px-3 py-2 dark:border-[#243244] dark:bg-[#151d2b]">
        <span className="size-2 rounded-full bg-[#c9c9bf] dark:bg-[#3b4a5f]" />
        <span className="size-2 rounded-full bg-[#c9c9bf] dark:bg-[#3b4a5f]" />
        <span className="size-2 rounded-full bg-[#c9c9bf] dark:bg-[#3b4a5f]" />
        <span className="ml-1.5 truncate text-[10px] text-muted-foreground">{title}</span>
      </div>
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  );
}

/** `$` 提示符 */
export function TerminalPrompt() {
  return (
    <span aria-hidden className="select-none text-muted-foreground/50">
      $
    </span>
  );
}

/** 命令文本（强调色） */
export function TerminalCmd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-bold text-[#006c49] dark:text-[#4edea3]", className)}>{children}</span>
  );
}

/** 闪烁光标；prefers-reduced-motion 下停止动画 */
export function TerminalCursor({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "animate-blink ml-1 inline-block h-3 w-[7px] translate-y-0.5 bg-[#006c49] dark:bg-[#4edea3]",
        className,
      )}
    />
  );
}
