import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadHls, type HlsInstance } from "~/lib/showcase/hls";
import type { ShowcaseCase } from "@shared/types/showcase";

const HLS_RE = /\.m3u8($|[?#])/i;

/**
 * 详情页首屏素材（案例 cover）
 *
 * 只有这里会加载视频：列表页卡片只用静态封面，避免一屏 N 个视频请求。
 * - mp4 → `<video src>` 直接播
 * - HLS（.m3u8）→ Safari 走原生；Chrome/Firefox 按需从 CDN 加载 hls.js 用 MSE 播
 * - 仍然失败（CDN 被墙、源失效、无 MSE）→ 回退成封面图，有原站链接时可点
 *
 * 失败判定统一走 `<video>` 的 error 事件 + hls.js 的 fatal error，
 * 不用 `canPlayType()`：Chrome 对 `application/vnd.apple.mpegurl` 也返回 "maybe"，
 * 但实际会抛 MEDIA_ERR_SRC_NOT_SUPPORTED（实测 code 4）。
 */
export function CaseMedia({ item }: { item: ShowcaseCase }) {
  const { t } = useTranslation();
  const cover = item.cover;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHls = !!cover.video && HLS_RE.test(cover.video);
  /**
   * 记录「哪个 src 失败了」而不是布尔值：/showcase/$slug 是同一条路由，
   * 切换案例不会重建组件，布尔值会把上一个案例的失败状态带到下一个案例上。
   */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const videoFailed = !!cover.video && failedSrc === cover.video;

  useEffect(() => {
    const src = cover.video;
    const v = videoRef.current;
    if (!src || !v) return;

    let hls: HlsInstance | null = null;
    let cancelled = false;
    const fail = () => setFailedSrc(src);

    v.addEventListener("error", fail);
    // 水合晚一步时 error 可能已经发生过
    if (v.error) fail();

    if (isHls) {
      void (async () => {
        const Hls = await loadHls();
        // 加载失败 / Safari（原生 HLS，MSE 不支持）→ 交给原生 <video src>
        if (cancelled || !Hls || !Hls.isSupported()) return;
        hls = new Hls();
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) fail();
        });
        hls.loadSource(src);
        hls.attachMedia(v);
      })();
    }

    return () => {
      cancelled = true;
      v.removeEventListener("error", fail);
      hls?.destroy();
    };
  }, [cover.video, isHls]);

  const poster = cover.videoPoster ?? cover.src;

  if (cover.video && !videoFailed) {
    return (
      <figure className="mt-5">
        <video
          ref={videoRef}
          src={isHls ? undefined : cover.video}
          poster={poster}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={item.name}
          className="w-full rounded-lg border border-[#cfcfcf] bg-black dark:border-[#243244]"
        />
      </figure>
    );
  }

  // 播不了时：只有真的有原站可去才把封面做成链接，否则裸 .m3u8 在浏览器里
  // 只会变成下载或空白页
  const href = videoFailed ? item.externalUrl : undefined;
  const img = (
    <img
      src={cover.src}
      alt={item.name}
      className="w-full rounded-lg border border-[#cfcfcf] dark:border-[#243244]"
    />
  );

  return (
    <figure className="mt-5">
      {href ? (
        <a href={href} target="_blank" rel="noopener" className="group relative block">
          {img}
          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full bg-white/95 px-3.5 py-2 text-[11px] font-bold text-[#000000]">
              ▶ {t("showcase.cite.visit")}
            </span>
          </span>
        </a>
      ) : (
        img
      )}
      {videoFailed ? (
        <figcaption className="mt-1.5 text-[10px] text-muted-foreground">
          {t("showcase.media.hlsFallback")}
        </figcaption>
      ) : null}
    </figure>
  );
}
