import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuestionTocChapter } from "~/features/questions/toc";

const LEGACY_PREFIX = "questions-visited:";
const STORAGE_PREFIX = "questions-progress:";

/**
 * 100 问阅读进度：localStorage 持久化，跨刷新保留。
 * 兼容旧版 sessionStorage 的 `questions-visited:{slug}` 键。
 */
export function useQuestionProgress(slug: string, toc: QuestionTocChapter[]) {
  const storageKey = `${STORAGE_PREFIX}${slug}`;
  const legacyKey = `${LEGACY_PREFIX}${slug}`;
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  const questionIds = useMemo(
    () => toc.flatMap((chapter) => chapter.questions.map((question) => question.id)),
    [toc],
  );

  useEffect(() => {
    setReady(false);
    let ids: string[] = [];
    try {
      const raw = localStorage.getItem(storageKey) ?? sessionStorage.getItem(legacyKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) ids = parsed.map(String);
      }
    } catch {
      // 隐私模式或存储不可用时静默降级
    }
    setVisited(new Set(ids));
    setReady(true);
  }, [storageKey, legacyKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify([...visited]));
      sessionStorage.removeItem(legacyKey);
    } catch {
      // ignore
    }
  }, [visited, ready, storageKey, legacyKey]);

  const markVisited = useCallback((id: string) => {
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const reset = useCallback(() => {
    setVisited(new Set());
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(legacyKey);
    } catch {
      // ignore
    }
  }, [storageKey, legacyKey]);

  const total = questionIds.length;
  const read = questionIds.reduce((count, id) => count + (visited.has(id) ? 1 : 0), 0);

  return { visited, markVisited, reset, total, read };
}
