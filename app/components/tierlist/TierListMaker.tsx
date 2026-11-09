import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TIER_CATS,
  TIERLIST_THEMES,
  TIERLIST_TOOLS,
  isTierlistTheme,
  type TierCat,
  type TierlistTheme,
} from "@shared/types/tierlist";
import {
  isBoard,
  sanitizeBoard,
  type TierBoard,
  type TierTool,
} from "~/lib/tierlist/board";

/**
 * AI 工具 Tier List 制作器
 *
 * 由 template/ai-rank/ai-tools-tierlist.html 单文件原型移植而来，改动点：
 *  1. 原型的全局 CSS（`header`/`body`/`.tier`…）全部挂到 `.tlw` 作用域下，
 *     避免与 AppNav / AppFooter / Tailwind 冲突；
 *  2. 原型直接在顶层访问 document / localStorage / location.hash，这里全部
 *     收进 useEffect —— SSR 只输出确定性的初始榜单（id 为 p0…/t1…，无随机），
 *     客户端挂载后再用分享链接或本地存档覆盖，避免 hydration mismatch；
 *  3. 原型的分类是中文字符串，这里改成分类 id（cat id），渲染时才翻译，
 *     切换语言后已有榜单的分类标签跟着变。
 */

type Translate = (key: string, opts?: Record<string, unknown>) => string;

const LOCAL_KEY = "ai-tierlist_state";

/** 等级的固定颜色；名称/英文副标题走 i18n（用户可自行改名） */
const TIER_META = [
  { id: "t1", color: "#ef4444" },
  { id: "t2", color: "#f59e0b" },
  { id: "t3", color: "#10b981" },
  { id: "t4", color: "#3b82f6" },
  { id: "t5", color: "#64748b" },
];

/* ------------------------------- 纯函数 ------------------------------- */

let seq = 0;
/** 客户端操作后新建工具用的随机 id（只在事件回调里调用，不参与 SSR） */
function uid(): string {
  seq += 1;
  return `x${Date.now().toString(36)}${seq}${Math.random().toString(36).slice(2, 6)}`;
}

/** 确定性初始榜单：id 用 p0…/t1…，保证 SSR HTML 与客户端首次渲染一致 */
function createBoard(tr: Translate): TierBoard {
  const tools: Record<string, TierTool> = {};
  const pool: string[] = [];
  TIERLIST_TOOLS.generic.forEach(([name, cat], i) => {
    const id = `p${i}`;
    tools[id] = { name, cat, comment: "" };
    pool.push(id);
  });
  return {
    title: tr("aiTierlist.ui.defaultBoard"),
    theme: "generic",
    tiers: TIER_META.map((m, i) => ({
      id: m.id,
      label: tr(`aiTierlist.tier${i + 1}.label`),
      en: tr(`aiTierlist.tier${i + 1}.en`),
      color: m.color,
      items: [],
    })),
    pool,
    tools,
  };
}

function encodeState(obj: TierBoard): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  } catch {
    return "";
  }
}

function decodeState(b64: string): TierBoard | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(b64))));
    return isBoard(parsed) ? sanitizeBoard(parsed) : null;
  } catch {
    return null;
  }
}

function loadLocal(): TierBoard | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isBoard(parsed) ? sanitizeBoard(parsed) : null;
  } catch {
    return null;
  }
}

function saveLocal(board: TierBoard): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(board));
  } catch {
    /* 隐私模式 / 存储满：静默失败，不影响使用 */
  }
}

/* ------------------------------- 画布导出 ------------------------------- */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  fontSize?: number,
): string {
  ctx.font = `${fontSize ? `400 ${fontSize}` : "400 13"}px sans-serif`;
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
  return `${s}…`;
}

/* ------------------------------- 样式 ------------------------------- */

/**
 * 全部选择器都以 `.tlw` 开头（或以 `.dark .tlw` 开头做暗色覆盖）。
 * 原型里的 `header` / `body` / `footer` 裸选择器在这里改成 `tl-*` 类名。
 */
const CSS = `
.tlw{
  --bg:#f6f7f9; --panel:#ffffff; --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb;
  --accent:#6366f1; --accent-soft:#eef2ff; --stripe-a:#fafafa; --stripe-b:#f4f4f5;
  --field:#ffffff; --shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  background:var(--bg); color:var(--ink); line-height:1.5; -webkit-font-smoothing:antialiased;
  border-radius:16px;
}
.dark .tlw{
  --bg:#0f172a; --panel:#15243b; --ink:#e5e7eb; --muted:#9ca3af; --line:#2a3b52;
  --accent:#818cf8; --accent-soft:#1e293b; --stripe-a:#131f33; --stripe-b:#101a2c;
  --field:#0f1c30;
}
.tlw *,.tlw *::before,.tlw *::after{box-sizing:border-box}
.tlw input,.tlw select,.tlw textarea,.tlw button{font-family:inherit;color:inherit}
.tl-header{
  display:flex; gap:12px; align-items:center; flex-wrap:wrap;
  max-width:1100px; margin:18px auto 0; padding:12px 14px;
  background:var(--panel); border:1px solid var(--line); border-radius:14px; box-shadow:var(--shadow);
}
.tl-doc-title{
  font-size:14px; font-weight:700; border:1px solid var(--line); background:var(--accent-soft);
  color:var(--ink); padding:7px 10px; border-radius:8px; min-width:160px; max-width:44vw;
}
.tl-doc-title:focus,.tl-theme:focus,.tl-field:focus{outline:2px solid var(--accent); outline-offset:1px}
.tl-theme{
  border:1px solid var(--line); background:var(--field); color:var(--ink); padding:8px 10px;
  border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; max-width:46vw;
}
.tl-spacer{flex:1}
.tl-btn{
  border:1px solid var(--line); background:var(--field); color:var(--ink); padding:7px 12px;
  border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; transition:.15s;
  display:inline-flex; align-items:center; gap:6px; white-space:nowrap;
}
.tl-btn:hover{border-color:var(--accent); color:var(--accent)}
.tl-btn.primary{background:var(--accent); color:#fff; border-color:var(--accent)}
.tl-btn.primary:hover{filter:brightness(1.05); color:#fff}
.tl-main{max-width:1100px; margin:0 auto; padding:14px 18px 26px}
.tl-hint{color:var(--muted); font-size:12.5px; margin:0 0 14px}
.tl-tier{
  display:flex; background:var(--panel); border:1px solid var(--line); border-radius:14px;
  margin-bottom:14px; overflow:hidden; box-shadow:var(--shadow); min-height:96px;
}
.tl-tier-label{
  width:148px; flex:none; display:flex; flex-direction:column; justify-content:center;
  padding:12px 14px; color:#fff; position:relative; cursor:pointer;
}
.tl-tier-label .tname{font-size:20px; font-weight:900; line-height:1.1}
.tl-tier-label .ten{font-size:11px; opacity:.85; font-weight:600; letter-spacing:.4px; text-transform:uppercase; margin-top:3px}
.tl-tier-label .edit{position:absolute; top:8px; right:8px; font-size:11px; opacity:.7}
.tl-tier-body{
  flex:1; padding:12px; display:flex; flex-wrap:wrap; gap:10px; align-content:flex-start;
  background:repeating-linear-gradient(45deg,var(--stripe-a),var(--stripe-a) 12px,var(--stripe-b) 12px,var(--stripe-b) 24px);
  min-height:96px; transition:.12s;
}
.tl-tier-body.dragover{background:var(--accent-soft); outline:2px dashed var(--accent); outline-offset:-6px}
.tl-chip{
  background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:8px 10px;
  display:flex; flex-direction:column; gap:2px; min-width:120px; max-width:200px; cursor:grab;
  box-shadow:var(--shadow); user-select:none; position:relative; text-align:left;
}
.tl-chip:active{cursor:grabbing}
.tl-chip.selected{outline:2px solid var(--accent); outline-offset:1px}
.tl-chip .cname{font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px}
.tl-chip .ccat{font-size:10px; color:var(--muted); background:#f1f5f9; padding:1px 6px; border-radius:6px; font-weight:600; white-space:nowrap}
.dark .tlw .tl-chip .ccat{background:#22314a}
.tl-chip .ccom{font-size:11px; color:var(--muted); margin-top:2px; word-break:break-word}
.tl-chip .ccom.empty{font-style:italic; opacity:.55}
.tl-chip .cact{position:absolute; top:5px; right:5px; display:flex; gap:4px; opacity:0; pointer-events:none; transition:.15s}
.tl-chip:hover .cact,.tl-chip:focus-within .cact{opacity:1; pointer-events:auto}
.tl-icobtn{
  width:22px; height:22px; border-radius:6px; border:1px solid var(--line); background:var(--panel);
  font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--muted);
}
.tl-icobtn:hover{color:var(--accent); border-color:var(--accent)}
.tl-pool{
  background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:14px;
  box-shadow:var(--shadow); margin-top:6px;
}
.tl-pool h3{margin:0 0 10px; font-size:14px; display:flex; align-items:center; gap:8px; flex-wrap:wrap}
.tl-pool h3 .count{color:var(--muted); font-weight:600; font-size:12px}
.tl-tools{display:flex; flex-wrap:wrap; gap:10px}
.tl-empty{color:var(--muted); font-size:13px; padding:8px 0}
.tl-addrow{display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap}
.tl-field{
  border:1px solid var(--line); background:var(--field); border-radius:9px; padding:8px 10px;
  font-size:13px; min-width:0;
}
.tl-addrow .tl-field.grow{flex:1; min-width:170px}
.tl-search{margin-left:auto; min-width:150px}
.tl-movebar{
  position:fixed; left:50%; bottom:18px; transform:translateX(-50%) translateY(140%);
  background:#111827; color:#fff; border-radius:14px; padding:10px 12px; display:flex; gap:8px;
  align-items:center; box-shadow:0 10px 30px rgba(0,0,0,.25); z-index:40; transition:.25s;
  flex-wrap:wrap; max-width:94vw;
}
.tl-movebar.show{transform:translateX(-50%) translateY(0)}
.tl-movebar .ml{font-size:12px; opacity:.85; margin-right:4px}
.tl-mbtn{border:none; color:#fff; font-weight:700; font-size:12px; padding:7px 11px; border-radius:9px; cursor:pointer}
.tl-mbtn.pool{background:#374151}
.tl-modal{
  position:fixed; inset:0; background:rgba(17,24,39,.45); display:none; align-items:center;
  justify-content:center; z-index:60; padding:16px;
}
.tl-modal.show{display:flex}
.tl-card{
  background:var(--panel); color:var(--ink); border-radius:16px; padding:20px; width:min(440px,94vw);
  box-shadow:0 20px 60px rgba(0,0,0,.3);
}
.tl-card h4{margin:0 0 12px; font-size:16px}
.tl-card textarea{
  width:100%; min-height:96px; border:1px solid var(--line); background:var(--field); color:var(--ink);
  border-radius:10px; padding:10px; font-size:13px; resize:vertical;
}
.tl-card .row{display:flex; gap:8px; justify-content:flex-end; margin-top:14px}
.tl-card .field{display:flex; flex-direction:column; gap:6px; margin-bottom:12px}
.tl-card .field > span{font-size:12px; font-weight:600; color:var(--muted)}
.tl-card .confirmtext{font-size:13px; color:var(--muted); margin:0; line-height:1.55}
.tl-card .field input[type="text"]{
  width:100%; border:1px solid var(--line); background:var(--field); color:var(--ink);
  border-radius:10px; padding:9px 10px; font-size:13px;
}
.tl-card .field input[type="text"]:focus{outline:2px solid var(--accent); outline-offset:1px}
.tl-card .colorrow{display:flex; align-items:center; gap:10px}
.tl-card .colorrow .hex{font-size:12px; color:var(--muted); font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.tl-card input[type="color"]{
  width:46px; height:34px; padding:2px; border:1px solid var(--line); border-radius:8px;
  background:var(--field); cursor:pointer;
}
.tl-toast{
  position:fixed; top:76px; left:50%; transform:translateX(-50%) translateY(-200%);
  background:#111827; color:#fff; padding:10px 16px; border-radius:10px; font-size:13px; z-index:70;
  transition:.3s; box-shadow:0 10px 30px rgba(0,0,0,.25); pointer-events:none; max-width:90vw;
}
.tl-toast.show{transform:translateX(-50%) translateY(0)}
@media(hover:none){
  /* 触屏没有 hover：动作按钮直接常显，避免「看不见但能点到」 */
  .tl-chip .cact{opacity:1; pointer-events:auto}
}
@media(max-width:640px){
  .tl-tier{flex-direction:column}
  .tl-tier-label{width:100%; flex-direction:row; align-items:center; gap:10px; padding:10px 14px}
  .tl-tier-label .ten{margin-top:0}
  .tl-doc-title{min-width:120px; max-width:40vw}
  .tl-search{margin-left:0; width:100%}
  .tl-chip{min-width:104px}
}
`;

/* ------------------------------- 组件 ------------------------------- */

type ChipProps = {
  name: string;
  catLabel: string;
  comment: string;
  selected: boolean;
  inTier: boolean;
  onSelect: () => void;
  onComment: () => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
};

function Chip({
  name, catLabel, comment, selected, inTier,
  onSelect, onComment, onRemove, onDragStart,
}: ChipProps) {
  const hasComment = (comment ?? "").trim().length > 0;
  return (
    <div
      className={`tl-chip${selected ? " selected" : ""}`}
      draggable
      onDragStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        const act = (e.target as HTMLElement).getAttribute("data-act");
        if (act === "comment") { onComment(); return; }
        if (act === "remove") { onRemove(); return; }
        onSelect();
      }}
    >
      <div className="cname">
        {name} <span className="ccat">{catLabel}</span>
      </div>
      <div className={`ccom${hasComment ? "" : " empty"}`}>
        {hasComment ? comment : "＋ ★"}
      </div>
      <div className="cact">
        <button className="tl-icobtn" data-act="comment" title="✎" aria-label="comment">✎</button>
        {inTier && (
          <button className="tl-icobtn" data-act="remove" title="↩" aria-label="back">↩</button>
        )}
      </div>
    </div>
  );
}

export function TierListMaker() {
  const { t } = useTranslation();
  const tr = t as unknown as Translate;

  const [state, setState] = useState<TierBoard>(() => createBoard(tr));
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<TierCat>("chat");
  const [modalId, setModalId] = useState<string | null>(null);
  const [modalText, setModalText] = useState("");
  const [tierModalId, setTierModalId] = useState<string | null>(null);
  const [tierDraft, setTierDraft] = useState({ label: "", en: "", color: "#64748b" });
  const [pendingTheme, setPendingTheme] = useState<TierlistTheme | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 挂载后才碰 URL / localStorage：分享链接优先，其次本地存档 */
  useEffect(() => {
    const fromHash = location.hash.startsWith("#s=")
      ? decodeState(location.hash.slice(3))
      : null;
    setState(fromHash ?? loadLocal() ?? createBoard(tr));
    setHydrated(true);
    // tr 的身份每次渲染都变，只在挂载时读一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated) saveLocal(state);
  }, [state, hydrated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalId(null);
        setTierModalId(null);
        setPendingTheme(null);
        setResetOpen(false);
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1900);
  };

  const catLabel = (cat: string) =>
    (TIER_CATS as readonly string[]).includes(cat) ? t(`aiTierlist.cat.${cat}`) : t("aiTierlist.cat.other");

  const clearUrlHash = () => {
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch {
      /* 沙箱 iframe 等场景禁止 replaceState：忽略，不影响本地编辑 */
    }
  };

  /**
   * 用户一旦改动榜单，URL 里的 `#s=…` 分享快照就过期了。
   * 若不摘掉，刷新时挂载逻辑会优先读取旧快照，把刚做的修改覆盖掉
   * （表现为「等级名改完，一刷新又变回去」）。改动后本地存档才是事实来源。
   */
  const dropStaleShareHash = () => {
    if (location.hash.startsWith("#s=")) clearUrlHash();
  };

  /** 结构性更新：深一层拷贝后再改，避免直接改 state */
  const mutate = (fn: (draft: TierBoard) => void) => {
    dropStaleShareHash();
    setState((prev) => {
      const draft: TierBoard = {
        ...prev,
        pool: [...prev.pool],
        tools: { ...prev.tools },
        tiers: prev.tiers.map((tier) => ({ ...tier, items: [...tier.items] })),
      };
      fn(draft);
      return draft;
    });
  };

  const selected = selectedId && state.tools[selectedId] ? selectedId : null;

  const moveToTier = (id: string, tierId: string) => {
    mutate((b) => {
      b.pool = b.pool.filter((x) => x !== id);
      b.tiers.forEach((tier) => { tier.items = tier.items.filter((x) => x !== id); });
      const tier = b.tiers.find((x) => x.id === tierId);
      if (tier && b.tools[id]) tier.items.push(id);
    });
    setSelectedId(null);
  };

  const moveToPool = (id: string) => {
    mutate((b) => {
      b.pool = b.pool.filter((x) => x !== id);
      b.tiers.forEach((tier) => { tier.items = tier.items.filter((x) => x !== id); });
      if (b.tools[id]) b.pool.push(id);
    });
    setSelectedId(null);
  };

  const applyTheme = (key: TierlistTheme) => {
    const theme = TIERLIST_TOOLS[key];
    const tools: Record<string, TierTool> = {};
    const pool: string[] = [];
    theme.forEach(([name, cat]) => {
      const id = uid();
      tools[id] = { name, cat, comment: "" };
      pool.push(id);
    });
    mutate((b) => {
      b.tools = tools;
      b.pool = pool;
      b.tiers.forEach((tier) => { tier.items = []; });
      b.title = t(`aiTierlist.theme.${key}.geo`);
      b.theme = key;
    });
    setSelectedId(null);
    setPendingTheme(null);
    showToast(t("aiTierlist.ui.toastTheme", { name: t(`aiTierlist.theme.${key}.label`) }));
  };

  /**
   * 切换主题会替换整份工具池，先确认。
   * 不用原生 `confirm()`：跨域 / 沙箱 iframe 里它会被浏览器忽略并在控制台报错，
   * 用户看到的就是「点了工具池没反应 + 报错」。
   */
  const loadTheme = (key: string) => {
    if (!isTierlistTheme(key)) return;
    const hasWork = Object.keys(state.tools).length > 0 || state.tiers.some((tier) => tier.items.length > 0);
    if (hasWork) { setPendingTheme(key); return; }
    applyTheme(key);
  };

  /**
   * 打开等级编辑弹窗。
   * 不再用连续三个 `prompt()`：原生弹窗在跨域 iframe / 屏蔽弹窗的浏览器里拿不到值，
   * 而且中途取消会连带丢弃已填内容（改名看起来「改了又没改」）。
   */
  const editTier = (tierId: string) => {
    const tier = state.tiers.find((x) => x.id === tierId);
    if (!tier) return;
    setTierDraft({ label: tier.label, en: tier.en, color: tier.color });
    setTierModalId(tierId);
  };

  const saveTier = () => {
    const tierId = tierModalId;
    if (!tierId) return;
    const label = tierDraft.label.trim();
    const en = tierDraft.en.trim();
    const color = /^#[0-9a-fA-F]{6}$/.test(tierDraft.color.trim())
      ? tierDraft.color.trim()
      : null;
    mutate((b) => {
      const row = b.tiers.find((x) => x.id === tierId);
      if (!row) return;
      if (label) row.label = label;
      if (en) row.en = en;
      if (color) row.color = color;
    });
    setTierModalId(null);
  };

  const addTool = () => {
    const name = newName.trim();
    if (!name) { showToast(t("aiTierlist.ui.toastNeedName")); return; }
    const id = uid();
    mutate((b) => {
      b.tools[id] = { name, cat: newCat, comment: "" };
      b.pool.push(id);
    });
    setNewName("");
    showToast(t("aiTierlist.ui.toastAdded"));
  };

  const saveModal = () => {
    if (modalId) {
      const text = modalText.trim();
      mutate((b) => {
        const tool = b.tools[modalId];
        if (tool) b.tools[modalId] = { ...tool, comment: text };
      });
    }
    setModalId(null);
  };

  const shareLink = () => {
    const b64 = encodeState(state);
    if (!b64) { showToast(t("aiTierlist.ui.toastShareFail")); return; }
    const url = `${location.origin}${location.pathname}#s=${b64}`;
    try {
      history.replaceState(null, "", `#s=${b64}`);
    } catch {
      /* 沙箱 iframe 禁止改地址栏：链接仍写进剪贴板 */
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => showToast(t("aiTierlist.ui.toastShareCopied")),
        () => showToast(t("aiTierlist.ui.toastShareFail")),
      );
    } else {
      showToast(t("aiTierlist.ui.toastShareCopied"));
    }
  };

  /** 原生 confirm 在沙箱 iframe 里会被忽略并报错，重置也改用站内弹窗 */
  const resetAll = () => setResetOpen(true);

  const doReset = () => {
    setState(createBoard(tr));
    setSelectedId(null);
    clearUrlHash();
    setResetOpen(false);
    showToast(t("aiTierlist.ui.toastReset"));
  };

  const exportImage = () => {
    const W = 1080;
    const pad = 28;
    const labelW = 150;
    const rowH = 132;
    const headH = 70;
    const H = headH + state.tiers.length * rowH + pad * 2 + 10;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    if (!ctx) { showToast(t("aiTierlist.ui.toastExportFail")); return; }

    ctx.fillStyle = "#f6f7f9";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1f2937";
    ctx.font = "700 26px sans-serif";
    ctx.fillText(state.title || "AI Tools Tier List", pad, 46);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "400 13px sans-serif";
    ctx.fillText(`100mini · ai-tierlist · ${new Date().toISOString().slice(0, 10)}`, pad, 64);

    let y = headH;
    ctx.textBaseline = "middle";
    state.tiers.forEach((tier) => {
      ctx.fillStyle = tier.color;
      roundRect(ctx, pad, y, labelW - 12, rowH - 16, 12);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "900 24px sans-serif";
      ctx.fillText(tier.label, pad + (labelW - 12) / 2, y + (rowH - 16) / 2 - 10);
      ctx.font = "600 12px sans-serif";
      ctx.fillText(tier.en, pad + (labelW - 12) / 2, y + (rowH - 16) / 2 + 14);
      ctx.textAlign = "left";

      const ix = pad + labelW;
      const iy = y + 8;
      const cellW = 150;
      const cellH = 52;
      const gx = 10;
      const gy = 10;
      let col = 0;
      let row = 0;
      tier.items.forEach((id) => {
        const tool = state.tools[id];
        if (!tool) return;
        let cx = ix + col * (cellW + gx);
        const cy = iy + row * (cellH + gy);
        if (cx + cellW > W - pad) {
          col = 0;
          row += 1;
          cx = ix;
        }
        const fx = cx;
        const fy = iy + row * (cellH + gy);
        ctx.fillStyle = "#fff";
        roundRect(ctx, fx, fy, cellW, cellH, 10);
        ctx.fill();
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#1f2937";
        ctx.font = "700 13px sans-serif";
        ctx.fillText(truncate(ctx, tool.name, cellW - 16), fx + 10, fy + 18);
        ctx.fillStyle = "#6b7280";
        const comment = tool.comment
          ? truncate(ctx, tool.comment, cellW - 16, 11)
          : `（${catLabel(tool.cat)}）`;
        ctx.font = "400 11px sans-serif";
        ctx.fillText(comment, fx + 10, fy + 36);
        col += 1;
      });
      y += rowH;
    });

    c.toBlob((blob) => {
      if (!blob) { showToast(t("aiTierlist.ui.toastExportFail")); return; }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${state.title || "ai-tierlist"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast(t("aiTierlist.ui.toastExported"));
    }, "image/png");
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e: React.DragEvent, tierId: string) => {
    e.preventDefault();
    setDragOver(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain") || "{}") as { id?: string };
      if (data.id && state.tools[data.id]) moveToTier(data.id, tierId);
    } catch {
      /* 非本工具的拖拽数据：忽略 */
    }
  };

  const filteredPool = state.pool.filter((id) => {
    const tool = state.tools[id];
    if (!tool) return false;
    const q = search.trim().toLowerCase();
    return !q || tool.name.toLowerCase().includes(q) || catLabel(tool.cat).toLowerCase().includes(q);
  });

  const themeValue = isTierlistTheme(state.theme) ? state.theme : "generic";

  return (
    <div className="tlw">
      <style>{CSS}</style>

      <div className="tl-header">
        <select
          className="tl-theme"
          value={themeValue}
          title={t("aiTierlist.ui.themeTitle")}
          aria-label={t("aiTierlist.ui.themeTitle")}
          onChange={(e) => loadTheme(e.target.value)}
        >
          {TIERLIST_THEMES.map((key) => (
            <option key={key} value={key}>
              {t(`aiTierlist.theme.${key}.label`)}
            </option>
          ))}
        </select>
        <input
          className="tl-doc-title"
          value={state.title}
          aria-label={t("aiTierlist.ui.boardName")}
          onChange={(e) => mutate((b) => { b.title = e.target.value; })}
        />
        <div className="tl-spacer" />
        <button className="tl-btn" onClick={() => nameInputRef.current?.focus()}>
          ＋ {t("aiTierlist.ui.add")}
        </button>
        <button className="tl-btn" onClick={shareLink}>
          🔗 {t("aiTierlist.ui.share")}
        </button>
        <button className="tl-btn primary" onClick={exportImage}>
          ⬇ {t("aiTierlist.ui.export")}
        </button>
        <button className="tl-btn" onClick={resetAll}>
          ↺ {t("common.reset")}
        </button>
      </div>

      <div className="tl-main">
        <p className="tl-hint">{t("aiTierlist.ui.hint")}</p>

        {state.tiers.map((tier) => (
          <div className="tl-tier" key={tier.id}>
            <div
              className="tl-tier-label"
              style={{ background: tier.color }}
              onClick={() => editTier(tier.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  editTier(tier.id);
                }
              }}
              role="button"
              tabIndex={0}
              title={t("aiTierlist.ui.editTier")}
            >
              <div className="tname">{tier.label}</div>
              <div className="ten">{tier.en}</div>
              <div className="edit">✎</div>
            </div>
            <div
              className={`tl-tier-body${dragOver === tier.id ? " dragover" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(tier.id); }}
              onDragLeave={() => setDragOver((v) => (v === tier.id ? null : v))}
              onDrop={(e) => onDrop(e, tier.id)}
              onClick={() => { if (selected) moveToTier(selected, tier.id); }}
            >
              {tier.items.map((id) => {
                const tool = state.tools[id];
                if (!tool) return null;
                return (
                  <Chip
                    key={id}
                    name={tool.name}
                    catLabel={catLabel(tool.cat)}
                    comment={tool.comment}
                    selected={selected === id}
                    inTier
                    onSelect={() => setSelectedId((v) => (v === id ? null : id))}
                    onComment={() => { setModalId(id); setModalText(tool.comment); }}
                    onRemove={() => moveToPool(id)}
                    onDragStart={(e) => onDragStart(e, id)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="tl-pool">
          <h3>
            🗂 {t("aiTierlist.ui.pool")}
            <span className="count">{t("aiTierlist.ui.unsorted", { n: state.pool.length })}</span>
            <input
              className="tl-field tl-search"
              value={search}
              placeholder={t("aiTierlist.ui.searchPlaceholder")}
              aria-label={t("aiTierlist.ui.searchPlaceholder")}
              onChange={(e) => setSearch(e.target.value)}
            />
          </h3>
          <div className="tl-addrow">
            <input
              ref={nameInputRef}
              className="tl-field grow"
              value={newName}
              placeholder={t("aiTierlist.ui.newNamePlaceholder")}
              aria-label={t("aiTierlist.ui.newNamePlaceholder")}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTool(); }}
            />
            <select
              className="tl-field"
              value={newCat}
              aria-label={t("aiTierlist.ui.category")}
              onChange={(e) => setNewCat(e.target.value as TierCat)}
            >
              {TIER_CATS.map((cat) => (
                <option key={cat} value={cat}>{t(`aiTierlist.cat.${cat}`)}</option>
              ))}
            </select>
            <button className="tl-btn primary" onClick={addTool}>
              {t("aiTierlist.ui.addBtn")}
            </button>
          </div>
          <div className="tl-tools">
            {filteredPool.length === 0 ? (
              <div className="tl-empty">
                {state.pool.length === 0
                  ? t("aiTierlist.ui.emptyPool")
                  : t("aiTierlist.ui.noMatch")}
              </div>
            ) : (
              filteredPool.map((id) => {
                const tool = state.tools[id];
                return (
                  <Chip
                    key={id}
                    name={tool.name}
                    catLabel={catLabel(tool.cat)}
                    comment={tool.comment}
                    selected={selected === id}
                    inTier={false}
                    onSelect={() => setSelectedId((v) => (v === id ? null : id))}
                    onComment={() => { setModalId(id); setModalText(tool.comment); }}
                    onRemove={() => undefined}
                    onDragStart={(e) => onDragStart(e, id)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className={`tl-movebar${selected ? " show" : ""}`}>
        <span className="ml">
          {selected ? `「${state.tools[selected].name}」 ` : ""}
          {t("aiTierlist.ui.moveTo")}
        </span>
        {state.tiers.map((tier) => (
          <button
            key={tier.id}
            className="tl-mbtn"
            style={{ background: tier.color }}
            onClick={() => selected && moveToTier(selected, tier.id)}
          >
            {tier.label}
          </button>
        ))}
        <button
          className="tl-mbtn pool"
          onClick={() => selected && moveToPool(selected)}
        >
          {t("aiTierlist.ui.poolBtn")}
        </button>
      </div>

      {modalId && state.tools[modalId] && (
        <div
          className="tl-modal show"
          onClick={(e) => { if (e.target === e.currentTarget) setModalId(null); }}
        >
          <div className="tl-card">
            <h4>{t("aiTierlist.ui.commentTitle", { name: state.tools[modalId].name })}</h4>
            <textarea
              value={modalText}
              autoFocus
              placeholder={t("aiTierlist.ui.commentPlaceholder")}
              aria-label={t("aiTierlist.ui.commentPlaceholder")}
              onChange={(e) => setModalText(e.target.value)}
            />
            <div className="row">
              <button className="tl-btn" onClick={() => setModalId(null)}>
                {t("common.cancel")}
              </button>
              <button className="tl-btn primary" onClick={saveModal}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingTheme && (
        <div
          className="tl-modal show"
          onClick={(e) => { if (e.target === e.currentTarget) setPendingTheme(null); }}
        >
          <div className="tl-card">
            <h4>{t(`aiTierlist.theme.${pendingTheme}.label`)}</h4>
            <p className="confirmtext">{t("aiTierlist.ui.confirmTheme")}</p>
            <div className="row">
              <button className="tl-btn" onClick={() => setPendingTheme(null)}>
                {t("common.cancel")}
              </button>
              <button className="tl-btn primary" onClick={() => applyTheme(pendingTheme)}>
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetOpen && (
        <div
          className="tl-modal show"
          onClick={(e) => { if (e.target === e.currentTarget) setResetOpen(false); }}
        >
          <div className="tl-card">
            <h4>{t("common.reset")}</h4>
            <p className="confirmtext">{t("aiTierlist.ui.confirmReset")}</p>
            <div className="row">
              <button className="tl-btn" onClick={() => setResetOpen(false)}>
                {t("common.cancel")}
              </button>
              <button className="tl-btn primary" onClick={doReset}>
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {tierModalId && (
        <div
          className="tl-modal show"
          onClick={(e) => { if (e.target === e.currentTarget) setTierModalId(null); }}
        >
          <div className="tl-card">
            <h4>{t("aiTierlist.ui.editTier")}</h4>
            <label className="field">
              <span>{t("aiTierlist.ui.tierNamePrompt")}</span>
              <input
                type="text"
                name="tier-name"
                value={tierDraft.label}
                autoFocus
                onChange={(e) => setTierDraft((d) => ({ ...d, label: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") saveTier(); }}
              />
            </label>
            <label className="field">
              <span>{t("aiTierlist.ui.tierEnPrompt")}</span>
              <input
                type="text"
                name="tier-en"
                value={tierDraft.en}
                onChange={(e) => setTierDraft((d) => ({ ...d, en: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") saveTier(); }}
              />
            </label>
            <div className="field">
              <span>{t("aiTierlist.ui.colorPrompt")}</span>
              <div className="colorrow">
                <input
                  type="color"
                  name="tier-color"
                  value={/^#[0-9a-fA-F]{6}$/.test(tierDraft.color) ? tierDraft.color : "#64748b"}
                  aria-label={t("aiTierlist.ui.colorPrompt")}
                  onChange={(e) => setTierDraft((d) => ({ ...d, color: e.target.value }))}
                />
                <span className="hex">{tierDraft.color}</span>
              </div>
            </div>
            <div className="row">
              <button className="tl-btn" onClick={() => setTierModalId(null)}>
                {t("common.cancel")}
              </button>
              <button className="tl-btn primary" onClick={saveTier}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`tl-toast${toast ? " show" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
