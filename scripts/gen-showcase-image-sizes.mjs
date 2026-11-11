/**
 * 生成 shared/showcase/image-sizes.ts：public/showcase/ 下所有图片的固有尺寸表。
 *
 * 用途：案例正文里的 <img> 由 marked 渲染，没有尺寸信息，浏览器在图片解码前
 * 无法预留高度（CLS）。renderCaseBody 按此表给 img 注入 width/height，
 * CSS 的 width:100% + height:auto 会自动据此算出 aspect-ratio。
 *
 * 零依赖：直接解析二进制头（GIF / PNG / JPEG SOF / WebP），不引 image-size 包。
 *
 * 新增 showcase 案例素材后重新生成：node scripts/gen-showcase-image-sizes.mjs
 * （tests/showcase.spec.ts 有守护测试：正文引用的本地图片必须在表里）
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIR = join(ROOT, "public/showcase");
const OUT = join(ROOT, "shared/showcase/image-sizes.ts");

function sizeOfGif(buf) {
  return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
}

function sizeOfPng(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function sizeOfJpeg(buf) {
  // 扫描 SOF0/1/2/... 标记段取高宽
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function sizeOfWebp(buf) {
  // RIFF....WEBP，之后是 chunk 四字符码 + 4 字节小端长度
  const fourcc = buf.subarray(12, 16).toString("latin1");
  if (fourcc === "VP8 ") {
    // 有损：跳过 3 字节帧头 + 同步码 9D 01 2A，宽高各 2 字节小端，低 14 位有效
    const o = 26;
    return { w: buf.readUInt16LE(o) & 0x3fff, h: buf.readUInt16LE(o + 2) & 0x3fff };
  }
  if (fourcc === "VP8L") {
    // 无损：数据首字节是签名 0x2F，随后 4 字节打包了宽高-1（各 14 位）
    if (buf[20] !== 0x2f) return null;
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === "VP8X") {
    // 扩展：数据为 1 字节标志 + 3 字节保留 + 画布宽高-1（各 3 字节小端）
    return {
      w: buf.readUIntLE(24, 3) + 1,
      h: buf.readUIntLE(27, 3) + 1,
    };
  }
  return null;
}

const entries = [];

for (const name of readdirSync(DIR).sort()) {
  const path = join(DIR, name);
  if (!statSync(path).isFile()) continue;
  const buf = readFileSync(path);
  let size = null;
  if (buf.subarray(0, 3).toString("latin1") === "GIF") size = sizeOfGif(buf);
  else if (buf.readUInt32BE(0) === 0x89504e47) size = sizeOfPng(buf);
  else if (buf[0] === 0xff && buf[1] === 0xd8) size = sizeOfJpeg(buf);
  else if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP")
    size = sizeOfWebp(buf);
  if (!size || !size.w || !size.h) {
    console.error(`SKIP（无法解析尺寸）: ${name}`);
    continue;
  }
  entries.push([`/showcase/${name}`, size]);
}

const lines = entries
  .map(([src, { w, h }]) => `  "/showcase/${src.slice("/showcase/".length)}": { w: ${w}, h: ${h} },`)
  .join("\n");

writeFileSync(
  OUT,
  `/**
 * 本文件由 scripts/gen-showcase-image-sizes.mjs 自动生成，请勿手改。
 * public/showcase/ 下图片的固有尺寸（宽高），renderCaseBody 用它给正文
 * <img> 注入 width/height 以预留布局空间（消除加载中的 CLS）。
 * 新增案例素材后运行：node scripts/gen-showcase-image-sizes.mjs
 */
export type ImageSize = { w: number; h: number };

export const SHOWCASE_IMAGE_SIZES: Record<string, ImageSize> = {
${lines}
};
`,
);

console.log(`wrote ${OUT} (${entries.length} entries)`);
