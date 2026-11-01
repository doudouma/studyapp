export interface QuestionFaqItem {
  question: string;
  answer: string;
}

const MAX_ANSWER = 500;

/** 粗略把 Markdown 转成纯文本，供 FAQ JSON-LD 使用 */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 从正文提取 `### 问题` 下的答案，生成 FAQ 结构化数据。
 * 只取每道题的前 500 个字符，避免 JSON-LD 过大。
 */
export function buildQuestionFaq(markdown: string): QuestionFaqItem[] {
  const items: QuestionFaqItem[] = [];
  let current: { question: string; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const answer = toPlainText(current.lines.join(" "));
    if (answer) {
      items.push({
        question: current.question.replace(/^\d+\.\s*/, ""),
        answer: answer.slice(0, MAX_ANSWER),
      });
    }
    current = null;
  };

  for (const line of markdown.split("\n")) {
    if (line.startsWith("### ")) {
      flush();
      current = { question: line.slice(4).trim(), lines: [] };
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      continue;
    }
    if (current) current.lines.push(line);
  }
  flush();

  return items;
}
