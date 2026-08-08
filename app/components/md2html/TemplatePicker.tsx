import { MD_TEMPLATES, type MdTemplate } from "~/lib/md2html/templates";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

interface TemplatePickerProps {
  value: string;
  variantIndex: number;
  onChange: (id: string, variantIndex: number) => void;
}

export function TemplatePicker({ value, variantIndex, onChange }: TemplatePickerProps) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-9">
      {MD_TEMPLATES.map((tpl: MdTemplate) => {
        const selected = tpl.id === value;
        const swatch = selected
          ? tpl.variants?.[variantIndex - 1]?.swatch ?? tpl.swatch
          : tpl.swatch;
        return (
          <button
            key={tpl.id}
            onClick={() => onChange(tpl.id, variantIndex)}
            className={cn(
              "group flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-all",
              selected
                ? "border-primary ring-2 ring-primary/40"
                : "border-border hover:border-primary/60 hover:bg-muted/50",
            )}
            aria-pressed={selected}
            title={zh ? tpl.descZh : tpl.descEn}
          >
            <span className="flex h-5 w-full min-w-0 flex-1 items-stretch overflow-hidden rounded">
              {swatch.map((color) => (
                <span
                  key={color}
                  className="h-full min-w-2 flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
            <span className="truncate text-xs font-medium text-foreground">
              {zh ? tpl.nameZh : tpl.nameEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
