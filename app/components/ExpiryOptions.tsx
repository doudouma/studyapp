import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Flame, Clock, Eye, Infinity as InfinityIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  EXPIRY_PRESETS,
  MAX_USER_EXPIRY_MS,
  MIN_USER_EXPIRY_MS,
  type ExpiryPreset,
  type UploadExpiryOptions,
} from "@shared/types/pages";

/**
 * 上传选项面板：到期自选 + 最大访问次数 + 一次性开关（= maxViews 1，打开即焚）。
 * 仅登录用户可见/生效；受控组件，值经 UploadExpiryOptions 传给上传接口。
 */

const PRESET_ORDER: ExpiryPreset[] = ["permanent", "1h", "1d", "7d", "30d", "custom"];
const PRESET_LABEL_KEY: Record<string, string> = {
  permanent: "home.expiry.permanent",
  "1h": "home.expiry.h1",
  "1d": "home.expiry.d1",
  "7d": "home.expiry.d7",
  "30d": "home.expiry.d30",
  custom: "home.expiry.custom",
};
const VIEW_OPTIONS: (number | null)[] = [1, 3, 5, 10, null];

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

interface ExpiryOptionsProps {
  value: UploadExpiryOptions;
  onChange: (next: UploadExpiryOptions) => void;
  disabled?: boolean;
}

export function ExpiryOptions({ value, onChange, disabled }: ExpiryOptionsProps) {
  const { t } = useTranslation();
  const oneTime = value.maxViews === 1;

  const [customAmount, setCustomAmount] = useState(1);
  const [customUnit, setCustomUnit] = useState<"h" | "d">("d");

  const customMs = customAmount * (customUnit === "h" ? HOUR_MS : DAY_MS);
  const customValid =
    Number.isFinite(customMs) && customMs >= MIN_USER_EXPIRY_MS && customMs <= MAX_USER_EXPIRY_MS;

  const setPreset = (preset: ExpiryPreset) => {
    if (preset === "custom") {
      onChange({ ...value, expiryPreset: "custom", expiryCustomMs: customValid ? customMs : DAY_MS });
    } else {
      onChange({ ...value, expiryPreset: preset, expiryCustomMs: null });
    }
  };

  const setMaxViews = (maxViews: number | null) => {
    onChange({ ...value, maxViews });
  };

  const toggleOneTime = () => {
    onChange({ ...value, maxViews: oneTime ? null : 1 });
  };

  const pill = (active: boolean) =>
    cn(
      "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-foreground/20 bg-foreground text-background"
        : "border-border bg-background text-foreground/70 hover:bg-muted hover:text-foreground",
      disabled && "pointer-events-none opacity-50",
    );

  return (
    <div className="mb-3 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="size-4 text-[#ff5100]" />
        <span className="text-sm font-semibold text-foreground">{t("home.expiry.title")}</span>
      </div>

      {/* 到期 */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {t("home.expiry.expiryLabel")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ORDER.map((preset) => (
            <button
              key={preset}
              type="button"
              className={pill(value.expiryPreset === preset)}
              onClick={() => setPreset(preset)}
            >
              {t(PRESET_LABEL_KEY[preset])}
            </button>
          ))}
        </div>
        {value.expiryPreset === "custom" && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={customAmount}
              onChange={(e) => {
                const n = Math.max(1, Math.floor(Number(e.target.value) || 1));
                setCustomAmount(n);
                const ms = n * (customUnit === "h" ? HOUR_MS : DAY_MS);
                onChange({ ...value, expiryPreset: "custom", expiryCustomMs: ms });
              }}
              className="h-9 w-20 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring"
            />
            <select
              value={customUnit}
              onChange={(e) => {
                const unit = e.target.value as "h" | "d";
                setCustomUnit(unit);
                const ms = customAmount * (unit === "h" ? HOUR_MS : DAY_MS);
                onChange({ ...value, expiryPreset: "custom", expiryCustomMs: ms });
              }}
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring"
            >
              <option value="h">{t("home.expiry.unitHour")}</option>
              <option value="d">{t("home.expiry.unitDay")}</option>
            </select>
            {!customValid && <span className="text-xs text-destructive">{t("home.expiry.customInvalid")}</span>}
          </div>
        )}
      </div>

      {/* 最大访问次数 */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5" />
          {t("home.expiry.maxViewsLabel")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VIEW_OPTIONS.map((n) => (
            <button
              key={String(n)}
              type="button"
              className={pill(value.maxViews === n)}
              onClick={() => setMaxViews(n)}
            >
              {n === null ? <InfinityIcon className="size-4" /> : n}
            </button>
          ))}
        </div>
      </div>

      {/* 一次性链接 */}
      <button
        type="button"
        onClick={toggleOneTime}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors",
          oneTime
            ? "border-[#ff5100]/40 bg-[#ff5100]/10"
            : "border-border bg-background hover:bg-muted",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="flex items-center gap-2">
          <Flame className={cn("size-4", oneTime ? "text-[#ff5100]" : "text-muted-foreground")} />
          <span className="text-sm font-medium text-foreground">{t("home.expiry.oneTime")}</span>
        </span>
        <span
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            oneTime ? "bg-[#ff5100]" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-4 rounded-full bg-white transition-all",
              oneTime ? "left-[18px]" : "left-0.5",
            )}
          />
        </span>
      </button>
      {oneTime && <p className="mt-1.5 text-xs text-muted-foreground">{t("home.expiry.oneTimeHint")}</p>}
    </div>
  );
}

/** 默认值：永久 + 不限次（与现有登录用户默认行为一致） */
export const DEFAULT_EXPIRY_OPTIONS: UploadExpiryOptions = {
  expiryPreset: "permanent",
  expiryCustomMs: null,
  maxViews: null,
};
