/**
 * HLS 播放支持：Chrome / Firefox / Edge 的 `<video>` 播不了 `.m3u8`，
 * 需要 MSE + hls.js。这里按 idphoto 加载 face-api.js 的同一套做法：
 * 运行时注入 script、多 CDN 容错、模块级缓存、SSR 安全，主 bundle 零增量。
 *
 * Safari（含 iOS）原生支持 HLS，会走 `<video src>`，不会加载这个库。
 */

const CDN_URLS = [
  "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js",
  "https://unpkg.com/hls.js@1/dist/hls.min.js",
];

const GLOBAL_KEY = "Hls";

export interface HlsErrorData {
  fatal: boolean;
  type: string;
  details: string;
}

export interface HlsInstance {
  loadSource(src: string): void;
  attachMedia(el: HTMLVideoElement): void;
  on(event: string, cb: (event: string, data: HlsErrorData) => void): void;
  destroy(): void;
}

export interface HlsConstructor {
  /** 当前浏览器是否具备 MSE（Safari 上为 false，因为 Safari 用原生 HLS） */
  isSupported(): boolean;
  Events: { ERROR: string };
  new (config?: Record<string, unknown>): HlsInstance;
}

function getGlobal(): HlsConstructor | undefined {
  return (globalThis as unknown as Record<string, unknown>)[GLOBAL_KEY] as
    | HlsConstructor
    | undefined;
}

let libPromise: Promise<HlsConstructor | null> | null = null;

/** 按需加载 hls.js；全部 CDN 失败时返回 null（调用方回退到静态封面） */
export function loadHls(): Promise<HlsConstructor | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const existing = getGlobal();
  if (existing) return Promise.resolve(existing);

  libPromise ??= new Promise<HlsConstructor | null>((resolve) => {
    const tryLoad = (i: number) => {
      if (i >= CDN_URLS.length) {
        console.warn("hls.js 所有 CDN 源均加载失败，HLS 视频将回退为静态封面");
        resolve(null);
        return;
      }
      const s = document.createElement("script");
      s.src = CDN_URLS[i];
      s.async = true;
      s.onload = () => resolve(getGlobal() ?? null);
      s.onerror = () => tryLoad(i + 1);
      document.head.appendChild(s);
    };
    tryLoad(0);
  });

  return libPromise;
}
