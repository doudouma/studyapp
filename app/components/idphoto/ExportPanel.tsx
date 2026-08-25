import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DIGITAL, type DigitalKey } from "~/lib/idphoto/specs";

interface ExportPanelProps {
  digitalKey: string;
  sizeLimitKB: number;
  format: "jpeg" | "png";
  note: string;
  disabled: boolean;
  onDigital: (v: string) => void;
  onSizeLimit: (v: number) => void;
  onFormat: (v: "jpeg" | "png") => void;
  onExport: () => void;
}

const DIGITAL_KEYS = Object.keys(DIGITAL) as DigitalKey[];

export function ExportPanel({ digitalKey, sizeLimitKB, format, note, disabled, onDigital, onSizeLimit, onFormat, onExport }: ExportPanelProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="w-16 shrink-0 text-xs text-muted-foreground">{t("idphoto.digital.label")}</label>
        <select
          value={digitalKey}
          onChange={(e) => onDigital(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
        >
          <option value="">{t("idphoto.digital.none")}</option>
          {DIGITAL_KEYS.map((k) => (
            <option key={k} value={k}>
              {t(`idphoto.digital.${k}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <select
          value={format}
          onChange={(e) => onFormat(e.target.value as "jpeg" | "png")}
          aria-label={t("idphoto.export.format")}
          className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
        >
          <option value="jpeg">{t("idphoto.export.jpg")}</option>
          <option value="png">{t("idphoto.export.png")}</option>
        </select>
        <label className="shrink-0 text-xs text-muted-foreground">{t("idphoto.export.sizeLimit")}</label>
        <input
          type="number"
          min={0}
          value={sizeLimitKB}
          onChange={(e) => onSizeLimit(Math.max(0, +e.target.value || 0))}
          className="w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
        />
        <span className="text-[11px] text-muted-foreground">{t("idphoto.export.kbUnit")}</span>
      </div>
      {digitalKey && (
        <div className="mb-3 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {t(`idphoto.digital.note.${digitalKey}`)}
        </div>
      )}
      <Button className="w-full" disabled={disabled} onClick={onExport}>
        <Download className="size-4" />
        {t("idphoto.export.btn")}
      </Button>
      {note && <div className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{note}</div>}
    </div>
  );
}
