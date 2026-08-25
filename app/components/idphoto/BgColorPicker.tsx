import { useTranslation } from "react-i18next";
import { BG_COLORS, type SizePreset } from "~/lib/idphoto/specs";
import { cn } from "~/lib/utils";

interface BgColorPickerProps {
  preset: SizePreset;
  bgColor: string;
  keepBg: boolean;
  onColor: (hex: string) => void;
  onKeepBg: (v: boolean) => void;
}

export function BgColorPicker({ preset, bgColor, keepBg, onColor, onKeepBg }: BgColorPickerProps) {
  const { t } = useTranslation();
  const list = preset.bgOptions ?? BG_COLORS.map((c) => c.value);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2.5">
        {list.map((hex) => {
          const nameKey = BG_COLORS.find((c) => c.value.toUpperCase() === hex.toUpperCase())?.key;
          return (
            <button
              key={hex}
              type="button"
              title={nameKey ? t(`idphoto.bg.${nameKey}`) : hex}
              onClick={() => onColor(hex)}
              className={cn(
                "relative size-9 rounded-lg shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] transition-all",
                bgColor.toUpperCase() === hex.toUpperCase()
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                  : "",
              )}
              style={{ background: hex }}
            >
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground">
                {nameKey ? t(`idphoto.bg.${nameKey}`) : ""}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mb-1 h-4" />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={bgColor}
          onChange={(e) => onColor(e.target.value)}
          aria-label={t("idphoto.step.bg")}
          className="h-8 w-11 cursor-pointer rounded-lg border border-input bg-background p-0.5"
        />
        <input
          type="text"
          value={bgColor.toUpperCase()}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            let v = e.target.value.trim();
            if (!v.startsWith("#")) v = "#" + v;
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onColor(v);
          }}
          className="w-24 rounded-lg border border-input bg-background px-2 py-1.5 font-mono text-xs uppercase"
        />
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-foreground">
          <input
            type="checkbox"
            checked={keepBg}
            onChange={(e) => onKeepBg(e.target.checked)}
            className="accent-[#006c49]"
          />
          {t("idphoto.bg.keep")}
        </label>
      </div>
      {preset.bgNoteKey && (
        <div className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
          {t(`idphoto.bgNote.${preset.bgNoteKey}`)}
        </div>
      )}
    </div>
  );
}
