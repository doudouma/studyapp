import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, LogIn, RotateCw } from "lucide-react";
import { useAuth } from "~/lib/auth-context";
import { AuthDialog } from "~/components/AuthDialog";
import { castTierlistVote, fetchTierlistBoard } from "~/features/tierlist/api";
import {
  TIERLIST_BOARDS,
  TIER_LEVEL_LABELS,
  type TierlistBoard,
  type TierlistToolResult,
} from "@shared/types/tierlist";

/**
 * 社区投票榜（固定榜 + 逐工具投票）
 *
 * 与上面的「建榜工具」分工不同：这里是**固定榜单**，登录用户对每个工具
 * 投一档（S/A/B/C/D），同一工具重复投票即改票，服务端按
 * (user, board, tool) 唯一约束保证一人一票。
 *
 * 展示遵循「透明算术」：票数分布条 + 每档票数 + 总票数 + 由加权平均
 * 四舍五入得出的流行等级；0 票显示为未评级，不编造默认名次。
 */

/** 与建榜工具的默认等级色一致 */
const LEVEL_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#64748b"];

type Status = "loading" | "ready" | "error";

export function VoteBoard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [board, setBoard] = useState<TierlistBoard>(TIERLIST_BOARDS[0]);
  const [results, setResults] = useState<TierlistToolResult[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [pending, setPending] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    const data = await fetchTierlistBoard(board);
    if (!data) {
      setStatus("error");
      return;
    }
    setResults(data.results);
    setMyVotes(data.myVotes);
    setStatus("ready");
  }, [board]);

  // 切榜、或登录态变化（登录后要带上我的投票）时重新拉取
  useEffect(() => {
    void load();
  }, [load, user?.id]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  /** 乐观更新：票从旧档挪到新档，失败则整榜回滚（服务端为准） */
  const vote = async (tool: string, tier: number) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (pending) return;

    const prevTier = myVotes[tool] ?? null;
    setResults((prev) =>
      prev.map((r) => {
        if (r.tool !== tool) return r;
        const votes = [...r.votes];
        if (prevTier !== null && prevTier !== tier) {
          votes[prevTier] = Math.max(0, votes[prevTier] - 1);
        }
        votes[tier] += 1;
        const total = votes.reduce((sum, n) => sum + n, 0);
        const weighted = votes.reduce((sum, n, level) => sum + n * level, 0);
        const avgTier = total > 0 ? weighted / total : null;
        return {
          ...r,
          votes,
          total,
          avgTier,
          rank: avgTier === null ? null : Math.min(4, Math.round(avgTier)),
          myTier: tier,
        };
      }),
    );
    setMyVotes((prev) => ({ ...prev, [tool]: tier }));

    setPending(tool);
    const res = await castTierlistVote(board, tool, tier);
    setPending(null);

    if (!res.data) {
      await load(); // 回滚到服务端事实
      showToast(res.error ?? t("aiTierlist.vote.castFail"));
      return;
    }
    showToast(t("aiTierlist.vote.castSuccess"));
  };

  return (
    <section className="mx-auto max-w-5xl px-6 pt-14" aria-labelledby="vote-heading">
      <h2 id="vote-heading" className="text-2xl font-bold tracking-tight text-foreground">
        {t("aiTierlist.vote.title")}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        {t("aiTierlist.vote.desc")}
      </p>
      <p className="mt-1 text-[13px] text-muted-foreground/80">
        {user ? t("aiTierlist.vote.hint") : t("aiTierlist.vote.loginHint")}
      </p>

      {/* 主题榜 tab */}
      <div
        className="mt-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("aiTierlist.vote.tabsLabel")}
      >
        {TIERLIST_BOARDS.map((key) => {
          const active = key === board;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setBoard(key)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                active
                  ? "border-[#006c49] bg-[#006c49] text-white dark:border-[#4edea3] dark:bg-[#4edea3] dark:text-[#002113]"
                  : "border-border bg-card text-muted-foreground hover:border-[#006c49]/40 hover:text-foreground dark:hover:border-[#4edea3]/40"
              }`}
            >
              {t(`aiTierlist.theme.${key}.label`)}
            </button>
          );
        })}
      </div>

      {/* 结果区 */}
      <div className="mt-4 space-y-3">
        {status === "loading" && (
          <div className="rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
            {t("aiTierlist.vote.loading")}
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
            <span>{t("aiTierlist.vote.loadFail")}</span>
            <button
              onClick={() => void load()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:border-[#006c49] hover:text-[#006c49] dark:hover:border-[#4edea3] dark:hover:text-[#4edea3]"
            >
              <RotateCw className="size-3.5" />
              {t("common.retry")}
            </button>
          </div>
        )}

        {status === "ready" &&
          results.map((r) => (
            <div
              key={r.tool}
              data-testid="vote-row"
              className="rounded-2xl border border-border/70 bg-card p-4 sm:flex sm:items-start sm:gap-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{r.tool}</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {t(`aiTierlist.cat.${r.cat}`)}
                  </span>
                  {r.myTier !== null && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:text-[#4edea3]">
                      {t("aiTierlist.vote.myVote")}: {TIER_LEVEL_LABELS[r.myTier]}
                    </span>
                  )}
                </div>

                {r.total > 0 ? (
                  <>
                    <div
                      className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={r.votes
                        .map((n, i) => `${TIER_LEVEL_LABELS[i]} ${n}`)
                        .join(" · ")}
                    >
                      {r.votes.map((n, i) =>
                        n > 0 ? (
                          <div
                            key={i}
                            style={{
                              width: `${(n / r.total) * 100}%`,
                              background: LEVEL_COLORS[i],
                            }}
                          />
                        ) : null,
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      {r.votes.map((n, i) => (
                        <span key={i}>
                          {TIER_LEVEL_LABELS[i]} {n}
                        </span>
                      ))}
                      <span>· {t("aiTierlist.vote.total", { n: r.total })}</span>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 text-[11px] italic text-muted-foreground/70">
                    {t("aiTierlist.vote.noVotes")}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 sm:mt-0">
                {/* 流行等级 = 加权平均四舍五入；0 票为未评级 */}
                <div className="flex w-[68px] shrink-0 flex-col items-center rounded-lg bg-muted px-1.5 py-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("aiTierlist.vote.rankLabel")}
                  </span>
                  <span
                    className={`text-sm font-black ${r.rank === null ? "text-muted-foreground" : "text-foreground"}`}
                    title={r.avgTier === null ? undefined : r.avgTier.toFixed(2)}
                  >
                    {r.rank === null
                      ? t("aiTierlist.vote.unrated")
                      : TIER_LEVEL_LABELS[r.rank]}
                  </span>
                </div>

                <div className="flex gap-1.5" role="group" aria-label={r.tool}>
                  {TIER_LEVEL_LABELS.map((label, i) => {
                    const mine = r.myTier === i;
                    const busy = pending === r.tool;
                    return (
                      <button
                        key={label}
                        data-testid={`vote-${label}`}
                        disabled={busy}
                        onClick={() => void vote(r.tool, i)}
                        aria-label={t("aiTierlist.vote.aria", {
                          tool: r.tool,
                          tier: label,
                        })}
                        aria-pressed={mine}
                        className={`flex size-9 cursor-pointer items-center justify-center rounded-lg border text-[13px] font-bold transition-all disabled:opacity-50 ${
                          mine
                            ? "border-transparent text-white shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                        }`}
                        style={mine ? { background: LEVEL_COLORS[i] } : undefined}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

        {status === "ready" && results.length > 0 && (
          <p className="flex items-center gap-1.5 pt-1 text-[12px] text-muted-foreground/80">
            <BarChart3 className="size-3.5 shrink-0" />
            {t("aiTierlist.vote.method")}
          </p>
        )}

        {!user && status === "ready" && (
          <button
            onClick={() => setAuthOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-[#006c49] hover:underline dark:text-[#4edea3]"
          >
            <LogIn className="size-3.5" />
            {t("aiTierlist.vote.loginCta")}
          </button>
        )}
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />

      <div
        aria-live="polite"
        className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-sm text-background shadow-lg transition-all duration-200 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </section>
  );
}
