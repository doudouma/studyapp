import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth-context";
import { Check, Plus, Trash2, X, Upload, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import "./wardrobe.css";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({
    meta: [
      { title: "Wardrobe - 100mini" },
      { name: "description", content: "AI-powered clothing detection and organization" },
    ],
  }),
  component: WardrobePage,
});

interface GarmentItem {
  id: string;
  name: string;
  part: string;
  color: string | null;
  secondaryColor: string | null;
  tags: string[];
  image: string;
  thumbnail?: string;
  palette?: string[];
}

interface AnalysisItem {
  name: string;
  part: string;
  color: string;
  secondaryColor?: string;
  tags: string[];
  boundingBox: { x: number; y: number; width: number; height: number };
}

interface WardrobeJob {
  id: string;
  status: string;
  originalImageUrl?: string;
  analysisResult?: AnalysisItem[];
  error?: string;
}

const TYPES = [
  { id: "all", label: "All" },
  { id: "upperbody", label: "Tops", singular: "Top" },
  { id: "wholebody_up", label: "Jackets", singular: "Jacket" },
  { id: "lowerbody", label: "Bottoms", singular: "Bottom" },
  { id: "accessories_up", label: "Accessories", singular: "Accessory" },
  { id: "shoes", label: "Shoes", singular: "Shoes" },
];

const TYPE_MAP = Object.fromEntries(TYPES.map((type) => [type.id, type]));
const TYPE_ORDER = Object.fromEntries(TYPES.slice(1).map((type, index) => [type.id, index]));

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`;
}

function colorDistance(first: { red: number; green: number; blue: number }, second: { red: number; green: number; blue: number }): number {
  return Math.sqrt(
    ((first.red - second.red) ** 2)
    + ((first.green - second.green) ** 2)
    + ((first.blue - second.blue) ** 2),
  );
}

function extractPalette(image: HTMLImageElement): string[] {
  const canvas = document.createElement("canvas");
  canvas.width = 72;
  canvas.height = 72;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const buckets = new Map<string, { red: number; green: number; blue: number; count: number }>();

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3];
    if (alpha < 72) continue;
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const key = `${Math.round(red / 28)}-${Math.round(green / 28)}-${Math.round(blue / 28)}`;
    const current = buckets.get(key) || { red: 0, green: 0, blue: 0, count: 0 };
    current.red += red;
    current.green += green;
    current.blue += blue;
    current.count += 1;
    buckets.set(key, current);
  }

  const ranked = [...buckets.values()]
    .map((bucket) => ({
      red: Math.round(bucket.red / bucket.count),
      green: Math.round(bucket.green / bucket.count),
      blue: Math.round(bucket.blue / bucket.count),
      count: bucket.count,
    }))
    .sort((a, b) => b.count - a.count);

  const selected: typeof ranked = [];
  for (const color of ranked) {
    if (selected.every((existing) => colorDistance(existing, color) > 38)) selected.push(color);
    if (selected.length === 5) break;
  }
  return selected.map((color) => rgbToHex(color.red, color.green, color.blue));
}

function buildSamplingCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext("2d", { willReadFrequently: true })!.drawImage(image, 0, 0);
  return canvas;
}

function sampleImageColor(image: HTMLImageElement, canvas: HTMLCanvasElement, event: React.MouseEvent): string | null {
  const bounds = image.getBoundingClientRect();
  const scale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  const offsetX = (bounds.width - renderedWidth) / 2;
  const offsetY = (bounds.height - renderedHeight) / 2;
  const imageX = Math.floor((event.clientX - bounds.left - offsetX) / scale);
  const imageY = Math.floor((event.clientY - bounds.top - offsetY) / scale);
  if (imageX < 0 || imageY < 0 || imageX >= canvas.width || imageY >= canvas.height) return null;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  for (let radius = 0; radius <= 18; radius += 2) {
    const startX = Math.max(0, imageX - radius);
    const startY = Math.max(0, imageY - radius);
    const width = Math.min(canvas.width - startX, (radius * 2) + 1);
    const height = Math.min(canvas.height - startY, (radius * 2) + 1);
    const data = context.getImageData(startX, startY, width, height).data;
    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] > 96) return rgbToHex(data[index], data[index + 1], data[index + 2]);
    }
  }
  return null;
}

function GalleryItem({ item, selected, onOpen }: { item: GarmentItem; selected: boolean; onOpen: (id: string) => void }) {
  const type = TYPE_MAP[item.part]?.singular || "wardrobe item";
  return (
    <button
      className={`gallery-item${selected ? " selected" : ""}`}
      type="button"
      onClick={() => onOpen(item.id)}
      aria-label={`View ${item.name || type}`}
      aria-pressed={selected}
    >
      <img src={item.thumbnail || item.image} alt="" loading="lazy" draggable={false} />
    </button>
  );
}

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const nextTag = input.trim().replace(/^#/, "");
    if (!nextTag || tags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) return;
    onChange([...tags, nextTag]);
    setInput("");
  };
  return (
    <div className="tag-editor">
      <div className="editable-tags">
        {tags.map((tag) => (
          <span className="editable-tag" key={tag}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((existing) => existing !== tag))} aria-label={`Remove ${tag}`}>
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <div className="tag-input-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }}
          placeholder="Add a detail"
          aria-label="Add detail tag"
        />
        <button type="button" onClick={addTag} disabled={!input.trim()} aria-label="Add detail">
          <Plus size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ColorControl({
  label, field, value, palette, onChange, sampling, setSampling, optional = false, onClear, onAdd,
}: {
  label: string; field: string; value: string | null; palette: string[];
  onChange: (color: string) => void; sampling: string | null;
  setSampling: (fn: (prev: string | null) => string | null) => void;
  optional?: boolean; onClear?: () => void; onAdd?: () => void;
}) {
  if (optional && !value) {
    return (
      <div className="color-slot empty-color-slot">
        <div className="color-slot-heading">
          <span>{label}</span>
          <small>Optional</small>
        </div>
        <p>No distinct secondary color detected.</p>
        <button className="add-secondary-button" type="button" onClick={onAdd}>Add secondary color</button>
      </div>
    );
  }
  return (
    <div className="color-slot">
      <div className="color-slot-heading">
        <span>{label}</span>
        {optional && <button type="button" onClick={onClear}>Remove</button>}
      </div>
      <label className="selected-color-control">
        <input type="color" value={value || "#9a9286"} onChange={(event) => onChange(event.target.value)} aria-label={`Choose ${label.toLowerCase()}`} />
        <span className="selected-color-copy">
          <small>Selected</small>
          <strong>{value || "Custom"}</strong>
        </span>
      </label>
      <div className="suggestion-heading">
        <span>Image suggestions</span>
        <small>Click to apply</small>
      </div>
      <div className="palette" aria-label={`${label} suggestions from image`}>
        {palette.map((color) => (
          <button type="button" key={color} className={value?.toLowerCase() === color.toLowerCase() ? "active" : ""}
            style={{ backgroundColor: color }} onClick={() => onChange(color)}
            aria-label={`Use ${color} as ${label.toLowerCase()}`} title={color} />
        ))}
      </div>
      <button className={`sample-button${sampling === field ? " active" : ""}`} type="button"
        onClick={() => setSampling((current) => current === field ? null : field)}>
        {sampling === field ? "Cancel picking" : `Pick ${label.toLowerCase()} from image`}
      </button>
    </div>
  );
}

function ItemEditor({
  draft, setDraft, palette, sampling, setSampling, sampleStatus,
}: {
  draft: { name: string; part: string; color: string; secondaryColor: string | null; tags: string[] };
  setDraft: (fn: (prev: typeof draft) => typeof draft) => void;
  palette: string[]; sampling: string | null;
  setSampling: (fn: (prev: string | null) => string | null) => void; sampleStatus: string;
}) {
  const suggestedSecondary = palette.find((color) => color.toLowerCase() !== draft.color?.toLowerCase()) || "#9a9286";
  return (
    <div className="item-editor">
      <label className="field">
        <span>Name</span>
        <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          placeholder={TYPE_MAP[draft.part]?.singular || "Wardrobe item"} />
      </label>
      <label className="field">
        <span>Category</span>
        <select value={draft.part} onChange={(event) => setDraft((current) => ({ ...current, part: event.target.value }))}>
          {TYPES.slice(1).map((type) => <option value={type.id} key={type.id}>{type.label}</option>)}
        </select>
      </label>
      <fieldset className="color-field">
        <legend>Colors</legend>
        <div className="colors-editor">
          <ColorControl label="Primary color" field="primary" value={draft.color} palette={palette}
            onChange={(color) => setDraft((current) => ({ ...current, color }))} sampling={sampling} setSampling={setSampling} />
          <ColorControl label="Secondary color" field="secondary" value={draft.secondaryColor} palette={palette}
            onChange={(secondaryColor) => setDraft((current) => ({ ...current, secondaryColor }))}
            sampling={sampling} setSampling={setSampling} optional
            onClear={() => setDraft((current) => ({ ...current, secondaryColor: null }))}
            onAdd={() => setDraft((current) => ({ ...current, secondaryColor: suggestedSecondary }))} />
        </div>
        <p className="color-help" aria-live="polite">
          {sampling ? `Click anywhere on the garment to sample the ${sampling} color.` : sampleStatus || "Primary colors come from the image. A secondary is suggested only when a distinct color has meaningful coverage."}
        </p>
      </fieldset>
      <div className="field details-field">
        <span>Details</span>
        <TagEditor tags={draft.tags} onChange={(tags) => setDraft((current) => ({ ...current, tags }))} />
      </div>
    </div>
  );
}

function ItemViewer({ item, onClose, onSave, onDelete }: {
  item: GarmentItem; onClose: () => void; onSave: (item: GarmentItem) => void; onDelete: (id: string) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const samplingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sampling, setSampling] = useState<string | null>(null);
  const [sampleStatus, setSampleStatus] = useState("");
  const [palette, setPalette] = useState<string[]>(item.palette || []);
  const [draft, setDraft] = useState({
    name: item.name || "", part: item.part, color: item.color || "#9a9286",
    secondaryColor: item.secondaryColor || null as string | null, tags: [...(item.tags || [])],
  });
  const [shaking, setShaking] = useState(false);
  const [closeBlocked, setCloseBlocked] = useState(false);
  const type = TYPE_MAP[item.part]?.singular || "Wardrobe item";

  const isDirty = useMemo(() => {
    const normalizedTags = (tags: string[]) => tags.map((tag) => tag.trim()).filter(Boolean);
    return JSON.stringify({
      name: draft.name.trim(), part: draft.part,
      color: draft.color?.toLowerCase() || null, secondaryColor: draft.secondaryColor?.toLowerCase() || null,
      tags: normalizedTags(draft.tags),
    }) !== JSON.stringify({
      name: (item.name || "").trim(), part: item.part,
      color: item.color?.toLowerCase() || null, secondaryColor: item.secondaryColor?.toLowerCase() || null,
      tags: normalizedTags(item.tags || []),
    });
  }, [draft, item]);

  const nudgeUnsaved = useCallback(() => {
    setCloseBlocked(true);
    setShaking(false);
    requestAnimationFrame(() => { requestAnimationFrame(() => setShaking(true)); });
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => setShaking(false), 420);
  }, []);

  const requestClose = useCallback(() => {
    if (isDirty) nudgeUnsaved();
    else onClose();
  }, [isDirty, nudgeUnsaved, onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (sampling) setSampling(null);
        else requestClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("viewer-open");
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("viewer-open");
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, [requestClose, sampling]);

  useEffect(() => { if (!isDirty) setCloseBlocked(false); }, [isDirty]);

  useEffect(() => {
    setSampling(null);
    setSampleStatus("");
    setPalette(item.palette || []);
    setDraft({ name: item.name || "", part: item.part, color: item.color || "#9a9286",
      secondaryColor: item.secondaryColor || null, tags: [...(item.tags || [])] });
  }, [item]);

  const cancelEditing = () => {
    setDraft({ name: item.name || "", part: item.part, color: item.color || "#9a9286",
      secondaryColor: item.secondaryColor || null, tags: [...(item.tags || [])] });
    setSampling(null);
    setSampleStatus("");
    onClose();
  };

  const saveEditing = () => {
    onSave({ ...item, ...draft, name: draft.name.trim(), tags: draft.tags.map((tag) => tag.trim()).filter(Boolean) });
    setSampling(null);
    setSampleStatus("Changes saved.");
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    samplingCanvasRef.current = buildSamplingCanvas(event.currentTarget);
    const extracted = extractPalette(event.currentTarget);
    setPalette([...new Set([...(item.palette || []), ...extracted])].slice(0, 5));
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!sampling || !samplingCanvasRef.current) return;
    const color = sampleImageColor(event.currentTarget, samplingCanvasRef.current, event);
    if (!color) {
      setSampleStatus("That spot is transparent\u2014try directly on the garment.");
      return;
    }
    const targetField = sampling === "secondary" ? "secondaryColor" : "color";
    setDraft((current) => ({ ...current, [targetField]: color }));
    setPalette((current) => [color, ...current.filter((existing) => existing.toLowerCase() !== color.toLowerCase())].slice(0, 5));
    setSampleStatus(`Sampled ${color} as the ${sampling} color.`);
    setSampling(null);
  };

  return (
    <div className="viewer-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && requestClose()}>
      <div className="viewer-entry">
        <aside className={`viewer editing${shaking ? " shake" : ""}`} role="dialog" aria-modal="true" aria-label="Selected wardrobe item">
          <button className="viewer-icon-close" type="button" onClick={requestClose} aria-label="Close viewer" ref={closeButtonRef}>
            <X size={24} aria-hidden="true" />
          </button>
          <div className="viewer-heading">
            <div><h2>{draft.name || TYPE_MAP[draft.part]?.singular}</h2></div>
          </div>
          <div className={`viewer-art${sampling ? " sampling" : ""}`}>
            <img ref={imageRef} src={item.image} alt={`Selected ${type.toLowerCase()}`} onLoad={handleImageLoad} onClick={handleImageClick} />
            {sampling && <span className="sample-hint">Click garment to sample</span>}
          </div>
          <div className="viewer-details editing">
            <ItemEditor draft={draft} setDraft={setDraft} palette={palette} sampling={sampling} setSampling={setSampling} sampleStatus={sampleStatus} />
            {closeBlocked && <p className="unsaved-notice" role="status">Save or cancel changes before closing.</p>}
            <div className="viewer-actions">
              <button className="delete-button" type="button" onClick={() => onDelete(item.id)}>
                <Trash2 size={15} aria-hidden="true" /> Delete
              </button>
              <span className="action-spacer" />
              <button className="secondary-button" type="button" onClick={cancelEditing}>Cancel</button>
              <button className="primary-button" type="button" onClick={saveEditing}>
                <Check size={15} aria-hidden="true" /> Save
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WardrobeImportFlow({ onGarmentApproved }: { onGarmentApproved: (item: GarmentItem) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<WardrobeJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const submitFiles = useCallback(async (files: FileList | File[]) => {
    const images = [...files].filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;
    setDragging(false);
    setError("");
    for (const file of images) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch("/api/wardrobe/upload", { method: "POST", body: formData });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(errData.error || "Upload failed");
        }
        const data = await response.json() as { jobId: string; imageUrl: string };
        const newJob: WardrobeJob = { id: data.jobId, status: "pending", originalImageUrl: data.imageUrl };
        setJobs((current) => [...current, newJob]);
        setOpen(true);
        analyzeJob(data.jobId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }
  }, []);

  const analyzeJob = async (jobId: string) => {
    setJobs((current) => current.map((job) => job.id === jobId ? { ...job, status: "analyzing" } : job));
    try {
      const response = await fetch(`/api/wardrobe/jobs/${jobId}/analyze`, { method: "POST" });
      if (response.ok) {
        const data = await response.json() as { items: AnalysisItem[] };
        setJobs((current) => current.map((job) => job.id === jobId ? { ...job, status: "completed", analysisResult: data.items } : job));
      } else {
        const errData = await response.json().catch(() => ({})) as { error?: string };
        setJobs((current) => current.map((job) => job.id === jobId ? { ...job, status: "failed", error: errData.error } : job));
      }
    } catch (err: unknown) {
      setJobs((current) => current.map((job) => job.id === jobId ? { ...job, status: "failed", error: err instanceof Error ? err.message : "Analysis failed" } : job));
    }
  };

  const handleExtract = async (jobId: string, itemIndex: number) => {
    setBusyId(jobId);
    try {
      const response = await fetch(`/api/wardrobe/jobs/${jobId}/extract/${itemIndex}`, { method: "POST" });
      if (response.ok) {
        const data = await response.json() as { item: GarmentItem };
        onGarmentApproved(data.item);
        setJobs((current) => current.filter((job) => job.id !== jobId));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setBusyId(null);
    }
  };

  const deleteJob = async (jobId: string) => {
    setBusyId(jobId);
    try {
      await fetch(`/api/wardrobe/jobs/${jobId}`, { method: "DELETE" });
      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch { /* ignore */ }
    finally { setBusyId(null); }
  };

  useEffect(() => {
    let depth = 0;
    const onDragEnter = (event: DragEvent) => {
      if (![...event.dataTransfer?.types || []].includes("Files")) return;
      event.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const onDragOver = (event: DragEvent) => {
      if ([...event.dataTransfer?.types || []].includes("Files")) event.preventDefault();
    };
    const onDragLeave = (event: DragEvent) => {
      event.preventDefault();
      depth = Math.max(0, depth - 1);
      if (!depth) setDragging(false);
    };
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      depth = 0;
      setDragging(false);
      if (event.dataTransfer?.files) submitFiles(event.dataTransfer.files);
    };
    const onPaste = (event: ClipboardEvent) => {
      const files = [...(event.clipboardData?.files || [])];
      if (files.some((file) => file.type.startsWith("image/"))) {
        event.preventDefault();
        submitFiles(files);
      }
    };
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("paste", onPaste);
    };
  }, [submitFiles]);

  const active = jobs[jobs.length - 1];
  const readyCount = jobs.filter((job) => job.status === "completed").length;
  const hasImportActivity = jobs.length > 0;

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(event) => { if (event.target.files) submitFiles(event.target.files); event.target.value = ""; }} />
      <div className="import-drop-overlay" data-active={dragging} aria-hidden={!dragging}>
        <div className="import-drop-target">
          <Upload size={34} />
          <h2>Drop clothing images</h2>
          <p>A single garment or a photo of a full outfit works. Your wardrobe stays exactly where you left it.</p>
        </div>
      </div>
      <aside className={`import-tray${hasImportActivity ? " is-expanded" : ""}`} aria-label="Wardrobe imports">
        <button className="import-tray__button" type="button" onClick={() => hasImportActivity ? setOpen(true) : inputRef.current?.click()}
          aria-label={hasImportActivity ? "Open import progress" : "Add clothes"}>
          {active?.status === "analyzing" ? <Loader2 size={19} className="import-spinner" /> :
           active?.status === "failed" ? <AlertCircle size={19} /> :
           readyCount ? <span>{readyCount}</span> : <Plus size={19} />}
        </button>
        <div className="import-tray__actions">
          {active && <img className="import-tray__preview" src={active.originalImageUrl || ""} alt="" />}
          <span className="import-tray__label">
            {active?.status === "analyzing" ? "Analyzing..." :
             active?.status === "completed" ? `${readyCount} ready` :
             active?.status === "failed" ? "Needs attention" : "Add clothes"}
          </span>
          <button className="import-icon-button" type="button" onClick={() => inputRef.current?.click()} aria-label="Choose images">
            <Upload size={17} />
          </button>
        </div>
      </aside>
      <div className="import-popover-backdrop" data-open={open} onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
        <section className="import-popover" role="dialog" aria-modal="true" aria-labelledby="import-title">
          <header className="import-popover__header">
            <div>
              <p className="import-popover__eyebrow">Wardrobe import</p>
              <h2 className="import-popover__title" id="import-title">
                {readyCount ? `${readyCount} ready for review` : jobs.length ? "Processing" : "Add to your wardrobe"}
              </h2>
            </div>
            <button className="import-icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close import progress">
              <X size={20} />
            </button>
          </header>
          {!jobs.length ? (
            <div className="import-drop-target">
              <Upload size={28} />
              <h2>Choose or paste an image</h2>
              <p>We will detect each clothing item and hold everything for your approval.</p>
              <button className="import-button import-button--primary" onClick={() => inputRef.current?.click()}>Choose images</button>
            </div>
          ) : (
            <>
              <div className={`import-progress${readyCount > 0 ? " is-reviewing" : ""}`}>
                <div className="import-progress__meta">
                  <span>{active?.status === "analyzing" ? "Analyzing" : readyCount ? `${readyCount} ready` : "Processing"}</span>
                  <span>{jobs.length} {jobs.length === 1 ? "item" : "items"}</span>
                </div>
                {active?.status === "analyzing" && <div className="import-progress__track"><div className="import-progress__bar" /></div>}
              </div>
              <div className="import-card-list">
                {jobs.map((job) => (
                  <article className={`import-card${job.status === "completed" ? " is-selected" : ""}`} key={job.id}>
                    <img className="import-card__image" src={job.originalImageUrl || ""} alt="" />
                    <div className="import-card__body">
                      <h3 className="import-card__title">Import {job.id.slice(0, 8)}</h3>
                      <p className="import-card__detail import-card__detail--status" data-tone={job.status === "failed" ? "error" : job.status === "completed" ? "complete" : "processing"}>
                        {job.status === "failed" ? job.error : job.status === "completed" ? `${job.analysisResult?.length || 0} items detected` : "Processing"}
                      </p>
                    </div>
                    <div className="import-card__actions">
                      <button className="import-icon-button import-card__delete" disabled={busyId === job.id} onClick={() => deleteJob(job.id)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {jobs.some((job) => job.status === "completed" && job.analysisResult) && (
                <div style={{ marginTop: 16 }}>
                  {jobs.filter((job) => job.status === "completed" && job.analysisResult).map((job) => (
                    <div key={job.id}>
                      <p className="import-editor__stage">Detected items from upload</p>
                      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                        {job.analysisResult!.map((item, index) => (
                          <div className="import-card" key={index}>
                            <div className="import-card__body">
                              <h3 className="import-card__title">{item.name}</h3>
                              <p className="import-card__detail">{TYPE_MAP[item.part]?.label || item.part} &middot; {item.color}</p>
                            </div>
                            <div className="import-card__actions">
                              <button className="import-button import-button--primary" disabled={busyId === job.id}
                                onClick={() => handleExtract(job.id, index)}>
                                <Check size={14} /> Extract
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="import-actions">
                <button className="import-button" onClick={() => inputRef.current?.click()}><Plus size={14} /> Add another</button>
              </div>
            </>
          )}
          {error && <p className="import-status is-error" role="alert">{error}</p>}
        </section>
      </div>
    </>
  );
}

function WardrobePage() {
  const { user, authLoading } = useAuth();
  const [items, setItems] = useState<GarmentItem[]>([]);
  const [activeType, setActiveType] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"wardrobe" | "outfits">("wardrobe");
  const [outfits, setOutfits] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [autoCount, setAutoCount] = useState(3);
  const [autoGenerating, setAutoGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/wardrobe/items", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the wardrobe.");
        return response.json();
      })
      .then((data) => { setItems((data as { items: GarmentItem[] }).items || []); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
    
    // 加载 outfits
    fetch("/api/wardrobe/outfits", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setOutfits((data as { outfits: any[] }).outfits || []); })
      .catch(() => {});
  }, [user]);

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  const visibleItems = useMemo(() => {
    const filtered = activeType === "all" ? items : items.filter((item) => item.part === activeType);
    return [...filtered].sort((a, b) => {
      if (activeType === "all") {
        const typeDifference = (TYPE_ORDER[a.part] ?? 99) - (TYPE_ORDER[b.part] ?? 99);
        if (typeDifference) return typeDifference;
      }
      return a.id.localeCompare(b.id);
    });
  }, [activeType, items]);

  const chooseType = (typeId: string) => {
    setActiveType(typeId);
    setSelectedId(null);
  };

  const saveItem = async (updatedItem: GarmentItem) => {
    try {
      const response = await fetch(`/api/wardrobe/items/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedItem.name,
          part: updatedItem.part,
          color: updatedItem.color,
          secondaryColor: updatedItem.secondaryColor,
          tags: updatedItem.tags,
        }),
      });
      if (response.ok) {
        setItems((current) => current.map((item) => item.id === updatedItem.id ? updatedItem : item));
      }
    } catch { /* ignore */ }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/wardrobe/items/${id}`, { method: "DELETE" });
      if (response.ok || response.status === 404) {
        setItems((current) => current.filter((item) => item.id !== id));
        setSelectedId(null);
      }
    } catch { /* ignore */ }
  };

  const addImportedItem = useCallback((newItem: GarmentItem) => {
    setItems((current) => current.some((item) => item.id === newItem.id) ? current : [...current, newItem]);
  }, []);

  // Outfit 相关函数
  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateOutfit = async () => {
    if (!outfitName.trim() || selectedItems.length < 2) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/wardrobe/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: outfitName.trim(),
          occasion: occasion.trim() || null,
          itemIds: selectedItems,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as { outfit: any };
        setOutfits((prev) => [data.outfit, ...prev]);
        setSelectedItems([]);
        setOutfitName("");
        setOccasion("");
      }
    } catch { /* ignore */ }
    finally { setGenerating(false); }
  };

  const handleAutoGenerate = async () => {
    if (autoGenerating) return;
    setAutoGenerating(true);
    try {
      const response = await fetch("/api/wardrobe/outfits/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: autoCount }),
      });
      const data = (await response.json()) as { outfits?: any[]; error?: string };
      if (response.ok && data.outfits) {
        setOutfits((prev) => [...data.outfits!, ...prev]);
      } else {
        alert(data.error || "Failed to generate outfits");
      }
    } catch { /* ignore */ }
    finally { setAutoGenerating(false); }
  };

  const handleDeleteOutfit = async (id: string) => {
    try {
      const response = await fetch(`/api/wardrobe/outfits/${id}`, { method: "DELETE" });
      if (response.ok) {
        setOutfits((prev) => prev.filter((o) => o.id !== id));
      }
    } catch { /* ignore */ }
  };

  if (authLoading) {
    return (
      <div className="wardrobe-page min-h-screen flex items-center justify-center" style={{ background: "#f4f0e8" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#66625d" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wardrobe-page min-h-screen flex flex-col" style={{ background: "#f4f0e8" }}>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: "#66625d" }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: "#191919" }}>Login Required</h2>
            <p className="mb-4" style={{ color: "#66625d" }}>Please login to use the Wardrobe feature.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="wardrobe-page min-h-screen flex flex-col">
      <main className="flex-1 gallery-pane">
        <header className="gallery-header">
          <div className="gallery-meta-row">
            <p className="piece-count">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>
          </div>
          
          {/* Tab 切换 */}
          <nav className="category-nav" aria-label="Switch view" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={activeTab === "wardrobe" ? "active" : ""}
              onClick={() => setActiveTab("wardrobe")}
            >
              My Wardrobe
            </button>
            <button
              type="button"
              className={activeTab === "outfits" ? "active" : ""}
              onClick={() => setActiveTab("outfits")}
            >
              Outfits
            </button>
          </nav>

          {/* 分类筛选 (只在 wardrobe tab 显示) */}
          {activeTab === "wardrobe" && (
            <nav className="category-nav" aria-label="Filter wardrobe by item type">
              {TYPES.map((type) => (
                <button key={type.id} type="button" className={activeType === type.id ? "active" : ""}
                  onClick={() => chooseType(type.id)} aria-pressed={activeType === type.id}>
                  {type.label}
                </button>
              ))}
            </nav>
          )}
        </header>

        {error && <p className="status error">{error}</p>}
        {!error && loading && <p className="status">Loading wardrobe</p>}

        {/* Wardrobe Tab */}
        {activeTab === "wardrobe" && (
          <>
            {!error && !loading && !items.length && <p className="status">Drop, paste, or add a photo to import your first piece.</p>}
            {!!items.length && (
              <section className="gallery-grid" aria-label={`${TYPE_MAP[activeType]?.label || "All"} wardrobe items`}>
                {visibleItems.map((item) => (
                  <GalleryItem key={item.id} item={item} selected={selectedId === item.id} onOpen={setSelectedId} />
                ))}
              </section>
            )}
          </>
        )}

        {/* Outfits Tab */}
        {activeTab === "outfits" && (
          <div style={{ padding: "0 52px 70px" }}>
            {/* 创建 Outfit 表单 */}
            <div style={{ 
              border: "1px solid var(--line)", 
              padding: "24px", 
              marginBottom: "32px",
              background: "rgba(255,255,255,0.5)"
            }}>
              <h3 style={{ 
                margin: "0 0 16px", 
                fontSize: "14px", 
                fontWeight: 500, 
                letterSpacing: "0.05em", 
                textTransform: "uppercase" 
              }}>
                New Outfit
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                    Outfit Name
                  </label>
                  <input
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    placeholder="e.g., Casual Friday"
                    style={{ width: "100%", minHeight: "40px", border: "1px solid var(--line)", padding: "9px 10px", background: "transparent", color: "var(--ink)", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                    Occasion (optional)
                  </label>
                  <input
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g., Office, Party"
                    style={{ width: "100%", minHeight: "40px", border: "1px solid var(--line)", padding: "9px 10px", background: "transparent", color: "var(--ink)", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                  Selected Items ({selectedItems.length})
                </label>
                <div style={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "8px", 
                  minHeight: "40px", 
                  padding: "8px", 
                  border: "1px solid var(--line)",
                  background: "transparent"
                }}>
                  {selectedItems.length === 0 ? (
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>Select items from below</span>
                  ) : (
                    selectedItems.map((id) => {
                      const item = items.find((i) => i.id === id);
                      return item ? (
                        <span key={id} style={{ 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: "4px", 
                          border: "1px solid var(--line)", 
                          padding: "4px 8px", 
                          fontSize: "11px" 
                        }}>
                          <div style={{ width: "12px", height: "12px", border: "1px solid rgba(25,25,25,0.12)", backgroundColor: item.color || "#808080" }} />
                          {item.name}
                          <button onClick={() => toggleItem(id)} style={{ border: 0, padding: 0, background: "transparent", color: "var(--muted)", cursor: "pointer" }}>
                            <X size={12} />
                          </button>
                        </span>
                      ) : null;
                    })
                  )}
                </div>
              </div>

              <button
                onClick={handleCreateOutfit}
                disabled={generating || selectedItems.length < 2 || !outfitName.trim()}
                style={{
                  minHeight: "36px",
                  border: "1px solid var(--ink)",
                  padding: "8px 16px",
                  background: generating || selectedItems.length < 2 || !outfitName.trim() ? "var(--line)" : "var(--ink)",
                  color: "var(--paper)",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: generating || selectedItems.length < 2 || !outfitName.trim() ? "not-allowed" : "pointer",
                  opacity: generating || selectedItems.length < 2 || !outfitName.trim() ? 0.5 : 1,
                }}
              >
                {generating ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Loader2 size={14} className="animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={14} />
                    Create Outfit
                  </span>
                )}
              </button>
            </div>

            {/* 自动策划 Outfit */}
            <div style={{
              border: "1px solid var(--line)",
              padding: "24px",
              marginBottom: "32px",
              background: "rgba(255,255,255,0.5)"
            }}>
              <h3 style={{
                margin: "0 0 8px",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                Auto Generate Outfits
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "var(--muted)" }}>
                We curate color-harmonious combinations from your wardrobe and generate them automatically.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
                    Number of outfits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={autoCount}
                    onChange={(e) => setAutoCount(Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
                    style={{ width: "56px", minHeight: "36px", border: "1px solid var(--line)", padding: "6px 8px", background: "transparent", color: "var(--ink)", fontSize: "13px" }}
                  />
                </div>
                <button
                  onClick={handleAutoGenerate}
                  disabled={autoGenerating || items.length < 2}
                  style={{
                    minHeight: "36px",
                    border: "1px solid var(--ink)",
                    padding: "8px 16px",
                    background: autoGenerating || items.length < 2 ? "var(--line)" : "var(--ink)",
                    color: "var(--paper)",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: autoGenerating || items.length < 2 ? "not-allowed" : "pointer",
                    opacity: autoGenerating || items.length < 2 ? 0.5 : 1,
                  }}
                >
                  {autoGenerating ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Loader2 size={14} className="animate-spin" />
                      Generating {autoCount} outfits...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={14} />
                      Generate {autoCount} Outfits
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 服装选择网格 */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", 
              gap: "12px", 
              marginBottom: "32px" 
            }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    appearance: "none",
                    aspectRatio: "1",
                    display: "grid",
                    placeItems: "center",
                    border: selectedItems.includes(item.id) ? "2px solid var(--accent)" : "2px solid transparent",
                    padding: "8px",
                    background: "transparent",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    loading="lazy"
                  />
                  {selectedItems.includes(item.id) && (
                    <div style={{ 
                      position: "absolute", 
                      top: "4px", 
                      right: "4px", 
                      width: "20px", 
                      height: "20px", 
                      background: "var(--accent)", 
                      borderRadius: "50%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center" 
                    }}>
                      <Check size={12} style={{ color: "white" }} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Outfit 列表 */}
            {outfits.length > 0 && (
              <>
                <h3 style={{ 
                  margin: "0 0 24px", 
                  fontSize: "14px", 
                  fontWeight: 500, 
                  letterSpacing: "0.05em", 
                  textTransform: "uppercase" 
                }}>
                  Your Outfits ({outfits.length})
                </h3>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
                  gap: "24px" 
                }}>
                  {outfits.map((outfit) => (
                    <div key={outfit.id} style={{ border: "1px solid var(--line)", background: "rgba(255,255,255,0.5)", overflow: "hidden" }}>
                      {outfit.imageUrl ? (
                        <img src={outfit.imageUrl} alt={outfit.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                      ) : outfit.status === "generating" || outfit.status === "planned" ? (
                        <div style={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(25,25,25,0.03)" }}>
                          <Loader2 size={32} className="animate-spin" style={{ color: "var(--muted)" }} />
                        </div>
                      ) : outfit.status === "failed" ? (
                        <div style={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(110,48,46,0.05)" }}>
                          <p style={{ fontSize: "12px", color: "var(--accent)" }}>Generation failed</p>
                        </div>
                      ) : null}
                      
                      <div style={{ padding: "16px" }}>
                        <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 500 }}>{outfit.name}</h4>
                        {outfit.occasion && (
                          <p style={{ margin: "0 0 8px", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.055em" }}>
                            {outfit.occasion}
                          </p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          {outfit.itemIds?.map((id: string) => {
                            const item = items.find((i) => i.id === id);
                            return item ? (
                              <div key={id} style={{ width: "24px", height: "24px", border: "1px solid rgba(25,25,25,0.12)", backgroundColor: item.color || "#808080" }} title={item.name} />
                            ) : null;
                          })}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}>{outfit.itemIds?.length || 0} items</span>
                          <button onClick={() => handleDeleteOutfit(outfit.id)} style={{ border: 0, padding: 0, background: "transparent", color: "var(--muted)", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!outfits.length && (
              <p style={{ color: "var(--muted)", fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                No outfits yet. Select items above to create your first outfit.
              </p>
            )}
          </div>
        )}
      </main>

      {selectedItem && (
        <ItemViewer item={selectedItem} onClose={() => setSelectedId(null)} onSave={saveItem} onDelete={deleteItem} />
      )}
      {activeTab === "wardrobe" && <WardrobeImportFlow onGarmentApproved={addImportedItem} />}
    </div>
  );
}
