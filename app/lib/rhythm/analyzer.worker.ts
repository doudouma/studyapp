/* 分析 Worker: 跑在后台线程, 避免长曲分析卡住界面。
   Vite module worker, 直接 import 分析模块。 */
import { analyze, SR } from "./analyzer";
import type { AnalyzeOpts } from "./analyzer";

interface WorkerRequest {
  mono: Float32Array;
  sr: number;
  opts: AnalyzeOpts;
}

const post = (m: unknown) => {
  (self as unknown as { postMessage: (msg: unknown) => void }).postMessage(m);
};

/* ready 握手: 通知主线程 worker 已就绪, 避免开发期首编译竞态 */
post({ type: "ready" });

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  const { mono, sr, opts } = e.data;
  try {
    const beatmap = analyze(mono, sr, opts || {}, (p) => {
      post({
        type: "progress",
        p: Math.max(0, Math.min(1, p)),
      });
    });
    post({
      type: "done",
      beatmap,
    });
  } catch (err) {
    post({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
