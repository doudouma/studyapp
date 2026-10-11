#!/usr/bin/env node
/*
 * itch.io 轻量版打包脚本
 * ─────────────────────────────────────────────────────────────
 * 从同一份引擎 (public/games/outbreak/) 生成一个自包含的静态目录，
 * 供 itch.io 以 HTML5 游戏上传（index.html 必须位于 zip 根目录）。
 *
 * 轻量版特性：
 *   - 无线上排行榜（不请求 /api/outbreak/rank，故无需 itch 端 CORS）
 *   - 内置 zh/en/es/pt/fr 五语言，按 navigator.languages 自动识别，
 *     并可用 ?lang=xx 覆盖（标题界面也提供下拉切换）
 *
 * 用法：node tools/build-itch-outbreak.mjs
 * 产物：dist-itch/outbreak/ 与 dist-itch/outbreak.zip
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/games/outbreak");
const THREE_SRC = path.join(ROOT, "public/games/delivery-rush/three.min.js");
const CSS_SRC = path.join(ROOT, "app/routes/outbreak.css");
const LOCALES = path.join(ROOT, "app/lib/locales");
const OUT = path.join(ROOT, "dist-itch/outbreak");
const ZIP = path.join(ROOT, "dist-itch/outbreak.zip");

/** 引擎通过 __(key, fallback) 消费的动态文案键（需注入为无前缀形式） */
const OD_KEYS = [
  "diff.easy.note", "diff.easy.sub",
  "diff.normal.note", "diff.normal.sub",
  "diff.hard.note", "diff.hard.sub",
  "diff.extreme.note", "diff.extreme.sub",
  "pkg.normal.name", "pkg.normal.tag", "pkg.normal.desc",
  "pkg.bulk.name", "pkg.bulk.tag", "pkg.bulk.desc",
  "style.easy.bname", "style.easy.kind",
  "style.normal.bname", "style.normal.kind",
  "style.hard.bname", "style.hard.kind",
  "style.extreme.bname", "style.extreme.kind",
  "truck.label",
  "msg.gameoverSub", "msg.timeupSub",
  "res.title",
  "diff.floors", "diff.cap",
  "item.syringe.name", "item.stick.name",
  "item.syringe.desc", "item.stick.desc", "item.title", "pkg.title",
  "msg.heal", "msg.gotItem", "msg.kill", "msg.stickCount",
];

/** HTML 外壳静态文案键（data-t 属性指向） */
const STATIC_KEYS = [
  "outbreak.heading",
  "outbreak.how.title", "outbreak.how.1", "outbreak.how.2", "outbreak.how.3",
  "od.hud.time", "od.hud.delivered", "od.hud.score", "od.hud.inf", "od.hud.cap", "od.hud.pauseAria",
  "od.game.start", "od.game.menuDiff", "od.game.menuHow", "od.game.back",
  "od.game.htabHow", "od.game.htabTypes", "od.game.resRank", "od.game.resAgain",
  "od.res.title", "od.res.delivered", "od.res.time", "od.res.combo", "od.res.peak",
];

const NEEDED = [...OD_KEYS.map((k) => `od.${k}`), ...STATIC_KEYS];
const LANGS = ["en", "zh", "es", "pt", "fr"];

/* ---- 1. 生成 i18n 词典 ---- */
const byLang = {};
for (const lang of LANGS) {
  const json = JSON.parse(fs.readFileSync(path.join(LOCALES, `${lang}.json`), "utf8"));
  const dict = {};
  for (const key of NEEDED) if (json[key] != null) dict[key] = json[key];
  const missing = NEEDED.filter((k) => dict[k] == null);
  if (missing.length) console.warn(`[warn] ${lang} 缺少文案：${missing.join(", ")}`);
  byLang[lang] = dict;
}

/* ---- 2. 抽取 .od-root 样式（丢弃站点页面级规则） ---- */
const cssRaw = fs.readFileSync(CSS_SRC, "utf8");
const cut = cssRaw.indexOf("/* 全屏态");
const odCss = cssRaw.slice(0, cut === -1 ? cssRaw.length : cut).trim();
const extraCss = `
html,body{margin:0;height:100%;background:#04070e;overflow:hidden}
#game{position:fixed;inset:0}
#game:fullscreen{width:100vw;height:100vh;border-radius:0;border:none}
#game:-webkit-full-screen{width:100vw;height:100vh;border-radius:0;border:none}
.od-root .langrow{display:flex;justify-content:center}
.od-root #langSel{font-family:var(--font-b);font-weight:700;color:var(--fg);background:var(--paper);border:2px solid var(--ink);box-shadow:0 3px 0 var(--ink);border-radius:10px;padding:5px 10px;font-size:13px;cursor:pointer}
`;
const styleCss = `${odCss}\n${extraCss}`;

/* ---- 3. 打补丁的引擎副本：音频路径改为模块相对路径 ---- */
let gameJs = fs.readFileSync(path.join(SRC, "game.js"), "utf8");
const audioOld = "new Audio('/games/outbreak/outbreak.mp3')";
if (!gameJs.includes(audioOld)) throw new Error("未找到音频路径，引擎可能已变更： " + audioOld);
gameJs = gameJs.replace(audioOld, "new Audio(new URL('outbreak.mp3', import.meta.url).href)");

/* ---- 4. index.html 外壳 ---- */
const bootScript = `(function(){
  var KEYS=${JSON.stringify(OD_KEYS)};
  var ALL=window.OD_I18N_BY_LANG||{};
  function pick(){
    var q=new URLSearchParams(location.search).get("lang");
    if(q&&ALL[q])return q;
    var ls=navigator.languages||[navigator.language||"en"];
    for(var i=0;i<ls.length;i++){
      var l=String(ls[i]).toLowerCase();
      for(var k in ALL){ if(l===k||l.indexOf(k+"-")===0) return k; }
    }
    return ALL.en?"en":(Object.keys(ALL)[0]||"en");
  }
  var lang=pick(), L=ALL[lang]||{};
  document.documentElement.lang=lang;
  var od={};
  for(var i=0;i<KEYS.length;i++){ var k=KEYS[i]; if(L["od."+k]!=null) od[k]=L["od."+k]; }
  window.OD_I18N=od;
  Array.prototype.forEach.call(document.querySelectorAll("[data-t]"),function(el){ var k=el.getAttribute("data-t"); if(L[k]!=null) el.textContent=L[k]; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-ta]"),function(el){ var k=el.getAttribute("data-ta"); if(L[k]!=null) el.setAttribute("aria-label",L[k]); });
  if(L["outbreak.heading"]) document.title=L["outbreak.heading"]+" — 100mini";
  var sel=document.getElementById("langSel");
  if(sel){ sel.value=lang; sel.addEventListener("change",function(){ var u=new URL(location.href); u.searchParams.set("lang",sel.value); location.href=u.href; }); }
  var s=document.createElement("script"); s.type="module"; s.src="game.js"; document.body.appendChild(s);
})();`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" />
<title>Outbreak Delivery</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=M+PLUS+Rounded+1c:wght@700;900&display=swap" crossorigin="anonymous" />
<link rel="stylesheet" href="style.css" />
</head>
<body>
<div class="od-root" id="game">
  <div id="od-app">
    <canvas id="gl" width="1440" height="900"></canvas>

    <div id="hud" hidden>
      <div id="top">
        <div class="pill" id="timePill"><small data-t="od.hud.time">TIME</small><b id="time">180</b></div>
        <div class="pill" id="countPill">
          <div class="col"><small data-t="od.hud.delivered">DELIVERED</small><b id="count">0</b></div>
          <div class="col"><small data-t="od.hud.score">SCORE</small><b id="score">0</b></div>
        </div>
        <div class="pill" id="infPill"><small data-t="od.hud.inf">INFECTION</small><div class="bar"><i id="infBar" class="lv1"></i></div><b id="infVal">0%</b></div>
        <button id="pauseBtn" data-ta="od.hud.pauseAria" aria-label="Pause"><i></i></button>
      </div>
      <div id="bottom">
        <div id="cabin">
          <div id="floorNow">1F</div>
          <div id="capBox"><small data-t="od.hud.cap">LOAD</small><span id="capText">0 / 6</span></div>
          <div id="itemHud" hidden></div>
        </div>
        <div id="btns">
          <button class="ctl" id="btnUp"><span class="ar">&#9650;</span></button>
          <button class="ctl" id="btnDown"><span class="ar">&#9660;</span></button>
        </div>
      </div>
      <canvas id="mini" hidden width="30" height="790"></canvas>
    </div>

    <div id="pops"></div>
    <div id="flash"></div>
    <div id="vign"></div>
    <div class="banner" id="banner"><div class="rays"></div><div><div class="bt"></div><div class="bs" style="text-align:center"></div></div></div>
    <div class="banner small" id="banner2"><div class="bt"></div></div>
    <div id="alert"></div>
    <div id="cd"></div>

    <div class="screen show" id="title">
      <div style="text-align:center"><div class="logo"><span class="l1" data-t="outbreak.heading">Outbreak Delivery</span></div></div>
      <div class="menu">
        <button class="btn primary" id="startBtn" data-t="od.game.start">START</button>
        <button class="btn" id="diffBtn"><span data-t="od.game.menuDiff">Difficulty</span> <small id="diffNow">NORMAL</small></button>
        <button class="btn" id="howBtn" data-t="od.game.menuHow">How to play</button>
        <div class="langrow"><select id="langSel" aria-label="Language">
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="es">Español</option>
          <option value="pt">Português</option>
          <option value="fr">Français</option>
        </select></div>
      </div>
    </div>

    <div class="screen dim" id="diffPanel">
      <div class="card">
        <h2 data-t="od.game.menuDiff">Difficulty</h2>
        <div class="diffs" id="diffs"></div>
        <button class="btn" data-close data-t="od.game.back">Back</button>
      </div>
    </div>

    <div class="screen dim" id="howPanel">
      <div class="card">
        <h2 data-t="outbreak.how.title">How to play</h2>
        <div class="tabs">
          <button class="htab sel" data-h="A" data-t="od.game.htabHow">How to play</button>
          <button class="htab" data-h="B" data-t="od.game.htabTypes">Packages</button>
        </div>
        <ul class="how" id="howA">
          <li data-t="outbreak.how.1"></li>
          <li data-t="outbreak.how.2"></li>
          <li data-t="outbreak.how.3"></li>
        </ul>
        <div class="types" id="typeList" hidden></div>
        <button class="btn" data-close data-t="od.game.back">Back</button>
      </div>
    </div>

    <div class="screen dim" id="result">
      <div class="card" id="resCard">
        <h2 id="resTitle" data-t="od.res.title">You turned</h2>
        <div class="rhero">
          <div><small data-t="od.res.delivered">Delivered</small><b id="rDel">0</b></div>
          <div class="rkbox"><small data-t="od.game.resRank">RANK</small><div id="rank">C</div></div>
        </div>
        <div class="rgrid">
          <div><small data-t="od.hud.score">SCORE</small><b id="rScore">0</b></div>
          <div><small data-t="od.res.time">Survived</small><b id="rTime">0</b></div>
          <div><small data-t="od.res.combo">Max combo</small><b id="rCombo">0</b></div>
          <div><small data-t="od.res.peak">Peak infection</small><b id="rPeak">0</b></div>
        </div>
        <div class="row"><button class="btn" id="againBtn" data-t="od.game.resAgain">Play again</button></div>
      </div>
    </div>
  </div>
</div>

<script>window.OD_I18N_BY_LANG=${JSON.stringify(byLang)};</script>
<script src="three.min.js"></script>
<script>${bootScript}</script>
</body>
</html>
`;

/* ---- 5. 写出产物 ---- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "style.css"), styleCss);
fs.writeFileSync(path.join(OUT, "game.js"), gameJs);
fs.copyFileSync(path.join(SRC, "rules.js"), path.join(OUT, "rules.js"));
fs.copyFileSync(THREE_SRC, path.join(OUT, "three.min.js"));
fs.copyFileSync(path.join(SRC, "outbreak.mp3"), path.join(OUT, "outbreak.mp3"));

/* ---- 6. 打 zip（index.html 位于根目录） ---- */
fs.rmSync(ZIP, { force: true });
execSync("zip -r -q ../outbreak.zip .", { cwd: OUT });

const size = (p) => (fs.statSync(p).size / 1024).toFixed(0) + " KB";
console.log("[build-itch-outbreak] 完成");
console.log("  目录:", path.relative(ROOT, OUT));
console.log("  zip :", path.relative(ROOT, ZIP), `(${size(ZIP)})`);
console.log("  语言:", LANGS.join(", "));
