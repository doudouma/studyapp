export interface QuestionTocItem {
  id: string;
  title: string;
  number?: number;
}

export interface QuestionTocChapter {
  id: string;
  title: string;
  questions: QuestionTocItem[];
}

const PREFACE_TITLES = new Set([
  "写在前面",
  "Preface",
  "Prefacio",
  "Prefácio",
  "Préface",
]);

export function isQuestionPreface(title: string): boolean {
  return PREFACE_TITLES.has(title.trim());
}

/**
 * 从正文 Markdown 生成目录。只认 `## `（章）与 `### `（问题），
 * 与 renderQuestionBody 注入的 id 保持一致：
 *   - 章：chapter-{1,2,...}（跳过「写在前面」）
 *   - 问题：q-{题号}
 */
export function buildQuestionToc(markdown: string): QuestionTocChapter[] {
  const chapters: QuestionTocChapter[] = [];
  let current: QuestionTocChapter | undefined;

  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      if (!title || isQuestionPreface(title)) continue;
      current = { id: `chapter-${chapters.length + 1}`, title, questions: [] };
      chapters.push(current);
      continue;
    }
    if (line.startsWith("### ")) {
      const title = line.slice(4).trim();
      if (!title || !current) continue;
      const m = /^(\d+)\./.exec(title);
      current.questions.push({
        id: m ? `q-${m[1]}` : `q-${current.questions.length + 1}`,
        title,
        number: m ? Number(m[1]) : undefined,
      });
    }
  }

  return chapters;
}
