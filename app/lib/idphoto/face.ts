// face-api.js 运行时 CDN 加载 + TinyFaceDetector 人脸检测。
// 移植自 template/证件照工具.html L264-280（库加载）与 L572-593、L857-871（权重加载与检测）。
import type { Box } from "./specs";

const LIB_URLS = [
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js",
  "https://fastly.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js",
  "https://gcore.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js",
  "https://unpkg.com/face-api.js@0.22.2/dist/face-api.min.js",
];

const WEIGHT_URLS = [
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights",
  "https://fastly.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights",
  "https://gcore.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights",
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights",
];

let libPromise: Promise<boolean> | null = null;
let weightsReady = false;

function getFaceApi(): any {
  return (window as unknown as { faceapi?: unknown }).faceapi;
}

/** 注入 face-api.js script 标签，多 CDN 容错；SSR 环境返回 false */
export function loadFaceApi(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (getFaceApi()) return Promise.resolve(true);
  libPromise ??= new Promise<boolean>((resolve) => {
    const tryLoad = (i: number) => {
      if (i >= LIB_URLS.length) {
        console.warn("face-api.js 所有 CDN 源均加载失败，将跳过人脸检测");
        resolve(false);
        return;
      }
      const s = document.createElement("script");
      s.src = LIB_URLS[i];
      s.onload = () => resolve(true);
      s.onerror = () => tryLoad(i + 1);
      document.head.appendChild(s);
    };
    tryLoad(0);
  });
  return libPromise;
}

/**
 * 检测单张人脸。库/权重任一环节不可用或未检测到人脸时返回 null，
 * 调用方应回退到居中裁剪。永不抛错。
 */
export async function detectFace(img: HTMLImageElement): Promise<Box | null> {
  try {
    const ok = await loadFaceApi();
    const faceapi = ok ? getFaceApi() : null;
    if (!faceapi) return null;
    if (!weightsReady) {
      let loaded = false;
      for (const url of WEIGHT_URLS) {
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(url);
          loaded = true;
          break;
        } catch (e) {
          console.warn("人脸模型加载失败，换源重试", url, e);
        }
      }
      if (!loaded) return null;
      weightsReady = true;
    }
    const det = await faceapi.detectSingleFace(
      img,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 }),
    );
    if (!det) return null;
    const b = det.box;
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  } catch (e) {
    console.warn("人脸检测异常，回退居中裁剪", e);
    return null;
  }
}
