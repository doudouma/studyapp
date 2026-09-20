// Worker 入口：TanStack Start 生成的 dist/server/server.js 直接作为入口时会
// 额外导出大量非 handler 的值（B/C/D… 等常量），workerd 要求入口导出必须是
// 函数/ExportedHandler，会报 `Incorrect type for map entry`。
//
// 另外 Cron 的 scheduled 事件只会派发到默认导出对象上的方法，顶层具名
// `export { scheduled }` 不会被调用（入口校验能过，但定时任务静默不执行）。
// 因此这里只暴露一个 default 对象，把 fetch 与 scheduled 都挂在上面。
import app, { scheduled } from "./dist/server/server.js";

export default {
  fetch: app.fetch,
  scheduled,
};
