import { useState, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

function parseTags(input: string): string[] {
  return input
    .split(/[,，\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function TagInput({
  tags,
  onChange,
  placeholder: placeholderProp,
  maxTags = 10,
}: TagInputProps) {
  const { t } = useTranslation();
  const placeholder = placeholderProp ?? t("components.tagInput.placeholder");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTags = (raw: string) => {
    const newTags = parseTags(raw);
    if (newTags.length === 0) return;
    const existing = new Set(tags);
    const unique = newTags.filter((t) => !existing.has(t));
    if (unique.length > 0) {
      onChange([...tags, ...unique].slice(0, maxTags));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "，") {
      e.preventDefault();
      addTags(input);
      setInput("");
      return;
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (input.trim()) {
      addTags(input);
      setInput("");
    }
  };

  return (
    <div
      className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border-2 border-input bg-transparent px-2 py-1.5 transition-colors focus-within:border-secondary focus-within:ring-3 focus-within:ring-secondary/30 dark:bg-input/20 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary"
        >
          {tag}
          <button
            type="button"
            className="rounded-sm hover:bg-primary/30 transition-colors text-primary/70"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        placeholder={tags.length === 0 ? placeholder : ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
}
