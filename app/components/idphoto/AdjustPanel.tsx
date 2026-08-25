import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";

export interface Adjust {
  zoom: number; // 50..250
  x: number; // -100..100
  y: number;
}

interface AdjustPanelProps {
  adjust: Adjust;
  onChange: (a: Adjust) => void;
  onReset: () => void;
}

function Row({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label className="w-12 shrink-0 text-xs text-muted-foreground">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="h-1.5 flex-1 accent-[#006c49]"
      />
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

export function AdjustPanel({ adjust, onChange, onReset }: AdjustPanelProps) {
  const { t } = useTranslation();
  return (
    <div>
      <Row label={t("idphoto.adj.zoom")} min={50} max={250} value={adjust.zoom} onChange={(v) => onChange({ ...adjust, zoom: v })} />
      <Row label={t("idphoto.adj.x")} min={-100} max={100} value={adjust.x} onChange={(v) => onChange({ ...adjust, x: v })} />
      <Row label={t("idphoto.adj.y")} min={-100} max={100} value={adjust.y} onChange={(v) => onChange({ ...adjust, y: v })} />
      <Button variant="secondary" className="mt-2 w-full" onClick={onReset}>
        {t("idphoto.adj.reset")}
      </Button>
    </div>
  );
}
