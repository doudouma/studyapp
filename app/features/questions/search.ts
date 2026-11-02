import type { QuestionTocChapter } from "./toc";

export interface QuestionSearchItem {
  id: string;
  number?: number;
  title: string;
  chapter: string;
  text: string;
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[`*_>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 把 toc 与正文合并成可搜索的 100 题索引 */
export function buildQuestionSearchIndex(
  toc: QuestionTocChapter[],
  markdown: string,
): QuestionSearchItem[] {
  const textById = new Map<string, string[]>();
  let currentId: string | null = null;

  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      currentId = null;
      continue;
    }
    if (line.startsWith("### ")) {
      const m = /^### (\d+)\./.exec(line);
      currentId = m ? `q-${m[1]}` : null;
      if (currentId) textById.set(currentId, []);
      continue;
    }
    if (currentId) textById.get(currentId)!.push(line);
  }

  return toc.flatMap((chapter) =>
    chapter.questions.map((question) => ({
      id: question.id,
      number: question.number,
      title: question.title,
      chapter: chapter.title,
      text: toPlainText(textById.get(question.id)?.join("\n") ?? ""),
    })),
  );
}

/** 标题命中优先，其次是正文命中 */
export function searchQuestions(
  items: QuestionSearchItem[],
  query: string,
  limit = 8,
): QuestionSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const titleMatches: QuestionSearchItem[] = [];
  const textMatches: QuestionSearchItem[] = [];
  for (const item of items) {
    if (item.title.toLowerCase().includes(q)) titleMatches.push(item);
    else if (item.text.toLowerCase().includes(q)) textMatches.push(item);
  }
  return [...titleMatches, ...textMatches].slice(0, limit);
}
