/**
 * 「AIX」设计系统 —— 参考 template/ai-rank/lime-corporate-presentation.html
 *
 * 浅灰底 + 白色细框、酸橙/墨黑、超大全大写标题、微型编号标签、点阵网格。
 * 同时服务 /ai-tierlist 与 /ai-tierlist-stats；组件自身的皮肤（TierListMaker）
 * 也使用同一组颜色变量。
 */
export const AIX_CSS = `
.aix{
  --aix-bg:#ededed; --aix-paper:#ffffff; --aix-ink:#111214; --aix-lime:#d8ff00;
  --aix-grey:#f2f2f2; --aix-grey2:#e9e9e9; --aix-mute:#6f6f6f; --aix-line:#e3e3e3;
  --aix-pad:clamp(18px,3.2vw,44px);
  background:var(--aix-bg); color:var(--aix-ink);
  font-feature-settings:"tnum" 1;
  padding:26px 20px 64px;
}
.dark .aix{
  --aix-bg:#0c0d0f; --aix-paper:#15171a; --aix-ink:#ededed; --aix-mute:#9a9a9a;
  --aix-grey:#1b1e22; --aix-grey2:#22262b; --aix-line:#2a2d32;
}
.aix *,.aix *::before,.aix *::after{box-sizing:border-box}
.aix ::selection{background:var(--aix-lime);color:#111214}

.aix-frame{
  max-width:1200px; margin:0 auto 20px; background:var(--aix-paper);
  border:1px solid var(--aix-line); border-radius:3px; padding:var(--aix-pad);
  scroll-margin-top:84px;
}
.aix-mininav{
  display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px 20px;
  border-bottom:1px solid var(--aix-line); padding-bottom:12px; margin-bottom:clamp(24px,3.4vw,40px);
  font-size:9px; letter-spacing:.18em; text-transform:uppercase; font-weight:700; color:var(--aix-mute);
}
.aix-mininav .brand{display:inline-flex;align-items:center;gap:8px;color:var(--aix-ink);font-size:11px;letter-spacing:.2em}
.aix-mininav .dot{width:8px;height:8px;border-radius:50%;background:var(--aix-lime);border:1px solid var(--aix-ink);display:inline-block}
.aix-mininav a{display:inline-flex;align-items:center;gap:4px;color:var(--aix-ink);text-decoration:none;border-bottom:1px solid transparent;transition:border-color .2s}
.aix-mininav a:hover{border-color:var(--aix-ink)}

.aix-hero{display:flex;flex-direction:column;min-height:clamp(460px,48vw,600px)}
.aix-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(20px,3vw,48px);flex:1;min-height:0}
.aix-hero-copy{display:flex;flex-direction:column;justify-content:space-between;gap:26px;position:relative;z-index:2}
.aix-topline{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:18px}
.aix-pill{
  display:inline-flex;align-items:center;gap:8px;background:var(--aix-grey);border-radius:40px;
  padding:8px 14px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
}
.aix-pill.lime{background:var(--aix-lime);color:#111214}
.aix-pill .dot{width:7px;height:7px;border-radius:50%;background:#111214;display:inline-block;flex:none}
.aix-kicker{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--aix-mute);font-weight:700}
.aix-h1{
  margin:0; font-size:clamp(38px,6vw,84px); line-height:.98; font-weight:800;
  letter-spacing:-.045em; text-transform:uppercase; max-width:15ch;
}
.aix-lede{margin:18px 0 0;max-width:48ch;font-size:clamp(13px,1.05vw,16px);line-height:1.55;color:var(--aix-mute)}
.aix-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:26px}
.aix-stat{
  display:flex;flex-direction:column;justify-content:space-between;min-height:104px;
  padding:14px 16px;border-radius:2px;background:var(--aix-grey);
}
.aix-stat .n{font-size:clamp(24px,2.6vw,36px);font-weight:800;letter-spacing:-.05em;line-height:1}
.aix-stat .l{font-size:9px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;line-height:1.4;margin-top:8px}
.aix-stat.lime{background:var(--aix-lime);color:#111214}
.aix-stat.ink{background:#111214;color:#fff}
.aix-stat.ink .l{color:#a5a5a5}
.aix-stat.ghost{background:transparent;border:1px solid var(--aix-line)}

.aix-art{
  position:relative;overflow:hidden;border-radius:2px;background:var(--aix-lime);color:#111214;
  display:flex;flex-direction:column;justify-content:space-between;padding:clamp(18px,2.4vw,28px);
  min-height:340px;
}
.aix-art-grid{
  position:absolute;inset:0;opacity:.55;pointer-events:none;
  background-image:radial-gradient(rgba(17,18,20,.16) 1px,transparent 1px);
  background-size:16px 16px;
}
.aix-art-burst{position:absolute;right:18px;top:18px;width:58px;height:58px;color:#111214;z-index:2}
.aix-art-burst line{stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
.aix-art-burst circle{fill:currentColor}
.aix-art-s{
  position:relative;z-index:1;margin-top:auto;font-size:clamp(110px,14vw,200px);
  line-height:.78;font-weight:800;letter-spacing:-.08em;
}
.aix-art-s span{display:block;font-size:10px;letter-spacing:.16em;font-weight:800;margin-top:12px}
.aix-art-rows{position:relative;z-index:1;margin-top:18px;border-top:1px solid rgba(17,18,20,.35)}
.aix-art-row{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  border-bottom:1px solid rgba(17,18,20,.35);padding:7px 0;
  font-size:9px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;
}
.aix-art-row b{font-size:13px;letter-spacing:0}

.aix-sec-head{
  display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;
  border-bottom:1px solid var(--aix-line);padding-bottom:12px;margin-bottom:20px;
}
.aix-section-num{font-size:9px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:var(--aix-mute)}
.aix-sec-title{
  margin:4px 0 0;font-size:clamp(20px,2.4vw,30px);font-weight:800;line-height:1.05;
  letter-spacing:-.03em;text-transform:uppercase;
}
.aix-body{margin:0;max-width:72ch;font-size:13px;line-height:1.6;color:var(--aix-mute)}
.aix-dot-sm{width:8px;height:8px;border-radius:50%;background:var(--aix-lime);border:1px solid var(--aix-ink);display:inline-block;flex:none}

.aix-strip{
  max-width:1200px;margin:0 auto 20px;display:flex;align-items:center;gap:16px;
  background:var(--aix-lime);color:#111214;border-radius:2px;padding:14px 20px;
  text-decoration:none;transition:transform .2s;
}
.aix-strip:hover{transform:translateY(-2px)}
.aix-strip .k{font-size:9px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;flex:none}
.aix-strip strong{display:block;font-size:13px;font-weight:800;letter-spacing:-.01em}
.aix-strip small{display:block;margin-top:2px;font-size:11px;line-height:1.4;opacity:.7}
.aix-strip .go{margin-left:auto;flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1px solid rgba(17,18,20,.4)}

.aix-notes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:22px}
.aix-note{padding:16px;border-radius:2px;min-height:180px;display:flex;flex-direction:column;gap:10px;background:var(--aix-grey)}
.aix-note .num{font-size:10px;letter-spacing:.16em;font-weight:800;opacity:.5}
.aix-note h3{margin:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;line-height:1.35}
.aix-note p{margin:0;font-size:12px;line-height:1.5;opacity:.75}
.aix-note.ink{background:#111214;color:#fff}
.aix-note.ink p{color:#cfcfcf;opacity:1}
.aix-note.lime{background:var(--aix-lime);color:#111214}
.aix-note.ghost{background:transparent;border:1px solid var(--aix-line)}

.aix-how{display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(20px,3vw,44px)}
.aix-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.aix-step{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:2px;background:var(--aix-grey);font-size:13px;line-height:1.45}
.aix-step .num{font-size:10px;font-weight:800;letter-spacing:.12em;opacity:.5;flex:none}
.aix-step:nth-child(1){background:var(--aix-lime);color:#111214}
.aix-step:nth-child(4){background:#111214;color:#fff}

.aix-faq{border-top:1px solid var(--aix-line)}
.aix-faq details{border-bottom:1px solid var(--aix-line)}
.aix-faq summary{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:16px 0;cursor:pointer;list-style:none;font-size:13px;font-weight:700;line-height:1.4;
}
.aix-faq summary::-webkit-details-marker{display:none}
.aix-faq summary .plus{font-size:16px;font-weight:400;color:var(--aix-mute);transition:transform .2s}
.aix-faq details[open] summary .plus{transform:rotate(45deg)}
.aix-faq .answer{padding:0 0 16px;max-width:72ch;font-size:13px;line-height:1.6;color:var(--aix-mute)}

.aix-cta{
  max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px;
  background:#111214;color:#fff;border-radius:3px;padding:clamp(24px,4vw,48px);
}
.aix-cta h2{margin:0;font-size:clamp(24px,3.2vw,42px);line-height:1;letter-spacing:-.04em;text-transform:uppercase}
.aix-cta p{margin:10px 0 0;max-width:46ch;font-size:13px;line-height:1.55;color:#b9b9b9}
.aix-cta a{
  display:inline-flex;align-items:center;gap:8px;flex:none;background:var(--aix-lime);color:#111214;
  padding:12px 18px;border-radius:2px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;
  transition:transform .2s;
}
.aix-cta a:hover{transform:translateY(-2px)}

@media(max-width:900px){
  .aix-hero-grid,.aix-how{grid-template-columns:1fr}
  .aix-notes{grid-template-columns:repeat(2,minmax(0,1fr))}
  .aix-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .aix-art{min-height:300px}
  .aix-art-s{font-size:clamp(96px,22vw,150px)}
}
@media(max-width:560px){
  .aix{padding:16px 12px 40px}
  .aix-frame{padding:18px}
  .aix-notes{grid-template-columns:1fr}
  .aix-h1{font-size:clamp(32px,10vw,52px)}
  .aix-strip{flex-wrap:wrap}
  .aix-strip .k{width:100%}
}
`;
