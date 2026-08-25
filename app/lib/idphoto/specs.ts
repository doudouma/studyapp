// 证件照规格与常量。移植自 template/证件照工具.html L286-373。
// 名称/描述等文案不在此文件，通过 i18n key `idphoto.spec.<key>.name|.desc` 提供。

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type DigitalKey = "DS160" | "US_RENEW" | "UK" | "ETIAS" | "JP" | "IN" | "CA";

export interface SizePreset {
  /** i18n key 后缀 */
  key: string;
  /** 国家/地区筛选值，对应 REGIONS.value */
  group: string;
  flag: string;
  w: number;
  h: number;
  wmm: number;
  hmm: number;
  /** 头高允许范围 mm（下巴→头顶含发型）；缺省按 hmm 的 55%~72% */
  headMin?: number;
  headMax?: number;
  bgDefault?: string;
  bgOptions?: string[];
  digitalKey?: DigitalKey;
  /** 背景合规提示 key：idphoto.bgNote.<key> */
  bgNoteKey?: string;
}

export const DPI = 300;
export const mm2px = (mm: number) => Math.round((mm / 25.4) * DPI);

export const SIZE_PRESETS: SizePreset[] = [
  // ===== 中国 =====
  { key: "oneInch", group: "cn", flag: "🇨🇳", w: 295, h: 413, wmm: 24.98, hmm: 34.97 },
  { key: "twoInch", group: "cn", flag: "🇨🇳", w: 413, h: 579, wmm: 34.97, hmm: 49.02 },
  { key: "smallOneInch", group: "cn", flag: "🇨🇳", w: 260, h: 378, wmm: 22.01, hmm: 32.0 },
  { key: "smallTwoInch", group: "cn", flag: "🇨🇳", w: 413, h: 531, wmm: 34.97, hmm: 44.96 },
  { key: "bigOneInch", group: "cn", flag: "🇨🇳", w: 390, h: 567, wmm: 33.02, hmm: 48.01 },
  { key: "bigTwoInch", group: "cn", flag: "🇨🇳", w: 413, h: 626, wmm: 34.97, hmm: 53.0 },
  { key: "teacherCert", group: "cn", flag: "🇨🇳", w: 295, h: 413, wmm: 24.98, hmm: 34.97 },
  { key: "civilServant", group: "cn", flag: "🇨🇳", w: 295, h: 413, wmm: 24.98, hmm: 34.97 },
  { key: "accounting", group: "cn", flag: "🇨🇳", w: 295, h: 413, wmm: 24.98, hmm: 34.97 },
  { key: "cet", group: "cn", flag: "🇨🇳", w: 144, h: 192, wmm: 12.19, hmm: 16.26 },
  { key: "ncre", group: "cn", flag: "🇨🇳", w: 390, h: 567, wmm: 33.02, hmm: 48.01 },
  { key: "postgrad", group: "cn", flag: "🇨🇳", w: 531, h: 709, wmm: 44.96, hmm: 60.03 },
  { key: "socialSecurity", group: "cn", flag: "🇨🇳", w: 358, h: 441, wmm: 30.31, hmm: 37.34 },
  { key: "eDriverLicense", group: "cn", flag: "🇨🇳", w: 260, h: 378, wmm: 22.01, hmm: 32.0 },
  { key: "fiveInch", group: "cn", flag: "🇨🇳", w: 1050, h: 1499, wmm: 88.9, hmm: 126.92 },
  // ===== 国际/签证 =====
  { key: "us2x2", group: "us", flag: "🇺🇸", w: 602, h: 602, wmm: 51, hmm: 51,
    headMin: 25, headMax: 35, bgDefault: "#FFFFFF", bgOptions: ["#FFFFFF", "#FAF9F6"],
    digitalKey: "DS160", bgNoteKey: "us" },
  { key: "ca50x70", group: "ca", flag: "🇨🇦", w: 591, h: 827, wmm: 50, hmm: 70,
    headMin: 31, headMax: 36, bgDefault: "#FFFFFF", bgOptions: ["#FFFFFF", "#D3D3D3"],
    digitalKey: "CA" },
  { key: "uk35x45", group: "uk", flag: "🇬🇧", w: 413, h: 531, wmm: 35, hmm: 45,
    headMin: 29, headMax: 34, bgDefault: "#D3D3D3", bgOptions: ["#D3D3D3", "#F5F5DC", "#FFFFFF"],
    digitalKey: "UK" },
  { key: "eu35x45", group: "eu", flag: "🇪🇺", w: 413, h: 531, wmm: 35, hmm: 45,
    headMin: 32, headMax: 36, bgDefault: "#D3D3D3", bgOptions: ["#D3D3D3", "#FFFFFF"],
    digitalKey: "ETIAS" },
  { key: "in35x45", group: "in", flag: "🇮🇳", w: 413, h: 531, wmm: 35, hmm: 45,
    headMin: 31.5, headMax: 36, bgDefault: "#FFFFFF", bgOptions: ["#FFFFFF"],
    digitalKey: "IN", bgNoteKey: "in" },
  { key: "au35x45", group: "au", flag: "🇦🇺", w: 413, h: 531, wmm: 35, hmm: 45,
    headMin: 32, headMax: 36, bgDefault: "#FFFFFF", bgOptions: ["#FFFFFF", "#D3D3D3"] },
  { key: "jp35x45", group: "jp", flag: "🇯🇵", w: 413, h: 531, wmm: 35, hmm: 45,
    headMin: 32, headMax: 36, bgDefault: "#FFFFFF", bgOptions: ["#FFFFFF", "#87CEFA"],
    digitalKey: "JP" },
  { key: "kr35x45", group: "kr", flag: "🇰🇷", w: 413, h: 531, wmm: 35, hmm: 45,
    headMin: 32, headMax: 36, bgDefault: "#FFFFFF", bgOptions: ["#FFFFFF"], bgNoteKey: "kr" },
  { key: "br50x70", group: "br", flag: "🇧🇷", w: 591, h: 827, wmm: 50, hmm: 70,
    headMin: 32, headMax: 36, bgDefault: "#FFFFFF", bgOptions: ["#FFFFFF"] },
  // ===== 自定义 =====
  { key: "custom", group: "other", flag: "🌐", w: 0, h: 0, wmm: 0, hmm: 0 },
];

export interface EffectiveSize {
  key: string;
  w: number;
  h: number;
  wmm: number;
  hmm: number;
}

export function currentSize(presetIdx: number, customW: number, customH: number): EffectiveSize {
  const p = SIZE_PRESETS[presetIdx] ?? SIZE_PRESETS[0];
  if (p.key === "custom") {
    const w = Math.max(1, customW || 295);
    const h = Math.max(1, customH || 413);
    return { key: "custom", w, h, wmm: (w / DPI) * 25.4, hmm: (h / DPI) * 25.4 };
  }
  return { key: p.key, w: p.w, h: p.h, wmm: p.wmm, hmm: p.hmm };
}

/** 头身比允许区间（占画幅高度的比例） */
export function headRange(s: Pick<SizePreset, "headMin" | "headMax" | "hmm">): [number, number] {
  let min = s.headMin;
  let max = s.headMax;
  if (!min || !max) {
    min = s.hmm * 0.55;
    max = s.hmm * 0.72;
  }
  return [min / s.hmm, max / s.hmm];
}

/** 自动定位目标比例（允许区间中点） */
export function headTarget(s: Pick<SizePreset, "headMin" | "headMax" | "hmm">): number {
  const [lo, hi] = headRange(s);
  return (lo + hi) / 2;
}

/** 国家/地区筛选项（label 用 idphoto.region.<value>） */
export const REGIONS = [
  { value: "all", flag: "" },
  { value: "cn", flag: "🇨🇳" },
  { value: "us", flag: "🇺🇸" },
  { value: "ca", flag: "🇨🇦" },
  { value: "uk", flag: "🇬🇧" },
  { value: "eu", flag: "🇪🇺" },
  { value: "in", flag: "🇮🇳" },
  { value: "au", flag: "🇦🇺" },
  { value: "jp", flag: "🇯🇵" },
  { value: "kr", flag: "🇰🇷" },
  { value: "br", flag: "🇧🇷" },
  { value: "other", flag: "🌐" },
] as const;

/** 底色色板（name 用 idphoto.bg.<key>） */
export const BG_COLORS = [
  { key: "white", value: "#FFFFFF" },
  { key: "red", value: "#FF0000" },
  { key: "blue", value: "#438EDB" },
  { key: "navyBlue", value: "#2D3A8C" },
  { key: "lightGray", value: "#D3D3D3" },
  { key: "beige", value: "#F5F5DC" },
  { key: "lightBlue", value: "#87CEFA" },
] as const;

export const PAPERS: Record<string, { wmm: number; hmm: number }> = {
  "4R": { wmm: 102, hmm: 152 },
  A6: { wmm: 105, hmm: 148 },
  A5: { wmm: 148, hmm: 210 },
  A4: { wmm: 210, hmm: 297 },
};

/** 数字提交预设（label/note 用 idphoto.digital.<k> / idphoto.digital.note.<k>） */
export const DIGITAL: Record<DigitalKey, { maxKB: number }> = {
  DS160: { maxKB: 240 },
  US_RENEW: { maxKB: 5120 },
  UK: { maxKB: 10240 },
  ETIAS: { maxKB: 10240 },
  JP: { maxKB: 600 },
  IN: { maxKB: 30 },
  CA: { maxKB: 0 },
};
