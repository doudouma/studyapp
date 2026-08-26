import type { RefObject } from "react";

interface PreviewCanvasProps {
  resultRef: RefObject<HTMLCanvasElement | null>;
  rulerRef: RefObject<HTMLCanvasElement | null>;
  W: number;
  H: number;
}

/** 结果画布 + 头身比标尺 overlay 双层 canvas */
export function PreviewCanvas({ resultRef, rulerRef, W, H }: PreviewCanvasProps) {
  return (
    <div
      className="relative mx-auto block w-fit max-w-full overflow-hidden rounded-xl border border-border"
      style={{
        backgroundImage: "repeating-conic-gradient(#d1d5db 0% 25%, #ffffff 0% 50%)",
        backgroundSize: "20px 20px",
      }}
    >
      <canvas ref={resultRef} width={W} height={H} className="block h-auto max-w-full" />
      <canvas ref={rulerRef} width={W} height={H} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
