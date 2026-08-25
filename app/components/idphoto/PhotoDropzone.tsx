import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { cn } from "~/lib/utils";

interface PhotoDropzoneProps {
  /** 已选文件的描述行；空串则显示默认提示 */
  selectedLabel?: string;
  onFile: (file: File) => void;
}

export function PhotoDropzone({ selectedLabel, onFile }: PhotoDropzoneProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div
        data-testid="idphoto-dropzone"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 bg-muted/30 hover:border-muted-foreground/50",
        )}
      >
        <Upload className="mb-1.5 size-6 text-muted-foreground" />
        <div className="text-sm font-bold text-foreground">{t("idphoto.drop.main")}</div>
        <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {selectedLabel || t("idphoto.drop.sub")}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
