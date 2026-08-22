import { useState, useEffect, useCallback, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth-context";
import { AppNav } from "~/components/HomeHeader";
import { AppFooter } from "~/components/AppFooter";
import {
  Upload,
  Loader2,
  Tag,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Image as ImageIcon,
  Filter,
  Grid,
  List,
  Eye,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({
    meta: [
      { title: "AI Wardrobe - 100mini" },
      { name: "description", content: "AI-powered clothing detection and organization" },
    ],
  }),
  component: WardrobePage,
});

// 类型定义
interface GarmentItem {
  id: string;
  name: string;
  part: string;
  color: string;
  secondaryColor?: string;
  tags: string[];
  imageUrl: string;
  thumbnailUrl?: string;
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

// 常量
const PART_LABELS: Record<string, string> = {
  all: "All",
  upperbody: "Tops",
  wholebody_up: "Jackets",
  lowerbody: "Bottoms",
  accessories_up: "Accessories",
  shoes: "Shoes",
};

const PART_ICONS: Record<string, string> = {
  all: "👕",
  upperbody: "👔",
  wholebody_up: "🧥",
  lowerbody: "👖",
  accessories_up: "👜",
  shoes: "👟",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function WardrobePage() {
  const { user, authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 状态管理
  const [items, setItems] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<WardrobeJob | null>(null);
  const [extracting, setExtracting] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<GarmentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPart, setEditPart] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<GarmentItem | null>(null);
  const [dragDepth, setDragDepth] = useState(0);

  // 加载用户的服装列表
  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  // 全屏拖拽处理
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setDragDepth((prev) => prev + 1);
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragDepth((prev) => {
        if (prev <= 1) {
          setIsDragging(false);
          return 0;
        }
        return prev - 1;
      });
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setDragDepth(0);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleMultipleFiles(Array.from(files));
      }
    };

    document.addEventListener("dragenter", handleGlobalDragEnter);
    document.addEventListener("dragleave", handleGlobalDragLeave);
    document.addEventListener("dragover", handleGlobalDragOver);
    document.addEventListener("drop", handleGlobalDrop);

    return () => {
      document.removeEventListener("dragenter", handleGlobalDragEnter);
      document.removeEventListener("dragleave", handleGlobalDragLeave);
      document.removeEventListener("dragover", handleGlobalDragOver);
      document.removeEventListener("drop", handleGlobalDrop);
    };
  }, []);

  const loadItems = async () => {
    try {
      const response = await fetch("/api/wardrobe/items");
      if (response.ok) {
        const data = (await response.json()) as { items: GarmentItem[] };
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  // 处理多文件上传
  const handleMultipleFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        await handleUpload(file);
      }
    }
  };

  const handleUpload = async (file: File) => {
    setUploadError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      setUploadError(`File too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/wardrobe/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = (await response.json()) as { jobId: string; imageUrl: string };
        setActiveJob({
          id: data.jobId,
          status: "pending",
          originalImageUrl: data.imageUrl,
        });
        await analyzeJob(data.jobId);
      } else {
        const errorData = (await response.json()) as { error: string };
        setUploadError(errorData.error);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeJob = async (jobId: string) => {
    try {
      setActiveJob((prev) => (prev ? { ...prev, status: "analyzing" } : null));

      const response = await fetch(`/api/wardrobe/jobs/${jobId}/analyze`, {
        method: "POST",
      });

      if (response.ok) {
        const data = (await response.json()) as { items: AnalysisItem[] };
        setActiveJob((prev) =>
          prev
            ? {
                ...prev,
                status: "completed",
                analysisResult: data.items,
              }
            : null
        );
      } else {
        const errorData = (await response.json()) as { error: string };
        setActiveJob((prev) =>
          prev
            ? {
                ...prev,
                status: "failed",
                error: errorData.error,
              }
            : null
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      setActiveJob((prev) =>
        prev
          ? {
              ...prev,
              status: "failed",
              error: error.message,
            }
          : null
      );
    }
  };

  const handleExtract = async (itemIndex: number) => {
    if (!activeJob) return;
    setExtracting(itemIndex);
    try {
      const response = await fetch(
        `/api/wardrobe/jobs/${activeJob.id}/extract/${itemIndex}`,
        { method: "POST" }
      );

      if (response.ok) {
        const data = (await response.json()) as { item: GarmentItem };
        setItems((prev) => [data.item, ...prev]);
      }
    } catch (error) {
      console.error("Extraction failed:", error);
    } finally {
      setExtracting(null);
    }
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleMultipleFiles(Array.from(files));
      }
    },
    []
  );

  const handleEdit = (item: GarmentItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPart(item.part);
    setEditTags(item.tags.join(", "));
    setEditColor(item.color);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/wardrobe/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          part: editPart,
          color: editColor,
          tags: editTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  name: editName,
                  part: editPart,
                  color: editColor,
                  tags: editTags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                }
              : item
          )
        );
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/wardrobe/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // 筛选服装
  const filteredItems =
    activeFilter === "all"
      ? items
      : items.filter((item) => item.part === activeFilter);

  // 统计各分类数量
  const itemCounts = items.reduce(
    (acc, item) => {
      acc[item.part] = (acc[item.part] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNav />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please login to use the AI Wardrobe feature.
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />

      {/* 全屏拖拽覆盖层 */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-background border-2 border-dashed border-primary rounded-2xl p-12 text-center">
            <Upload className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
            <p className="text-xl font-semibold">Drop images here</p>
            <p className="text-muted-foreground">
              Upload clothing photos to detect and organize
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* 页面标题和操作栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Wardrobe</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} items in your wardrobe
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 上传区域 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                loading && "opacity-50 pointer-events-none",
                uploadError && "border-red-500"
              )}
              onPaste={(e) => {
                const items = e.clipboardData.items;
                for (const item of items) {
                  if (item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) {
                      handleUpload(file);
                      break;
                    }
                  }
                }
              }}
              tabIndex={0}
            >
              {loading ? (
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
              ) : (
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              )}
              <p className="text-lg font-medium mb-2">
                {loading ? "Processing..." : "Drop, paste, or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Upload a photo of clothing items to detect and organize
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Max file size: 10MB | Allowed: JPEG, PNG, WebP, GIF
              </p>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

              <Button
                variant="outline"
                disabled={loading}
                className="relative"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 导入流程 */}
        {activeJob && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {activeJob.status === "analyzing" && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing Image...
                    </>
                  )}
                  {activeJob.status === "completed" && (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      Detected Clothing Items
                    </>
                  )}
                  {activeJob.status === "failed" && (
                    <>
                      <X className="h-5 w-5 text-red-500" />
                      Analysis Failed
                    </>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveJob(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* 原始图片预览 */}
              {activeJob.originalImageUrl && (
                <div className="mb-4">
                  <img
                    src={activeJob.originalImageUrl}
                    alt="Uploaded"
                    className="max-h-48 rounded-lg mx-auto"
                  />
                </div>
              )}

              {activeJob.status === "analyzing" && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span>Detecting clothing items...</span>
                </div>
              )}

              {activeJob.status === "failed" && (
                <div className="text-center py-8 text-red-500">
                  <p>{activeJob.error || "Analysis failed"}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => activeJob.id && analyzeJob(activeJob.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}

              {activeJob.status === "completed" &&
                activeJob.analysisResult && (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Found {activeJob.analysisResult.length} items. Click
                      "Extract" to add to your wardrobe.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeJob.analysisResult.map((item, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <Badge variant="secondary" className="mt-1">
                                  {PART_LABELS[item.part] || item.part}
                                </Badge>
                              </div>
                              <div
                                className="w-8 h-8 rounded-full border-2 border-muted"
                                style={{ backgroundColor: item.color }}
                                title={item.color}
                              />
                            </div>

                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleExtract(index)}
                              disabled={extracting === index}
                            >
                              {extracting === index ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Extract
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
            </CardContent>
          </Card>
        )}

        {/* 分类筛选 */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(PART_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={activeFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(key)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span>{PART_ICONS[key]}</span>
              <span>{label}</span>
              {key !== "all" && itemCounts[key] > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {itemCounts[key]}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* 服装画廊 */}
        <div className="mt-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {activeFilter === "all"
                  ? "No clothing items yet"
                  : `No ${PART_LABELS[activeFilter]?.toLowerCase()} items`}
              </p>
              <p className="text-sm">Upload a photo to get started</p>
            </div>
          ) : viewMode === "grid" ? (
            /* 网格视图 */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={item.thumbnailUrl || item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {PART_LABELS[item.part] || item.part}
                      </Badge>
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: item.color }}
                        title={item.color}
                      />
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* 列表视图 */
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <img
                      src={item.thumbnailUrl || item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {PART_LABELS[item.part] || item.part}
                        </Badge>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <AppFooter />

      {/* 项目查看器对话框 */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Category
                    </label>
                    <p className="mt-1">
                      {PART_LABELS[selectedItem.part] || selectedItem.part}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Colors
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-muted"
                        style={{ backgroundColor: selectedItem.color }}
                        title={`Primary: ${selectedItem.color}`}
                      />
                      {selectedItem.secondaryColor && (
                        <div
                          className="w-8 h-8 rounded-full border-2 border-muted"
                          style={{
                            backgroundColor: selectedItem.secondaryColor,
                          }}
                          title={`Secondary: ${selectedItem.secondaryColor}`}
                        />
                      )}
                    </div>
                  </div>
                  {selectedItem.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedItem.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        setSelectedItem(null);
                        handleEdit(selectedItem);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDelete(selectedItem.id);
                        setSelectedItem(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Clothing Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Item name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={editPart}
                onChange={(e) => setEditPart(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(PART_LABELS)
                  .filter(([key]) => key !== "all")
                  .map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                Tags (comma-separated)
              </label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
