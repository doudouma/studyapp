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
export async function captureAndUploadThumbnail(pageId: string): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.src = `/p/${pageId}`;
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = `${THUMBNAIL_WIDTH}px`;
  iframe.style.height = "1px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup(iframe);
      reject(new Error("Thumbnail capture timed out"));
    }, TIMEOUT_MS);

    iframe.addEventListener("load", async () => {
      clearTimeout(timeoutId);

      try {
        // Wait a bit for styles/fonts to settle
        await delay(600);

        const doc = iframe.contentDocument;
        if (!doc || !doc.body) {
          throw new Error("Iframe content not available");
        }

        const blob = await snapdom.toWebp(doc.body, {
          width: THUMBNAIL_WIDTH,
          scale: THUMBNAIL_SCALE,
          quality: QUALITY,
        });

        await uploadThumbnail(pageId, blob);
        resolve();
      } catch (err) {
        console.warn("[thumbnail] capture failed:", err);
        reject(err);
      } finally {
        cleanup(iframe);
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
    throw new Error(`Thumbnail upload failed: ${await res.text()}`);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
