import { snapdom } from "@zumer/snapdom";

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_SCALE = 2;
const QUALITY = 0.8;
const TIMEOUT_MS = 8000;

/**
 * Set up thumbnail capture after upload.
 * Creates a hidden iframe to render the page, captures with SnapDOM,
 * then uploads the WebP to the server.
 */
export async function captureAndUploadThumbnail(pageId: string) {
  const iframe = document.createElement("iframe");
  iframe.src = `/p/${pageId}`;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const timeoutId = setTimeout(() => {
    cleanup(iframe);
  }, TIMEOUT_MS);

  return new Promise<void>((resolve) => {
    iframe.addEventListener("load", async () => {
      clearTimeout(timeoutId);

      // Wait a bit for styles/fonts to settle
      await delay(600);

      try {
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) {
          resolve();
          return;
        }

        const blob = await snapdom.toWebp(doc.body, {
          width: THUMBNAIL_WIDTH,
          scale: THUMBNAIL_SCALE,
          quality: QUALITY,
        });

        await uploadThumbnail(pageId, blob);
      } catch {
        // Silently fail — thumbnail is optional
      } finally {
        cleanup(iframe);
        resolve();
      }
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

  const res = await fetch("/api/upload-thumbnail", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.warn("Thumbnail upload failed:", await res.text());
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
