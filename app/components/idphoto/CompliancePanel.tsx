import { useTranslation } from "react-i18next";

interface CompliancePanelProps {
  ready: boolean;
  /** 头占比百分数；null 表示暂不可测 */
  ratioPct: number | null;
  rangePct: [number, number];
  showRuler: boolean;
  onToggleRuler: (v: boolean) => void;
}

export function CompliancePanel({ ready, ratioPct, rangePct, showRuler, onToggleRuler }: CompliancePanelProps) {
  const { t } = useTranslation();
  const state =
    !ready || ratioPct == null ? "unknown" : ratioPct >= rangePct[0] - 0.5 && ratioPct <= rangePct[1] + 0.5 ? "ok" : "bad";
  const headText =
    state === "unknown"
      ? t("idphoto.compliance.unknown")
      : state === "ok"
        ? t("idphoto.compliance.ok", { pct: ratioPct, lo: rangePct[0], hi: rangePct[1] })
        : t("idphoto.compliance.bad", { pct: ratioPct, lo: rangePct[0], hi: rangePct[1] });

  return (
    <div>
      <div
        className={
          "rounded-lg px-3 py-2 text-[13px] font-bold leading-snug " +
          (state === "ok"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : state === "bad"
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-muted text-muted-foreground")
        }
      >
        {headText}
      </div>
      <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
        <input
          type="checkbox"
          checked={showRuler}
          onChange={(e) => onToggleRuler(e.target.checked)}
          className="accent-[#006c49]"
        />
        {t("idphoto.ruler.show")}
      </label>
      <ul className="mt-2 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <span aria-hidden>•</span>
            <span>{t(`idphoto.tip.${i}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
