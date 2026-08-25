import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";

interface GeneratePanelProps {
  disabled: boolean;
  busy: boolean;
  keepBg: boolean;
  onAI: () => void;
  onCropOnly: () => void;
}

export function GeneratePanel({ disabled, busy, keepBg, onAI, onCropOnly }: GeneratePanelProps) {
  const { t } = useTranslation();
  return (
    <div>
      <Button className="w-full" disabled={disabled || busy} onClick={onAI}>
        <Sparkles className="size-4" />
        {busy ? t("idphoto.status.runtimeLoading") : t("idphoto.btn.ai")}
      </Button>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{t("idphoto.ai.hint")}</p>
      {!keepBg && (
        <Button variant="secondary" className="mt-2 w-full" disabled={disabled || busy} onClick={onCropOnly}>
          {t("idphoto.btn.cropOnly")}
        </Button>
      )}
    </div>
  );
}
