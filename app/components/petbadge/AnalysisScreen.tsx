import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";

export function AnalysisScreen({ avatar, onDone }: { avatar: string; onDone: () => void }) {
  const { t } = useTranslation();
  const [pct, setPct] = useState(0);
  const [factIdx, setFactIdx] = useState(0);
  const [stampShow, setStampShow] = useState(false);
  const rafRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const t0 = performance.now();
    const DUR = 4200;
    setPct(0);
    setStampShow(false);
    setFactIdx(0);

    intervalRef.current = setInterval(() => {
      setFactIdx((i) => (i + 1) % 7);
    }, 1350);

    const step = (now: number) => {
      let p = Math.min(1, (now - t0) / DUR);
      p = 1 - Math.pow(1 - p, 2.2);
      setPct(Math.floor(p * 100));
      if (p > 0.52) setStampShow(true);
      if (p >= 1) {
        clearInterval(intervalRef.current);
        setTimeout(onDone, 450);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(intervalRef.current);
    };
  }, [onDone]);

  return (
    <div className="flex flex-col items-center pt-[12vh]">
      <Badge variant="secondary" className="border border-[rgba(226,120,60,.28)] bg-[rgba(255,255,255,.8)] px-[22px] py-[10px] text-[13.5px] text-[#D95B2B] shadow-[0_8px_18px_-12px_rgba(220,120,60,.45)] uppercase font-bold tracking-[.22em]">
        {t("petbadge.analysis.pill")}
      </Badge>
      <div className="relative mt-[30px] w-[min(360px,100%)] rounded-[24px]">
        <img src={avatar} alt="Pet photo" className="w-full aspect-[16/10.5] object-cover rounded-[24px] block shadow-[0_24px_50px_-22px_rgba(160,95,45,.5)]" />
        <div
          className="absolute left-0 right-0 h-[64px] top-[-64px] pointer-events-none rounded-[24px] border-b-2 border-[rgba(255,80,40,.9)]"
          style={{
            background: "linear-gradient(180deg,rgba(255,120,70,0),rgba(255,110,60,.28) 70%,rgba(255,90,50,.75))",
            filter: "blur(.4px)",
            animation: "petbadge-scan 2.1s ease-in-out infinite alternate",
          }}
        />
        <span className="absolute left-[38%] top-[34%] text-[30px] opacity-55 -rotate-[16deg]" style={{ animation: "petbadge-pawpulse 1.6s ease-in-out infinite" }}>🐾</span>
        <span className="absolute left-[50%] top-[52%] text-[30px] opacity-55 rotate-[10deg]" style={{ animation: "petbadge-pawpulse 1.6s ease-in-out infinite .4s" }}>🐾</span>
        <div
          className={`absolute right-[-26px] bottom-[-38px] w-[118px] h-[118px] text-[#98A4AE] transition-all duration-[.45s] ease-[cubic-bezier(.2,.8,.3,1.2)] ${
            stampShow ? "opacity-100 scale-100 -rotate-[10deg]" : "opacity-0 scale-150 -rotate-[24deg]"
          }`}
          style={{ filter: "drop-shadow(0 8px 14px rgba(90,100,110,.3))" }}
        >
          <svg viewBox="0 0 120 120" className="w-full h-full" style={{ animation: "petbadge-spin 24s linear infinite" }}>
            <defs><path id="cir" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>
            <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2.6"/>
            <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".75"/>
            <text fontSize="10" letterSpacing="2.2" fontWeight="700" fill="currentColor"><textPath href="#cir">OFFICIAL PET IDENTITY ✦ PAW &amp; CLAW ✦ </textPath></text>
            <text x="60" y="55" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">PET ID</text>
            <text x="60" y="72" textAnchor="middle" fontSize="16" fontWeight="900" fill="currentColor">CRY</text>
            <text x="60" y="85" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">2026</text>
          </svg>
        </div>
      </div>
      <h2 className="mt-[56px] text-[23px] font-black text-[#333F4A]">{t("petbadge.analysis.title")}</h2>
      <p className="mt-[22px] text-[16px] text-[#7E8B96]">{t("petbadge.analysis.sub")}</p>
      <div className="mt-[26px] w-[min(360px,100%)] h-[14px] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(150,100,60,.12)] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#F4562C] to-[#FF9D4D] transition-[width] duration-[.12s] linear" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-[14px] text-[24px] font-black text-[#E8542E]">{pct}%</div>
      <p className="mt-[26px] w-[min(360px,100%)] text-[15.5px] leading-[1.8] text-[#5D6D7A] min-h-[3.6em]">{t(`petbadge.fact.${factIdx}`)}</p>
    </div>
  );
}
