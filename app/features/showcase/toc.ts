export interface CaseTocItem {
  id: string;
  title: string;
}

export interface CaseTocSection {
  id: string;
  title: string;
  children: CaseTocItem[];
}

/**
 * 从案例正文生成目录。只认 `## `（节）与 `### `（小节），
 * id 与 renderCaseBody 注入的标题 id 保持一致：
 *   - 节：sec-{1,2,...}
 *   - 小节：sec-{节号}-{1,2,...}
 */
export function buildCaseToc(markdown: string): CaseTocSection[] {
  const sections: CaseTocSection[] = [];
  let current: CaseTocSection | undefined;

  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      if (!title) continue;
      current = { id: `sec-${sections.length + 1}`, title, children: [] };
      sections.push(current);
      continue;
    }
    if (line.startsWith("### ") && current) {
      const title = line.slice(4).trim();
      if (!title) continue;
      current.children.push({
        id: `sec-${sections.length}-${current.children.length + 1}`,
        title,
      });
    }
  }

  return sections;
}
