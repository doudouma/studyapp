import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { decodeArt, SHARE_QUERY, type Artwork } from "./codec";
import { makePaper, drawFlower } from "./PaperCutApp";

export function PaperCutView() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [art, setArt] = useState<Artwork | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get(SHARE_QUERY);
    if (!d) {
      setStatus("empty");
      return;
    }
    let cancelled = false;
    decodeArt(d).then((a) => {
      if (cancelled) return;
      if (a && a.cuts.length) {
        setArt(a);
        setStatus("ok");
      } else {
        setStatus("empty");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !art) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const wrap = canvas.parentElement;
    const size = Math.max(220, Math.min(wrap ? wrap.clientWidth : 320, 420));
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    const P = makePaper(art.folds, art.cuts, size, dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFlower(ctx, canvas.width, P, 1, 0, 1);
  }, [art]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(180deg,#fdf8f0 0%,#fbeeda 46%,#f7dbbe 100%)" }}
    >
      {status === "loading" && (
        <div className="size-8 rounded-full border-2 border-[#d6472e]/30 border-t-[#d6472e] animate-spin" />
      )}

      {status === "ok" && art && (
        <div className="w-full max-w-[440px] flex flex-col items-center text-center">
          <h1
            className="text-[26px] font-semibold tracking-[0.28em] text-[#7a2418]"
            style={{ fontFamily: "var(--serif)" }}
          >
            {t("papercut.view.title")}
          </h1>
          <div className="mt-6 w-full flex justify-center rounded-[28px] bg-white/50 p-4 shadow-[0_18px_50px_rgba(200,120,70,0.15)]">
            <canvas ref={canvasRef} className="block" />
          </div>
          <p className="mt-6 max-w-[320px] text-[13.5px] leading-[1.7] text-[#8d7a6a]">
            {t("papercut.view.desc")}
          </p>
          <Link
            to="/papercut"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#f29a5f] to-[#d6472e] px-9 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(214,71,46,0.35)] transition-transform active:scale-95"
          >
            {t("papercut.view.cta")}
          </Link>
        </div>
      )}

      {status === "empty" && (
        <div className="w-full max-w-[380px] flex flex-col items-center text-center">
          <div className="text-[44px]">✂️</div>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#7a2418]">
            {t("papercut.view.invalid")}
          </p>
          <Link
            to="/papercut"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#f29a5f] to-[#d6472e] px-9 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(214,71,46,0.35)] transition-transform active:scale-95"
          >
            {t("papercut.view.cta")}
          </Link>
        </div>
      )}
    </div>
  );
}
