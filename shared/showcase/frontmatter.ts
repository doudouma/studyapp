/**
 * 极简 YAML 子集解析器（只服务案例 MD 的 frontmatter）
 *
 * 刻意不引入 yaml 依赖：案例 frontmatter 的形状是固定的，够用即可，
 * 也让 bundle 里少 ~25KB。支持的范围：
 *
 *   key: 标量                       → string（true/false → boolean）
 *   key: [a, b, c]                  → string[]
 *   key:                            → 嵌套映射（缩进更深）
 *     nested: value
 *   key:                            → 对象数组
 *     - k1: v1
 *       k2: v2
 *
 * 不支持：锚点/别名、多行块标量（| / >）、引号转义、注释块。
 * 值里出现 `:` 没关系——只按**第一个**冒号切分。`#` 只在整行注释时忽略，
 * 行内 `#` 视为普通字符（URL 里的 # 不会被吃掉）。
 */

export type FrontmatterValue =
  | string
  | boolean
  | string[]
  | FrontmatterValue[]
  | { [key: string]: FrontmatterValue };

export interface ParsedFrontmatter {
  data: Record<string, FrontmatterValue>;
  /** frontmatter 之后的正文（已 trim） */
  body: string;
}

const FENCE = "---";

function countIndent(line: string, where: string): number {
  if (line.includes("\t")) {
    throw new Error(`frontmatter 不支持 Tab 缩进（${where}）：${JSON.stringify(line)}`);
  }
  return line.length - line.trimStart().length;
}

function parseScalar(raw: string): string | boolean | string[] {
  const s = raw.trim();
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((part) => unquote(part.trim()));
  }
  if (s === "true") return true;
  if (s === "false") return false;
  return unquote(s);
}

function unquote(s: string): string {
  if (s.length >= 2 && ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'")))) {
    return s.slice(1, -1);
  }
  return s;
}

/** 跳过空行与整行注释；返回下一个有效行的下标，越界返回 lines.length */
function nextContentLine(lines: string[], from: number): number {
  let i = from;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t !== "" && !t.startsWith("#")) return i;
    i++;
  }
  return lines.length;
}

function parseMapping(
  lines: string[],
  from: number,
  indent: number,
): [Record<string, FrontmatterValue>, number] {
  const out: Record<string, FrontmatterValue> = {};
  let i = from;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      i++;
      continue;
    }
    if (countIndent(line, "mapping") < indent) break;
    if (trimmed.startsWith("- ")) break;

    const colon = trimmed.indexOf(":");
    if (colon === -1) throw new Error(`frontmatter 无法解析的行：${JSON.stringify(line)}`);

    const key = trimmed.slice(0, colon).trim();
    const inline = trimmed.slice(colon + 1).trim();
    if (!key) throw new Error(`frontmatter 缺少 key：${JSON.stringify(line)}`);

    if (inline !== "") {
      out[key] = parseScalar(inline);
      i++;
      continue;
    }

    const child = nextContentLine(lines, i + 1);
    if (child === lines.length || countIndent(lines[child], "child") <= indent) {
      out[key] = "";
      i++;
      continue;
    }
    if (lines[child].trim().startsWith("- ")) {
      const [arr, next] = parseSequence(lines, child, countIndent(lines[child], "seq"));
      out[key] = arr;
      i = next;
    } else {
      const [map, next] = parseMapping(lines, child, countIndent(lines[child], "map"));
      out[key] = map;
      i = next;
    }
  }

  return [out, i];
}

function parseSequence(lines: string[], from: number, indent: number): [FrontmatterValue[], number] {
  const out: FrontmatterValue[] = [];
  let i = from;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      i++;
      continue;
    }
    if (countIndent(line, "sequence") < indent) break;
    if (!trimmed.startsWith("- ")) break;

    const inline = trimmed.slice(2).trim();
    const colon = inline.indexOf(":");

    if (colon === -1) {
      out.push(parseScalar(inline));
      i++;
      continue;
    }

    // 序列里的一条映射：把首行还原成同缩进的普通行，后续更深缩进的行原样带入
    const itemIndent = indent + 2;
    const head = " ".repeat(itemIndent) + inline;
    const itemLines = [head];
    let j = i + 1;
    while (j < lines.length) {
      const l = lines[j];
      if (l.trim() === "") {
        j++;
        continue;
      }
      if (countIndent(l, "sequence item") < itemIndent) break;
      itemLines.push(l);
      j++;
    }
    const [item] = parseMapping(itemLines, 0, itemIndent);
    out.push(item);
    i = j;
  }

  return [out, i];
}

/** 解析 `---` 包裹的 frontmatter，返回元数据与正文 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const text = raw.replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  if (lines[0]?.trim() !== FENCE) {
    throw new Error("frontmatter 必须以 --- 开头");
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === FENCE) {
      end = i;
      break;
    }
  }
  if (end === -1) throw new Error("frontmatter 缺少结束的 ---");

  // 只把 frontmatter 区间的行交给解析器：结束围栏不能进 lines，
  // 否则 parseMapping 会把 `---` 当成畸形行。
  const [data] = parseMapping(lines.slice(1, end), 0, 0);
  const body = lines
    .slice(end + 1)
    .join("\n")
    .trim();

  return { data, body };
}
