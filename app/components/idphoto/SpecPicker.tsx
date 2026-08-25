import { useTranslation } from "react-i18next";
import { REGIONS, SIZE_PRESETS, currentSize } from "~/lib/idphoto/specs";

interface SpecPickerProps {
  presetIdx: number;
  regionFilter: string;
  customW: number;
  customH: number;
  onRegion: (v: string) => void;
  onSelect: (idx: number) => void;
  onCustomSize: (w: number, h: number) => void;
}

export function SpecPicker({ presetIdx, regionFilter, customW, customH, onRegion, onSelect, onCustomSize }: SpecPickerProps) {
  const { t } = useTranslation();
  const visible = SIZE_PRESETS.map((p, i) => ({ p, i })).filter(
    ({ p }) => regionFilter === "all" || p.group === regionFilter,
  );
  const isCustom = SIZE_PRESETS[presetIdx]?.key === "custom";

  return (
    <div>
      <select
        aria-label={t("idphoto.step.spec")}
        value={regionFilter}
        onChange={(e) => onRegion(e.target.value)}
        className="mb-2.5 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {t(`idphoto.region.${r.value}`)}
          </option>
        ))}
      </select>
      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
        {visible.map(({ p, i }) => {
          const active = i === presetIdx;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelect(i)}
              className={
                "rounded-xl border p-2 text-left transition-all " +
                (active
                  ? "border-primary bg-primary/10 shadow-[0_0_0_2px] shadow-primary/15"
                  : "border-border hover:border-primary/40")
              }
            >
              <div className="flex items-center gap-1 text-[13px] font-bold text-foreground">
                <span>{t(`idphoto.spec.${p.key}.name`)}</span>
                <span className="ml-auto text-xs">{p.flag}</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {p.key === "custom" ? t("idphoto.spec.custom.desc") : `${p.w}×${p.h}px`}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground/80">{t(`idphoto.spec.${p.key}.desc`)}</div>
            </button>
          );
        })}
      </div>

      {isCustom && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={1}
            aria-label={t("idphoto.custom.w")}
            value={customW}
            onChange={(e) => onCustomSize(Math.max(1, +e.target.value || 1), customH)}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            aria-label={t("idphoto.custom.h")}
            value={customH}
            onChange={(e) => onCustomSize(customW, Math.max(1, +e.target.value || 1))}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
          />
        </div>
      )}

      <div className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        {t("idphoto.mmInfo", {
          w: isCustom ? customW : SIZE_PRESETS[presetIdx].w,
          h: isCustom ? customH : SIZE_PRESETS[presetIdx].h,
          wmm: currentSize(presetIdx, customW, customH).wmm.toFixed(1),
          hmm: currentSize(presetIdx, customW, customH).hmm.toFixed(1),
        })}
      </div>
    </div>
  );
}
