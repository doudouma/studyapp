import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchOutbreakRank, submitOutbreakScore } from "~/features/outbreak/api";
import type { OutbreakRankEntry, OutbreakRankGetResponse } from "@shared/types/outbreak";

/**
 * Outbreak Delivery — 自 delivery-rush 派生的 3D 电梯生存游戏。
 * 引擎位于 public/games/outbreak/（ES module，顶部 import ./rules.js），
 * three.min.js 由宿主先以传统 <script> 加载，引擎通过全局 THREE 使用。
 *
 * 本组件职责（镜像 DeliveryRushGame）：
 * 1. 渲染引擎依赖的 HUD / 各屏 DOM（ID 与引擎一一对应，含感染条 #infBar / #infVal）；
 * 2. 加载前注入 window.OD_I18N 词典（随站点语言切换）；
 * 3. 按序异步加载 three.min.js → game.js，卸载时调用 window.__od.destroy()；
 * 4. 排行榜：接管引擎派发的 od:result / od:openrank 事件，走 Hono RPC 客户端。
 */
declare global {
  interface Window {
    OD_I18N?: Record<string, string>;
    __od?: { destroy?: () => void; destroyed?: boolean };
  }
}

/** game.js 内通过 __(key, fallback) 消费的动态文案键（注入为 od.<key>） */
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
] as const;

/** od:result 事件 detail（引擎 lastRes） */
interface OdResultDetail {
  score: number;
  delivered: number;
  time: number;
}

const RANKED_DIFFS = ["normal", "hard", "extreme"];

/** 读取/生成匿名设备标识（排行榜身份），localStorage 不可用时返回 null */
function getOdPlayerKey(): string | null {
  try {
    let key = localStorage.getItem("od_key");
    if (!key) {
      key = crypto.randomUUID
        ? crypto.randomUUID()
        : "k" + Date.now() + "-" + Math.random().toString(36).slice(2);
      localStorage.setItem("od_key", key);
    }
    return key;
  } catch {
    return null;
  }
}

/** 加载传统脚本或 ES module，返回 Promise；注入的 <script> 收集到 out 以便卸载时移除 */
function loadScript(src: string, out: HTMLScriptElement[], asModule = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    if (asModule) s.type = "module";
    else s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
    out.push(s);
  });
}

/** 切换 .screen.show（与引擎 show() 行为一致，仅用于外壳接管 #rankPanel） */
function showScreen(id: string): void {
  const app = document.getElementById("od-app");
  if (!app) return;
  app.querySelectorAll<HTMLElement>(".screen").forEach((s) => {
    s.classList.toggle("show", s.id === id);
  });
}

export default function OutbreakGame({
  canvasRef,
}: {
  /** 把游戏 WebGL canvas 暴露给宿主（用于分享截图） */
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const bootedRef = useRef(false);
  const lastResRef = useRef<OdResultDetail | null>(null);
  const rankFromRef = useRef("title");
  const submittedRef = useRef(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    // game.js 在模块求值时读取 DIFFS/PKG/STYLES 文案，必须先注入词典
    const dict: Record<string, string> = {};
    for (const k of OD_KEYS) dict[k] = t(`od.${k}`);
    window.OD_I18N = dict;

    const renderRank = (
      data: OutbreakRankGetResponse,
      list: HTMLElement | null,
      myTxt: HTMLElement | null,
    ) => {
      if (myTxt) {
        myTxt.textContent = data.mine
          ? `${t("od.rank.myPos")}#${data.mine.rank} · ${data.mine.score.toLocaleString()}`
          : t("od.rank.unregistered");
      }
      if (!list) return;
      list.textContent = "";
      if (!data.top || data.top.length === 0) {
        const empty = document.createElement("div");
        empty.className = "rmsg";
        empty.textContent = t("od.rank.empty");
        list.appendChild(empty);
        return;
      }
      data.top.forEach((row: OutbreakRankEntry, i: number) => {
        const el = document.createElement("div");
        el.className = "rrow" + (i < 3 ? ` t${i + 1}` : "") + (row.me ? " me" : "");
        const rk = document.createElement("div");
        rk.className = "rk";
        rk.textContent = String(i + 1);
        const nm = document.createElement("div");
        nm.className = "nm";
        nm.textContent = row.name;
        const sc = document.createElement("div");
        sc.className = "sc";
        sc.textContent = row.score.toLocaleString();
        el.appendChild(rk);
        el.appendChild(nm);
        el.appendChild(sc);
        list.appendChild(el);
      });
    };

    const openRank = async () => {
      const list = document.getElementById("rlist");
      const myTxt = document.getElementById("myTxt");
      if (myTxt) myTxt.textContent = t("od.rank.loading");
      if (list) {
        list.textContent = "";
        const loading = document.createElement("div");
        loading.className = "rmsg";
        loading.textContent = t("od.rank.loading");
        list.appendChild(loading);
      }
      try {
        const data = await fetchOutbreakRank(getOdPlayerKey());
        renderRank(data, list, myTxt);
      } catch {
        if (myTxt) myTxt.textContent = t("od.rank.fail");
        if (list) {
          list.textContent = "";
          const err = document.createElement("div");
          err.className = "rmsg";
          err.textContent = t("od.rank.fail");
          list.appendChild(err);
        }
      }
    };

    const onResult = (e: Event) => {
      const d = (e as CustomEvent<OdResultDetail>).detail;
      if (!d) return;
      lastResRef.current = d;
      submittedRef.current = false;
      submittingRef.current = false;

      const nk = document.getElementById("nick") as HTMLInputElement | null;
      if (nk && !nk.value) {
        try {
          nk.value = localStorage.getItem("od_nick") || "";
        } catch {
          /* noop */
        }
      }
      const regBtn = document.getElementById("regBtn") as HTMLButtonElement | null;
      if (regBtn) regBtn.disabled = false;

      // #regBox 可见性镜像引擎逻辑（仅排行难度且 score>0），避免外壳误开
      const rb = document.getElementById("regBox");
      if (rb) {
        let ranked = true;
        try {
          const k = localStorage.getItem("od_diff");
          ranked = !!k && RANKED_DIFFS.includes(k);
        } catch {
          /* noop */
        }
        rb.hidden = !(ranked && d.score > 0);
      }
    };

    const onOpenRank = () => {
      const app = document.getElementById("od-app");
      rankFromRef.current = app?.querySelector<HTMLElement>(".screen.show")?.id || "title";
      showScreen("rankPanel");
      void openRank();
    };

    const onRegBtn = async () => {
      if (submittingRef.current || submittedRef.current) return;
      const d = lastResRef.current;
      if (!d) return;
      const msg = document.getElementById("regMsg");
      const btn = document.getElementById("regBtn") as HTMLButtonElement | null;
      const key = getOdPlayerKey();
      if (!key) {
        if (msg) msg.textContent = t("od.rank.fail");
        return;
      }
      const nk = document.getElementById("nick") as HTMLInputElement | null;
      const name = (nk?.value || "").trim().slice(0, 10) || t("od.rank.defaultName");
      try {
        localStorage.setItem("od_nick", name);
      } catch {
        /* noop */
      }
      submittingRef.current = true;
      if (btn) btn.disabled = true;
      if (msg) msg.textContent = t("od.rank.loading");
      try {
        const res = await submitOutbreakScore(key, {
          name,
          score: d.score,
          delivered: d.delivered,
          time: d.time,
        });
        submittedRef.current = true;
        if (msg) msg.textContent = res.updated ? t("od.rank.saved") : t("od.rank.notUpdated");
      } catch {
        if (btn) btn.disabled = false;
        if (msg) msg.textContent = t("od.rank.fail");
      } finally {
        submittingRef.current = false;
      }
    };

    const onRankBack = () => showScreen(rankFromRef.current || "title");

    window.addEventListener("od:result", onResult);
    window.addEventListener("od:openrank", onOpenRank);
    const regBtnEl = document.getElementById("regBtn");
    const rankBackEl = document.getElementById("rankBack");
    regBtnEl?.addEventListener("click", onRegBtn);
    rankBackEl?.addEventListener("click", onRankBack);

    let alive = true;
    const scripts: HTMLScriptElement[] = [];
    (async () => {
      try {
        if (!document.getElementById("od-app")) return;
        if (!(window as unknown as { THREE?: unknown }).THREE) {
          await loadScript("/games/delivery-rush/three.min.js", scripts);
        }
        if (!alive) return;
        await loadScript("/games/outbreak/game.js", scripts, true);
      } catch {
        if (alive) setFailed(true);
      }
    })();

    return () => {
      alive = false;
      window.removeEventListener("od:result", onResult);
      window.removeEventListener("od:openrank", onOpenRank);
      regBtnEl?.removeEventListener("click", onRegBtn);
      rankBackEl?.removeEventListener("click", onRankBack);
      window.__od?.destroy?.();
      scripts.forEach((s) => s.remove());
    };
    // 切换语言 = 整页导航（LangSwitcher），游戏每次页面加载只启动一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="od-root h-full w-full" style={{ touchAction: "pan-y" }}>
      <div id="od-app">
        <canvas id="gl" width={1440} height={900} ref={canvasRef} />

        <div id="hud" hidden>
          <div id="top">
            <div className="pill" id="timePill">
              <small>{t("od.hud.time")}</small>
              <b id="time">180</b>
            </div>
            <div className="pill" id="countPill">
              <div className="col">
                <small>{t("od.hud.delivered")}</small>
                <b id="count">0</b>
              </div>
              <div className="col">
                <small>{t("od.hud.score")}</small>
                <b id="score">0</b>
              </div>
            </div>
            <div className="pill" id="infPill">
              <small>{t("od.hud.inf")}</small>
              <div className="bar">
                <i id="infBar" className="lv1" />
              </div>
              <b id="infVal">0%</b>
            </div>
            <button id="pauseBtn" aria-label={t("od.hud.pauseAria")}>
              <i />
            </button>
          </div>
          <div id="bottom">
            <div id="cabin">
              <div id="floorNow">1F</div>
              <div id="capBox">
                <small>{t("od.hud.cap")}</small>
                <span id="capText">0 / 6</span>
              </div>
            </div>
            <div id="btns">
              <button className="ctl" id="btnUp">
                <span className="ar">▲</span>
              </button>
              <button className="ctl" id="btnDown">
                <span className="ar">▼</span>
              </button>
            </div>
          </div>
          <canvas id="mini" hidden width={30} height={790} style={{ height: 790 }} />
        </div>

        <div id="pops" />
        <div id="flash" />
        <div id="vign" />
        <div className="banner" id="banner">
          <div className="rays" />
          <div>
            <div className="bt" />
            <div className="bs" style={{ textAlign: "center" }} />
          </div>
        </div>
        <div className="banner small" id="banner2">
          <div className="bt" />
        </div>
        <div id="alert" />
        <div id="cd" />

        <div className="screen show" id="title">
          <div style={{ textAlign: "center" }}>
            <div className="logo">
              <span className="l1">{t("outbreak.heading")}</span>
            </div>
          </div>
          <div className="menu">
            <button className="btn primary" id="startBtn">{t("od.game.start")}</button>
            <button className="btn" id="diffBtn">
              {t("od.game.menuDiff")} <small id="diffNow">NORMAL</small>
            </button>
            <button className="btn" id="rankBtn">{t("od.game.menuRank")}</button>
            <button className="btn" id="howBtn">{t("od.game.menuHow")}</button>
          </div>
        </div>

        <div className="screen dim" id="diffPanel">
          <div className="card">
            <h2>{t("od.game.menuDiff")}</h2>
            <div className="diffs" id="diffs" />
            <button className="btn" data-close="">{t("od.game.back")}</button>
          </div>
        </div>

        <div className="screen dim" id="howPanel">
          <div className="card">
            <h2>{t("outbreak.how.title")}</h2>
            <div className="tabs">
              <button className="htab sel" data-h="A">{t("od.game.htabHow")}</button>
              <button className="htab" data-h="B">{t("od.game.htabTypes")}</button>
            </div>
            <ul className="how" id="howA">
              <li>{t("outbreak.how.1")}</li>
              <li>{t("outbreak.how.2")}</li>
              <li>{t("outbreak.how.3")}</li>
            </ul>
            <div className="types" id="typeList" hidden />
            <button className="btn" data-close="">{t("od.game.back")}</button>
          </div>
        </div>

        <div className="screen dim" id="rankPanel">
          <div className="card">
            <h2>{t("od.game.rankTitle")}</h2>
            <div id="myPos">
              <span id="myTxt" />
            </div>
            <div id="rlist" />
            <button className="btn" id="rankBack">{t("od.game.back")}</button>
          </div>
        </div>

        <div className="screen dim" id="result">
          <div className="card" id="resCard">
            <h2 id="resTitle">{t("od.res.title")}</h2>
            <div className="rhero">
              <div>
                <small>{t("od.res.delivered")}</small>
                <b id="rDel">0</b>
              </div>
              <div className="rkbox">
                <small>{t("od.game.resRank")}</small>
                <div id="rank">C</div>
              </div>
            </div>
            <div className="rgrid">
              <div>
                <small>{t("od.hud.score")}</small>
                <b id="rScore">0</b>
              </div>
              <div>
                <small>{t("od.res.time")}</small>
                <b id="rTime">0</b>
              </div>
              <div>
                <small>{t("od.res.combo")}</small>
                <b id="rCombo">0</b>
              </div>
              <div>
                <small>{t("od.res.peak")}</small>
                <b id="rPeak">0</b>
              </div>
            </div>
            <div id="regBox" hidden>
              <div className="regrow">
                <input
                  id="nick"
                  maxLength={10}
                  placeholder={t("od.game.nickPh")}
                  autoComplete="off"
                  aria-label={t("od.game.nickAria")}
                />
                <button className="btn" id="regBtn">{t("od.game.resRegister")}</button>
              </div>
              <div id="regMsg" />
            </div>
            <div className="row">
              <button className="btn" id="againBtn">{t("od.game.resAgain")}</button>
            </div>
          </div>
        </div>

        {failed && (
          <div className="screen show" style={{ background: "var(--paper)", zIndex: 10 }}>
            <p style={{ color: "var(--ink)" }}>{t("od.loadError")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
