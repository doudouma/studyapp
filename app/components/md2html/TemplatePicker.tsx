import { MD_TEMPLATES, type MdTemplate } from "~/lib/md2html/templates";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

interface TemplatePickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8">
      {MD_TEMPLATES.map((tpl: MdTemplate) => {
        const selected = tpl.id === value;
        return (
          <button
            key={tpl.id}
            onClick={() => onChange(tpl.id)}
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
              {tpl.swatch.map((color) => (
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
