export type Screen = "landing" | "upload" | "crop" | "analysis" | "register" | "badge";
export type Theme = "ins" | "cute" | "y2k" | "cyber" | "biz" | "hk";

export const rnd = (a: number, b: number) =>
  Math.floor(a + Math.random() * (b - a + 1));

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

export const RLBL_KEYS = [
  "petbadge.radar.颜值",
  "petbadge.radar.亲和力",
  "petbadge.radar.观察力",
  "petbadge.radar.执行力",
  "petbadge.radar.治愈力",
  "petbadge.radar.摸鱼能力",
];

export const THEME_BG: Record<Theme, string> = {
  ins: "",
  cute: "linear-gradient(180deg,#FFEFF4,#FBE0EA)",
  y2k: "linear-gradient(180deg,#F0EDFF,#E2F1FF)",
  cyber: "radial-gradient(120% 90% at 50% 0%,#1E2D36,#121E26)",
  biz: "linear-gradient(180deg,#F3F2ED,#E7E8E4)",
  hk: "linear-gradient(180deg,#FFF3DF,#F7E3C2)",
};

export const THEME_CARD: Record<Theme, string> = {
  ins: "",
  cute: "bg-[#FFF1F5] text-[#7A4155]",
  y2k: "text-[#4B3F8F]",
  cyber: "bg-gradient-to-br from-[#1A2B35] to-[#142029] text-[#D9FFE9]",
  biz: "bg-[#FBFAF6] text-[#22304A]",
  hk: "bg-[#FFF7E9] text-[#7A211C]",
};

export const THEME_KEYS: [Theme, string][] = [
  ["ins", "petbadge.theme.ins"],
  ["cute", "petbadge.theme.cute"],
  ["y2k", "petbadge.theme.y2k"],
  ["cyber", "petbadge.theme.cyber"],
  ["biz", "petbadge.theme.biz"],
  ["hk", "petbadge.theme.hk"],
];

export function RadarSVG({ vals, labels }: { vals: number[]; labels: string[] }) {
  const W = 340, H = 270, cx = W / 2, cy = 135, R = 66, n = 6;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const poly = (r: number) =>
    Array.from({ length: n }, (_, i) => pt(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Radar Chart" style="width:100%;height:auto;overflow:visible">`;
  [1, 0.66, 0.33].forEach((f) => {
    svg += `<polygon points="${poly(R * f)}" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1"/>`;
  });
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, R);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="currentColor" stroke-opacity="0.3" stroke-width="1"/>`;
  }
  svg += `<polygon points="${vals.map((v, i) => pt(i, (R * v) / 100).map((x) => x.toFixed(1)).join(",")).join(" ")}" fill="currentColor" fill-opacity="0.13" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`;
  vals.forEach((v, i) => {
    const [x, y] = pt(i, (R * v) / 100);
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="currentColor"/>`;
  });
  const LABEL_R = R + 20;
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, LABEL_R);
    let anchor = "middle";
    let lx = x;
    let ly = y;
    if (i === 0) { ly += 4; }
    else if (i === 1) { anchor = "start"; lx += 2; ly += 4; }
    else if (i === 2) { anchor = "start"; lx += 2; ly += 4; }
    else if (i === 3) { ly += 2; }
    else if (i === 4) { anchor = "end"; lx -= 2; ly += 4; }
    else { anchor = "end"; lx -= 2; ly += 4; }
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="currentColor">${labels[i]}</text>`;
  }
  return svg + "</svg>";
}

export function BarcodeSVG({ seed }: { seed: string }) {
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const r = () => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    return h / 4294967295;
  };
  let x = 0;
  const bars: string[] = [];
  while (x < 296) {
    const w = [1.5, 1.5, 2, 2, 3, 4][Math.floor(r() * 5)];
    if (r() > 0.42) bars.push(`<rect x="${x.toFixed(1)}" y="0" width="${w}" height="34"/>`);
    x += w + (r() > 0.5 ? 1.5 : 2.5);
  }
  return `<svg viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden="true">${bars.join("")}</svg>`;
}

export function BadgeClip() {
  return (
    <div className="relative z-[3] flex h-[72px] flex-col items-center pointer-events-none">
      <div className="w-[42px] h-[52px] rounded-t-xl rounded-b-[7px] bg-gradient-to-b from-[#3E4B5C] to-[#212B39] shadow-[inset_0_2px_2px_rgba(255,255,255,.28),0_6px_10px_-6px_rgba(20,30,45,.5)]" />
      <div className="w-[76px] h-[15px] -mt-[3px] bg-gradient-to-b from-[#EFF2F6] to-[#A9B4C1] rounded-[8px] shadow-[0_3px_5px_rgba(20,30,45,.25)]" />
      <div className="w-[88px] h-[10px] mt-[1px] bg-[#242E3C] rounded-[6px]" />
    </div>
  );
}
