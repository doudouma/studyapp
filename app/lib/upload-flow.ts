import { snapdom } from "@zumer/snapdom";
import { uploadPageThumbnail } from "~/features/pages/api";

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 600;
const THUMBNAIL_SCALE = 1;
const QUALITY = 0.5;
const TIMEOUT_MS = 12000;

export async function captureAndUploadThumbnail(pageId: string): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.src = `/p/${pageId}`;
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = `${THUMBNAIL_WIDTH}px`;
  iframe.style.height = `${THUMBNAIL_HEIGHT}px`;
  iframe.style.overflow = "hidden";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup(iframe);
      reject(new Error("缩略图生成超时"));
    }, TIMEOUT_MS);

    iframe.addEventListener("load", async () => {
      clearTimeout(timeoutId);
      try {
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) {
          throw new Error("iframe 内容不可用");
        }

        const wrapper = doc.createElement("div");
        wrapper.style.width = `${THUMBNAIL_WIDTH}px`;
        wrapper.style.height = `${THUMBNAIL_HEIGHT}px`;
        wrapper.style.overflow = "hidden";
        while (doc.body.firstChild) {
          wrapper.appendChild(doc.body.firstChild);
        }
        doc.body.appendChild(wrapper);

        await delay(1000);

        const blob = await snapdom.toBlob(wrapper, {
          width: THUMBNAIL_WIDTH,
          quality: QUALITY,
          type: "webp",
        });

        await uploadThumbnail(pageId, blob);
        resolve();
      } catch (err) {
        cleanup(iframe);
        reject(err);
      } finally {
        cleanup(iframe);
      }
    });

    iframe.addEventListener("error", () => {
      clearTimeout(timeoutId);
      cleanup(iframe);
      reject(new Error("iframe 加载失败"));
    });
  });
}

function cleanup(iframe: HTMLIFrameElement) {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}

async function uploadThumbnail(pageId: string, blob: Blob) {
  const formData = new FormData();
  formData.append("pageId", pageId);
  formData.append("thumbnail", blob, `${pageId}.webp`);

  const result = await uploadPageThumbnail(formData);
  if (!result.ok) {
    throw new Error(`缩略图上传失败: ${result.error || "未知错误"}`);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
