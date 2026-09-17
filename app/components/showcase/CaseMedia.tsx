import type { ShowcaseCase } from "@shared/types/showcase";

/**
 * 详情页首屏素材（案例 cover）
 *
 * 只有这里会加载视频：列表页卡片只用静态封面，避免一屏 N 个视频请求。
 * - 有 video → 静音自动播放 + 循环，带原生控制条（可取消静音/重播）
 * - 只有 src → 直接渲染图片
 * - 都没有 → 不渲染（回退到纯终端排版）
 */
export function CaseMedia({ item }: { item: ShowcaseCase }) {
  const cover = item.cover;
  if (!cover) return null;

  const poster = cover.videoPoster ?? cover.src;

  if (cover.video) {
    return (
      <figure className="mt-5">
        <video
          src={cover.video}
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

  if (cover.src) {
    return (
      <figure className="mt-5">
        <img
          src={cover.src}
          alt={item.name}
          className="w-full rounded-lg border border-[#cfcfcf] dark:border-[#243244]"
        />
      </figure>
    );
  }

  return null;
}
