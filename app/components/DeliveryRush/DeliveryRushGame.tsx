import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Delivery Rush — 自 template/deploy-delivery-rush 移植的 3D 电梯配送游戏。
 * 保留原 game.js（public/games/delivery-rush/），本组件只负责：
 * 1. 渲染 game.js 依赖的 HUD DOM（ID 与原版一一对应）
 * 2. 加载前注入 window.DR_I18N 词典（随站点语言切换）
 * 3. 按序异步加载 three.min.js → game.js，卸载时调用 window.__dr.destroy()
 */
declare global {
  interface Window {
    DR_I18N?: Record<string, string>;
    __dr?: { destroy: () => void; destroyed?: boolean };
  }
}

/** game.js 内通过 __(key, fallback) 消费的动态文案键 */
const DR_KEYS = [
  "diff.easy.note", "diff.easy.sub",
  "diff.normal.note", "diff.normal.sub",
  "diff.hard.note", "diff.hard.sub",
  "diff.extreme.note", "diff.extreme.sub",
  "type.normal.name", "type.normal.tag", "type.normal.desc",
  "type.impatient.name", "type.impatient.tag", "type.impatient.desc",
  "type.bulk.name", "type.bulk.tag", "type.bulk.desc",
  "type.cart.name", "type.cart.tag", "type.cart.desc",
  "type.timed.name", "type.timed.tag", "type.timed.desc",
  "type.express.name", "type.express.tag", "type.express.desc",
  "type.ret.name", "type.ret.tag", "type.ret.desc",
  "style.easy.bname", "style.easy.kind",
  "style.normal.bname", "style.normal.kind",
  "style.hard.bname", "style.hard.kind",
  "style.extreme.bname", "style.extreme.kind",
  "msg.express", "msg.ret", "msg.comboHeal", "msg.comboGod", "msg.comboGood",
  "msg.bonus", "msg.missRet", "msg.miss", "msg.hot", "msg.group",
  "msg.gameoverSub", "msg.timeupSub",
  "hud.misses",
  "res.title", "res.titleOver", "res.diff", "res.newBest", "res.best",
  "rank.canRegister", "rank.noStorage", "rank.defaultName", "rank.unregistered",
  "rank.beyond", "rank.rankN", "rank.you", "rank.loading", "rank.myPosDash",
  "rank.myPos", "rank.points", "rank.outOfTop", "rank.invite", "rank.empty",
  "rank.statLine", "rank.unavailable", "rank.loadError", "rank.saving",
  "rank.saved", "rank.notUpdated", "rank.nowPos", "rank.invalid", "rank.fail",
  "rank.youTag",
  "pause.soundOn", "pause.soundOff",
  "diff.floors", "diff.cap",
  "sep.wsp",
  "truck.label",
] as const;

const HOW_KEYS = ["how.1", "how.2", "how.3", "how.4", "how.5", "how.6", "how.7"] as const;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function DeliveryRushGame() {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    // game.js 在 IIFE 求值时读取 DIFFS/TYPES/STYLES 文案，必须先注入词典
    const dict: Record<string, string> = {};
    for (const k of DR_KEYS) dict[k] = t(`dr.${k}`);
    window.DR_I18N = dict;

    let alive = true;
    (async () => {
      try {
        if (!document.getElementById("dr-app")) return;
        await loadScript("/games/delivery-rush/three.min.js");
        if (!alive) return;
        await loadScript("/games/delivery-rush/game.js");
      } catch {
        if (alive) setFailed(true);
      }
    })();

    return () => {
      alive = false;
      window.__dr?.destroy();
    };
    // 切换语言 = 整页导航（LangSwitcher），游戏每次页面加载只启动一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const howHtml = (k: string) => ({ __html: t(`dr.${k}`) });

  return (
    <div className="dr-root h-full w-full" style={{ touchAction: "pan-y" }}>
      <div id="dr-app">
        <canvas id="gl" width={1440} height={900} />

        <div id="hud" hidden>
          <div id="top">
            <div className="pill" id="timePill">
              <small>{t("deliveryrush.hud.time")}</small>
              <b id="time">90</b>
            </div>
            <div className="pill" id="countPill">
              <div className="col">
                <small>{t("deliveryrush.hud.delivered")}</small>
                <b id="count" data-unit={t("deliveryrush.hud.unitPeople")}>0</b>
              </div>
              <div className="col">
                <small>SCORE</small>
                <b id="score">0</b>
              </div>
            </div>
            <button id="pauseBtn" aria-label={t("deliveryrush.hud.pauseAria")}>
              <i />
            </button>
          </div>
          <div id="row2">
            <div id="misses">
              <b style={{ marginRight: 3 }}>{t("dr.hud.misses")}</b>
              <span /><span /><span /><span /><span /><span />
            </div>
            <div id="comboWrap" hidden>
              <div id="combo">2 COMBO</div>
              <div id="comboBar"><i /></div>
            </div>
          </div>
          <div id="hot" hidden />
          <canvas id="mini" hidden width={30} height={790} style={{ height: 790 }} />
          <div id="bottom">
            <div id="cabin">
              <div id="floorNow">1F</div>
              <div id="capBox">
                <small>{t("deliveryrush.hud.board")}</small>
                <span id="capText">0 / 6</span>
              </div>
              <div id="chips" />
            </div>
            <div id="btns">
              <button className="ctl" id="btnUp">
                <span className="ar">▲</span>
                {t("deliveryrush.hud.up")}
              </button>
              <button className="ctl" id="btnDown">
                <span className="ar">▼</span>
                {t("deliveryrush.hud.down")}
              </button>
            </div>
          </div>
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
              <span className="l1">{t("deliveryrush.game.logo1")}</span>
              <span className="l2">
                {t("deliveryrush.game.logo2pre")}
                <em>{t("deliveryrush.game.logo2em")}</em>
              </span>
            </div>
            <div className="tag">{t("deliveryrush.game.tag")}</div>
          </div>
          <div className="menu">
            <button className="btn primary" id="startBtn">START</button>
            <button className="btn" id="diffBtn">
              {t("deliveryrush.game.menuDiff")} <small id="diffNow">NORMAL</small>
            </button>
            <button className="btn" id="rankBtn">{t("deliveryrush.game.menuRank")}</button>
            <button className="btn" id="howBtn">{t("deliveryrush.game.menuHow")}</button>
          </div>
        </div>

        <div className="screen dim" id="diffPanel">
          <div className="card">
            <h2>{t("deliveryrush.game.menuDiff")}</h2>
            <div className="diffs" id="diffs" />
            <button className="btn" data-close="">{t("deliveryrush.game.back")}</button>
          </div>
        </div>

        <div className="screen dim" id="howPanel">
          <div className="card">
            <h2>{t("deliveryrush.game.menuHow")}</h2>
            <div className="tabs">
              <button className="htab sel" data-h="A">{t("deliveryrush.game.htabHow")}</button>
              <button className="htab" data-h="B">{t("deliveryrush.game.htabTypes")}</button>
            </div>
            <ul className="how" id="howA">
              {HOW_KEYS.map((k) => (
                <li key={k} dangerouslySetInnerHTML={howHtml(k)} />
              ))}
            </ul>
            <div className="types" id="typeList" hidden />
            <button className="btn" data-close="">{t("deliveryrush.game.back")}</button>
          </div>
        </div>

        <div className="screen dim" id="rankPanel">
          <div className="card">
            <h2>{t("deliveryrush.game.rankTitle")}</h2>
            <div className="tabs t3">
              <button className="tab" data-k="normal">NORMAL<small /></button>
              <button className="tab" data-k="hard">HARD<small /></button>
              <button className="tab" data-k="extreme">EXTREME<small /></button>
            </div>
            <div id="myPos">
              <span id="myTxt" />
              <button id="myJump" hidden>{t("deliveryrush.game.rankJump")}</button>
            </div>
            <div id="rlist" />
            <button className="btn" id="rankBack">{t("deliveryrush.game.back")}</button>
          </div>
        </div>

        <div className="screen dim" id="pausePanel">
          <div className="card">
            <h2>{t("deliveryrush.game.pauseTitle")}</h2>
            <button className="btn primary" id="resumeBtn" style={{ animation: "none", fontSize: 24 }}>
              {t("deliveryrush.game.pauseResume")}
            </button>
            <button className="btn" id="retryBtn">{t("deliveryrush.game.pauseRetry")}</button>
            <button className="btn" id="soundBtn">{t("dr.pause.soundOn")}</button>
            <button className="btn" id="quitBtn">{t("deliveryrush.game.pauseQuit")}</button>
          </div>
        </div>

        <div className="screen dim" id="result">
          <div className="card" id="resCard">
            <div className="rhead">
              <span className="rlogo">{t("deliveryrush.game.brand")}</span>
              <span className="rdiff" id="resDiff">HARD</span>
            </div>
            <h2 id="resTitle">{t("dr.res.title")}</h2>
            <div className="rhero">
              <div>
                <small>{t("deliveryrush.hud.delivered")}</small>
                <b>
                  <span id="rDel">0</span>
                  <i>{t("deliveryrush.game.resUnit")}</i>
                </b>
              </div>
              <div className="rkbox">
                <small>{t("deliveryrush.game.resRank")}</small>
                <div id="rank">S</div>
              </div>
            </div>
            <div className="rgrid">
              <div>
                <small>SCORE</small>
                <b id="rScore">0</b>
              </div>
              <div>
                <small>{t("deliveryrush.game.resMaxCombo")}</small>
                <b>
                  <span id="rCombo">0</span>
                  <i>{t("deliveryrush.game.resComboUnit")}</i>
                </b>
              </div>
              <div>
                <small>{t("dr.hud.misses")}</small>
                <b>
                  <span id="rMiss">0</span>
                  <i>{t("deliveryrush.game.resUnit")}</i>
                </b>
              </div>
              <div>
                <small>{t("deliveryrush.game.resEff")}</small>
                <b>
                  <span id="rEff">0</span>
                  <i>%</i>
                </b>
              </div>
            </div>
            <div id="resSub" />
            <div id="regBox" hidden>
              <div className="regrow">
                <input
                  id="nick"
                  maxLength={10}
                  placeholder={t("deliveryrush.game.nickPh")}
                  autoComplete="off"
                  aria-label={t("deliveryrush.game.nickAria")}
                />
                <button className="btn" id="regBtn">{t("deliveryrush.game.resRegister")}</button>
              </div>
              <div id="regMsg" />
            </div>
            <div className="row">
              <button className="btn" id="againBtn" style={{ background: "var(--orange)", color: "#fff" }}>
                {t("deliveryrush.game.resAgain")}
              </button>
              <button className="btn" id="toTitleBtn">{t("deliveryrush.game.pauseQuit")}</button>
            </div>
            <button className="btn" id="resRankBtn">{t("deliveryrush.game.menuRank")}</button>
          </div>
        </div>

        {failed && (
          <div className="screen show" style={{ background: "var(--paper)", zIndex: 10 }}>
            <p style={{ color: "var(--ink)" }}>{t("deliveryrush.loadError")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
