/* 节奏游戏 · 引擎依赖的最小样式
   页面布局与配色已迁移到 Tailwind + 100mini 设计系统 (shadcn tokens),
   这里只保留引擎通过 classList / data-* / style 直接操作的动画与定位。 */
export const rhythmCss = `
.rhythm-page *{box-sizing:border-box}

/* 连击: 引擎切换 .pop / .burst */
.r-combo{display:inline-block}
.r-combo.pop{animation:r-pop .18s ease-out}
.r-combo.burst{animation:r-cburst .62s cubic-bezier(.2,.8,.3,1)}
@keyframes r-pop{from{transform:scale(1.35)}to{transform:scale(1)}}
@keyframes r-cburst{
  0%{transform:scale(1);text-shadow:none}
  25%{transform:scale(1.75);text-shadow:0 0 26px #ffd45e,0 0 52px #ffd45e}
  100%{transform:scale(1);text-shadow:0 0 10px rgba(255,212,94,.4)}
}

/* 判定文字: 引擎切换 .show 并设置 data-kind 与颜色
   定位锚: 游戏 section (absolute inset-0), 与原版 #play 一致, bottom:26% 相对整个 section(含 HUD) */
.r-judge{
  position:absolute;left:0;right:0;bottom:26%;text-align:center;
  font:800 28px/.9 -apple-system,sans-serif;letter-spacing:.045em;pointer-events:none;
  opacity:0;transform:translateY(9px) scale(.76);
  text-shadow:0 2px 0 rgba(0,0,0,.42),0 0 20px currentColor;
}
.r-judge.show{opacity:1;animation:r-jd .46s cubic-bezier(.16,.85,.28,1)}
.r-judge[data-kind="perfect"]{font-size:32px;letter-spacing:.07em}
.r-judge[data-kind="miss"]{font-size:24px;letter-spacing:.11em}
@keyframes r-jd{
  0%{opacity:0;transform:translateY(13px) scale(.55)}
  22%{opacity:1;transform:translateY(0) scale(1.17)}
  48%{opacity:1;transform:translateY(-3px) scale(1)}
  100%{opacity:0;transform:translateY(-18px) scale(.93)}
}

/* 中央大字 (倒计时 / 连击里程碑): 引擎切换 .show */
.r-big{
  position:absolute;left:0;right:0;top:38%;text-align:center;pointer-events:none;
  font:900 46px/1 ui-monospace,-apple-system,monospace;letter-spacing:.06em;
  opacity:0;z-index:6;
  text-shadow:0 0 18px currentColor,0 0 46px currentColor,0 3px 0 rgba(0,0,0,.4);
}
.r-big.show{animation:r-big 1.1s cubic-bezier(.15,.9,.25,1)}
@keyframes r-big{
  0%{opacity:0;transform:scale(.4) rotate(-4deg)}
  14%{opacity:1;transform:scale(1.28) rotate(1.5deg)}
  30%{transform:scale(.98) rotate(0)}
  62%{opacity:1;transform:scale(1.04)}
  100%{opacity:0;transform:scale(1.5)}
}

/* 进度条: 引擎只改 style.width, 平滑过渡交给 CSS */
.r-progress-bar{display:block;height:100%;transition:width .12s linear}

/* 暂停遮罩: 引擎切换 hidden 属性 */
.r-overlay[hidden]{display:none}

/* 结算 SSS 呼吸光晕 */
.r-rank[data-rank="SSS"]{animation:r-sss 1.6s ease-in-out infinite}
@keyframes r-sss{
  0%,100%{text-shadow:0 0 30px currentColor}
  50%{text-shadow:0 0 58px currentColor,0 0 96px currentColor}
}
`;
