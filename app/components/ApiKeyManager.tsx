import { useState, useEffect, useCallback } from "react";
import { Key, Copy, Check, Trash2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKeyInfo,
  type CreatedApiKey,
} from "~/features/pages/api";

export function ApiKeyManager() {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const result = await listApiKeys();
      if (result.ok && result.keys) {
        setKeys(result.keys);
      } else {
        setError(result.error || t("apikey.loadFailed"));
      }
    } catch {
      setError(t("apikey.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const result = await createApiKey(name.trim());
      if (result.ok && result.data) {
        setNewKey(result.data);
        setName("");
        fetchKeys();
      } else {
        setError(result.error || t("apikey.createFailed"));
      }
    } catch {
      setError(t("apikey.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const el = document.createElement("textarea");
      el.value = newKey.key;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm(t("apikey.confirmRevoke"))) return;
    const result = await revokeApiKey(id);
    if (result.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } else {
      setError(result.error || t("apikey.revokeFailed"));
    }
  };

  return (
    <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
        <Key className="size-5 text-[#006c49] dark:text-[#4edea3]" />
        {t("apikey.title")}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{t("apikey.desc")}</p>

      {/* Create form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("apikey.namePlaceholder")}
          maxLength={64}
          className="flex-1 h-10 rounded-xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#006c49]/30 dark:focus:ring-[#4edea3]/30"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          className="h-10 rounded-xl bg-[#006c49] px-4 text-sm font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] transition-all hover:bg-[#006c49]/90 active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)] disabled:opacity-50 dark:bg-[#4edea3] dark:text-[#002113] dark:hover:bg-[#4edea3]/90"
        >
          {creating ? "..." : t("apikey.generate")}
        </button>
      </div>

      {/* New key display */}
      {newKey && (
        <div className="mb-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t("apikey.onceWarning")}</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white dark:bg-[#15243b] border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm font-mono break-all select-all">
              {newKey.key}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 size-10 rounded-xl border border-amber-300 dark:border-amber-700 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              title={t("apikey.copy")}
            >
              {copied ? (
                <Check className="size-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="size-4 text-amber-600 dark:text-amber-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      {/* Key list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#e5eeff] dark:bg-[#1e314a]" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{t("apikey.empty")}</p>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded-xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-background px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{k.name}</span>
                  <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{k.prefix}...</code>
                </div>
                <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{t("apikey.created")}: {new Date(k.createdAt).toLocaleDateString()}</span>
                  {k.lastUsedAt && (
                    <span>{t("apikey.lastUsed")}: {new Date(k.lastUsedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRevoke(k.id)}
                className="shrink-0 size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title={t("apikey.revoke")}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
