/**
 * 图书目录页共用样式（AIX 设计系统）
 * 服务 /ai-books、/ai-books/free、/ai-books/[slug]。
 * 依赖 `AIX_CSS` 中的 --aix-* 变量。
 */
export const BOOKS_CSS = `
.ab-layout{display:grid;gap:24px}
@media(min-width:1024px){.ab-layout{grid-template-columns:214px minmax(0,1fr);gap:36px}}
.ab-side{min-width:0;display:flex;flex-direction:column;gap:2px}
@media(min-width:1024px){.ab-side{position:sticky;top:96px;align-self:start}}
.ab-nav{display:flex;gap:2px;overflow-x:auto;padding-bottom:6px}
@media(min-width:1024px){.ab-nav{flex-direction:column;overflow:visible;padding-bottom:0}}
.ab-nav-item{
  display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:2px;border:1px solid transparent;
  background:transparent;color:var(--aix-mute);font-size:12px;font-weight:700;line-height:1.3;
  white-space:nowrap;cursor:pointer;text-align:left;transition:.15s;flex:none;
}
@media(min-width:1024px){.ab-nav-item{width:100%}}
.ab-nav-item:hover{background:var(--aix-grey);color:var(--aix-ink)}
.ab-nav-item.is-active{background:#111214;color:var(--aix-lime);border-color:#111214}
.ab-nav-item .ic{width:14px;height:14px;flex:none}
.ab-nav-item .badge{margin-left:auto;background:#111214;color:var(--aix-lime);font-size:8px;letter-spacing:.12em;padding:2px 5px;border-radius:2px;font-weight:800}
.ab-nav-item.ab-free{background:var(--aix-lime);color:#111214;border-color:transparent;margin-top:6px}
.ab-nav-item.ab-free:hover{background:#c9ef00;color:#111214}
.ab-label{font-size:9px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:var(--aix-mute);padding:0 10px;margin:16px 0 5px}
.ab-topic{
  display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:2px;
  border:0;background:transparent;color:var(--aix-mute);font-size:12px;text-align:left;cursor:pointer;white-space:nowrap;flex:none;
}
@media(min-width:1024px){.ab-topic{width:100%}}
.ab-topic:hover{background:var(--aix-grey);color:var(--aix-ink)}
.ab-topic.is-active{background:var(--aix-grey);color:var(--aix-ink);font-weight:800}
.ab-topic .n{font-size:10px;font-variant-numeric:tabular-nums;opacity:.6}
.ab-side-note{padding:10px;font-size:10.5px;line-height:1.5;color:var(--aix-mute)}

.ab-search{position:relative;width:100%;max-width:420px}
.ab-search input{
  width:100%;height:38px;border:1px solid var(--aix-line);background:var(--aix-paper);border-radius:2px;
  padding:0 36px 0 32px;font-size:12px;color:var(--aix-ink);outline:none;
}
.ab-search input:focus{border-color:var(--aix-ink)}
.ab-search .ic{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--aix-mute);pointer-events:none}
.ab-search kbd{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);border:1px solid var(--aix-line);border-radius:2px;
  padding:1px 5px;font-size:9px;color:var(--aix-mute);background:var(--aix-grey);
}

.ab-viewhead{margin:22px 0 12px;border-bottom:1px solid var(--aix-line);padding-bottom:12px}
.ab-viewhead h2{margin:3px 0 0;font-size:clamp(20px,2.2vw,28px);font-weight:800;letter-spacing:-.03em;text-transform:uppercase;line-height:1.05}
.ab-viewhead p{margin:6px 0 0;max-width:72ch;font-size:12.5px;line-height:1.6;color:var(--aix-mute)}

.ab-filters{display:flex;flex-direction:column;gap:8px;margin:14px 0}
.ab-filterrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.ab-filterrow > span{min-width:74px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:800;color:var(--aix-mute)}
.ab-chip{
  height:28px;padding:0 11px;border:1px solid var(--aix-line);background:var(--aix-paper);color:var(--aix-mute);
  font-size:10.5px;font-weight:700;border-radius:2px;cursor:pointer;white-space:nowrap;transition:.15s;
}
.ab-chip:hover{border-color:var(--aix-ink);color:var(--aix-ink)}
.ab-chip.is-active{background:#111214;border-color:#111214;color:var(--aix-lime)}

.ab-details{border:1px solid var(--aix-line);background:var(--aix-paper);border-radius:2px;margin-top:16px}
.ab-details summary{display:flex;align-items:center;gap:8px;padding:11px 14px;cursor:pointer;list-style:none;font-size:12px;font-weight:800}
.ab-details summary::-webkit-details-marker{display:none}
.ab-details summary .chev{width:14px;height:14px;color:var(--aix-mute);transition:transform .2s;flex:none}
.ab-details[open] summary .chev{transform:rotate(180deg)}
.ab-details .hint{margin-left:auto;font-size:10px;color:var(--aix-mute);font-weight:600}
.ab-details .note{border-top:1px solid var(--aix-line);padding:8px 14px;font-size:10.5px;line-height:1.5;color:var(--aix-mute)}
.ab-tablewrap{overflow-x:auto;border-top:1px solid var(--aix-line)}
.ab-table{width:100%;min-width:920px;border-collapse:collapse;text-align:left}
.ab-table th{
  background:var(--aix-grey);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--aix-mute);
  font-weight:800;padding:8px 10px;border-bottom:1px solid var(--aix-line);
}
.ab-table td{padding:10px;border-bottom:1px solid var(--aix-line);vertical-align:top;font-size:11.5px;line-height:1.5;color:var(--aix-mute)}
.ab-table tr:last-child td{border-bottom:0}
.ab-table a{color:var(--aix-ink);font-weight:700;text-decoration:none}
.ab-table a:hover{text-decoration:underline}
.ab-meta{display:block;margin-top:2px;font-size:10px;color:var(--aix-mute);font-weight:600}
.ab-mark{display:inline-grid;place-items:center;width:16px;height:16px;border-radius:2px;font-size:10px;font-weight:800;margin-right:4px;vertical-align:1px}
.ab-mark.yes{background:var(--aix-lime);color:#111214}
.ab-mark.no{background:var(--aix-grey);color:var(--aix-mute)}

.ab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 12px;padding:18px 0}
@media(min-width:640px){.ab-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:768px){.ab-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(min-width:1024px){.ab-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(min-width:1280px){.ab-grid{grid-template-columns:repeat(6,minmax(0,1fr))}}
.ab-empty{padding:64px 0;text-align:center;font-size:12px;color:var(--aix-mute)}

.ab-browse{margin-top:30px;border-top:1px solid var(--aix-line);padding-top:18px}
.ab-subhead{margin:0;font-size:15px;font-weight:800;letter-spacing:-.02em;text-transform:uppercase}
.ab-subdesc{margin:4px 0 0;font-size:11px;color:var(--aix-mute)}
.ab-links{display:grid;gap:6px;margin-top:12px}
@media(min-width:640px){.ab-links{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.ab-links{grid-template-columns:repeat(3,minmax(0,1fr))}}
.ab-link{
  display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--aix-line);
  border-radius:2px;padding:9px 11px;font-size:12px;color:var(--aix-mute);text-decoration:none;background:var(--aix-paper);transition:.15s;
}
.ab-link:hover{border-color:var(--aix-ink);color:var(--aix-ink)}
.ab-link .n{font-size:10px;font-variant-numeric:tabular-nums;opacity:.6}
.ab-path{
  display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:11px;font-weight:800;
  color:var(--aix-ink);text-decoration:none;border-bottom:1px solid var(--aix-line);
}
.ab-path:hover{border-color:var(--aix-ink)}

.ab-notes{display:grid;gap:8px;margin-top:16px}
@media(min-width:640px){.ab-notes{grid-template-columns:repeat(3,minmax(0,1fr))}}
.ab-note{
  display:flex;flex-direction:column;gap:7px;border:1px solid var(--aix-line);border-radius:2px;
  background:var(--aix-grey);padding:14px;min-height:150px;
}
.ab-note.ink{background:#111214;color:#fff;border-color:#111214}
.ab-note.ink p{color:#cfcfcf;opacity:1}
.ab-note.lime{background:var(--aix-lime);color:#111214;border-color:transparent}
.ab-note .top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.ab-note h3{margin:0;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:800}
.ab-note .w{font-size:13px;font-weight:800}
.ab-note p{margin:0;font-size:11px;line-height:1.55;opacity:.75}

.aix-calc{margin-top:16px}
.aix-calc .rounded-2xl,.aix-calc .rounded-xl,.aix-calc .rounded-lg,.aix-calc .rounded-md,.aix-calc .rounded-full{border-radius:2px}
.aix-calc .bg-card{background:var(--aix-paper)}
.aix-calc .bg-muted{background:var(--aix-grey)}
.aix-calc .border-border{border-color:var(--aix-line)}
.aix-calc .text-foreground{color:var(--aix-ink)}
.aix-calc .text-muted-foreground{color:var(--aix-mute)}
.aix-calc .text-primary{color:var(--aix-ink)}
.aix-calc .bg-primary{background:#111214;color:var(--aix-lime)}
.aix-calc .text-primary-foreground{color:var(--aix-lime)}
.aix-calc .bg-primary\\/5{background:var(--aix-lime);color:#111214}
.aix-calc .bg-primary\\/10{background:var(--aix-grey)}
.aix-calc .border-primary\\/20{border-color:transparent}
.aix-calc .border-primary\\/30{border-color:var(--aix-line)}
.aix-calc .hover\\:border-primary\\/50:hover{border-color:var(--aix-ink)}
.aix-calc .hover\\:bg-primary\\/5:hover{background:var(--aix-grey)}
`;
