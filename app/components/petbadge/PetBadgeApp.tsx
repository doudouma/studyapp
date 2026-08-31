import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

type Screen = "landing" | "upload" | "crop" | "analysis" | "register" | "badge";
type Theme = "ins" | "cute" | "y2k" | "cyber" | "biz" | "hk";

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rnd = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

/* ==================== SVG Helpers ==================== */

function RadarSVG({ vals, labels }: { vals: number[]; labels: string[] }) {
  const W = 340, H = 270, cx = W / 2, cy = 135, R = 66, n = 6;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const poly = (r: number) =>
    Array.from({ length: n }, (_, i) => pt(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Radar Chart" style="width:100%;height:auto;overflow:visible">`;
  [1, 0.66, 0.33].forEach((f) => {
    svg += `<polygon points="${poly(R * f)}" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1"/>`;
  });
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, R);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="currentColor" stroke-opacity="0.3" stroke-width="1"/>`;
  }
  svg += `<polygon points="${vals.map((v, i) => pt(i, (R * v) / 100).map((x) => x.toFixed(1)).join(",")).join(" ")}" fill="currentColor" fill-opacity="0.13" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`;
  vals.forEach((v, i) => {
    const [x, y] = pt(i, (R * v) / 100);
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="currentColor"/>`;
  });
  const LABEL_R = R + 20;
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, LABEL_R);
    let anchor = "middle";
    let lx = x;
    let ly = y;
    if (i === 0) { ly += 4; }
    else if (i === 1) { anchor = "start"; lx += 2; ly += 4; }
    else if (i === 2) { anchor = "start"; lx += 2; ly += 4; }
    else if (i === 3) { ly += 2; }
    else if (i === 4) { anchor = "end"; lx -= 2; ly += 4; }
    else { anchor = "end"; lx -= 2; ly += 4; }
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="currentColor">${labels[i]}</text>`;
  }
  return svg + "</svg>";
}

function BarcodeSVG({ seed }: { seed: string }) {
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const r = () => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    return h / 4294967295;
  };
  let x = 0;
  const bars: string[] = [];
  while (x < 296) {
    const w = [1.5, 1.5, 2, 2, 3, 4][Math.floor(r() * 6)];
    if (r() > 0.42) bars.push(`<rect x="${x.toFixed(1)}" y="0" width="${w}" height="34"/>`);
    x += w + (r() > 0.5 ? 1.5 : 2.5);
  }
  return `<svg viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden="true">${bars.join("")}</svg>`;
}

/* ==================== Clip Component ==================== */

function BadgeClip() {
  return (
    <div className="relative z-[3] flex h-[72px] flex-col items-center pointer-events-none">
      <div className="w-[42px] h-[52px] rounded-t-xl rounded-b-[7px] bg-gradient-to-b from-[#D47A2E] to-[#B8652A] shadow-[inset_0_2px_2px_rgba(255,255,255,.28),0_6px_10px_-6px_rgba(180,100,42,.5)]" />
      <div className="w-[76px] h-[15px] -mt-[3px] bg-gradient-to-b from-[#FFF0E0] to-[#F0C9A0] rounded-[8px] shadow-[0_3px_5px_rgba(180,100,42,.25)]" />
      <div className="w-[88px] h-[10px] mt-[1px] bg-[#D47A2E] rounded-[6px]" />
    </div>
  );
}

/* ==================== Landing Screen ==================== */

function LandingScreen({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center overflow-hidden pt-[5vh]">
      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,157,77,.25)] bg-[rgba(255,255,255,.72)] px-5 py-[11px] text-[14px] font-extrabold tracking-[.14em] text-[#D47A2E] shadow-[0_8px_20px_-12px_rgba(255,157,77,.4)] backdrop-blur-sm">
        🐾&nbsp;<span className="uppercase font-extrabold text-[13px]">{t("petbadge.landing.pill")}</span>
      </div>
      <h1 className="mt-[44px] text-center text-[46px] font-black leading-[1.24] tracking-[.02em]">
        {t("petbadge.landing.hero1")}<br />{t("petbadge.landing.hero2")}
        <span className="inline-block text-[30px] rotate-[14deg] -translate-y-[14px]">🏷️</span>
      </h1>
      <p className="mt-[34px] text-center text-[17.5px] leading-[1.9] text-[#5D6D7A]" dangerouslySetInnerHTML={{ __html: t("petbadge.landing.sub") }} />
      <p className="mt-[26px] text-center text-[19px] font-extrabold text-[#3A4656]">
        {t("petbadge.landing.heroTip")}
      </p>
      <button
        onClick={onStart}
        className="mt-[36px] h-[64px] w-[min(320px,86%)] rounded-full bg-gradient-to-br from-[#FF9D4D] to-[#E8893A] text-[21px] font-bold tracking-[.2em] text-white shadow-[0_16px_30px_-10px_rgba(255,157,77,.55),inset_0_1px_0_rgba(255,255,255,.35)] active:scale-[.96] transition-transform"
      >
        {t("petbadge.landing.cta")}
      </button>
    </div>
  );
}

/* ==================== Upload Screen ==================== */

function UploadScreen({
  onBack,
  onNext,
  avatar,
  setAvatar,
}: {
  onBack: () => void;
  onNext: () => void;
  avatar: string | null;
  setAvatar: (url: string) => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [hasImage, setHasImage] = useState(false);

  const loadFile = useCallback(
    (f: File | undefined) => {
      if (!f || !f.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = () => {
        setAvatar(r.result as string);
        setHasImage(true);
      };
      r.readAsDataURL(f);
    },
    [setAvatar]
  );

  return (
    <div>
      <h1 className="text-[31px] font-black tracking-[.01em] leading-[1.3]" dangerouslySetInnerHTML={{ __html: t("petbadge.upload.title") }} />
      <p className="mt-3 text-[16.5px] leading-[1.85] text-[#5D6D7A]" dangerouslySetInnerHTML={{ __html: t("petbadge.upload.sub") }} />
      <div className="my-[18px] flex justify-center">
        <span className="inline-flex items-center gap-[7px] rounded-full bg-[#FFF0E0] px-4 py-[9px] text-[13.5px] font-bold text-[#D47A2E]">
          {t("petbadge.upload.privacy")}
        </span>
      </div>

      <div className="relative mt-[22px]">
        <BadgeClip />
        <div className="relative rounded-[26px] bg-white p-[22px_20px_24px] shadow-[0_30px_60px_-24px_rgba(255,157,77,.35)]">
          <div className="flex justify-between items-center gap-[10px] py-[2px] px-1 pb-[14px]">
            <span className="text-[12.5px] text-[#718096] flex items-center gap-[6px]">🐾 <b>PET BADGE · CANDIDATE</b></span>
            <span className="text-[12.5px] text-[#A0AEC0] tracking-[.08em] font-semibold">PCP-{todayStr()}-001</span>
          </div>

          <div
            className={`mt-[6px] rounded-[20px] border-2 border-dashed bg-[#FFF7EE] p-[34px_18px_30px] flex flex-col items-center gap-4 ${
              hasImage ? "border-solid border-[#F0C9A0] !p-3" : "border-[#F0C9A0]"
            }`}
          >
            {hasImage && avatar ? (
              <img src={avatar} alt="Preview" className="w-full aspect-[1/.92] object-cover rounded-[14px] block" />
            ) : (
              <>
                <div className="flex items-center gap-[14px] text-[#D47A2E]">
                  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
                    <rect x="6" y="16" width="38" height="30" rx="7"/><circle cx="25" cy="31" r="8.5"/><path d="M14 16 l4 -6 h14 l4 6"/><circle cx="39" cy="24" r="1.6" fill="currentColor"/>
                    <g transform="translate(40 26)"><circle cx="6" cy="4" r="2.6"/><circle cx="13" cy="3" r="2.6"/><circle cx="19.5" cy="6" r="2.4"/><circle cx="8" cy="11" r="2.5"/><circle cx="15" cy="11.5" r="2.4"/></g>
                  </svg>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="h-[52px] rounded-full bg-gradient-to-br from-[#FF9D4D] to-[#E8893A] px-[30px] text-[16.5px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(255,157,77,.6),inset_0_1px_0_rgba(255,255,255,.25)] active:scale-[.96] transition-transform"
                >
                  {t("petbadge.upload.pick")}
                </button>
                <span className="text-[14.5px] font-semibold text-[#B29A7E]">{t("petbadge.upload.format")}</span>
              </>
            )}
          </div>

          {hasImage && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => fileRef.current?.click()}
                className="h-[44px] rounded-full px-[22px] text-[14.5px] bg-white text-[#D47A2E] shadow-[inset_0_0_0_1.5px_#F0C9A0] active:scale-[.96] transition-transform"
              >
                {t("petbadge.upload.retake")}
              </button>
            </div>
          )}

          <div className="mt-[14px] text-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="border-0 bg-transparent text-[#D47A2E] text-[13.5px] font-bold underline decoration-dotted cursor-pointer"
            >
              {t("petbadge.upload.change")}
            </button>
          </div>
        </div>
      </div>

      {hasImage && (
        <div className="mt-[18px] rounded-[14px] bg-[#E9F2E3] p-[13px_16px] text-[14.5px] font-extrabold text-[#4A8A4F] flex gap-2 items-center justify-center">
          {t("petbadge.upload.ok")}
        </div>
      )}

      <h2 className="mt-[26px] mb-3 text-center text-[17px] font-black text-[#D47A2E] tracking-[.12em]">{t("petbadge.upload.guide")}</h2>
      <div className="flex gap-[9px] flex-wrap justify-center">
        <span className="rounded-xl bg-white px-[13px] py-[9px] text-[13.5px] font-extrabold text-[#3A4656] shadow-[0_6px_14px_-8px_rgba(255,157,77,.35),inset_0_0_0_1px_rgba(255,157,77,.06)]">{t("petbadge.upload.tip1")}</span>
        <span className="rounded-xl bg-white px-[13px] py-[9px] text-[13.5px] font-extrabold text-[#3A4656] shadow-[0_6px_14px_-8px_rgba(255,157,77,.35),inset_0_0_0_1px_rgba(255,157,77,.06)]">{t("petbadge.upload.tip2")}</span>
        <span className="rounded-xl bg-[#FFF0E0] px-[13px] py-[9px] text-[13.5px] font-extrabold text-[#D47A2E] shadow-[0_6px_14px_-8px_rgba(255,157,77,.35),inset_0_0_0_1px_rgba(255,157,77,.06)]">{t("petbadge.upload.tip3")}</span>
      </div>

      <div className="mt-[26px] flex gap-3">
        <button
          onClick={onBack}
          className="h-[58px] flex-1 rounded-full bg-white text-[17.5px] font-bold text-[#2F3E4E] shadow-[0_8px_20px_-10px_rgba(255,157,77,.35),inset_0_0_0_1px_rgba(255,157,77,.08)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.upload.back")}
        </button>
        <button
          onClick={onNext}
          disabled={!hasImage}
          className="h-[58px] flex-[1.7] rounded-full bg-gradient-to-br from-[#FF9D4D] to-[#E8893A] text-[17.5px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(255,157,77,.6),inset_0_1px_0_rgba(255,255,255,.25)] disabled:opacity-45 disabled:pointer-events-none disabled:saturate-[.6] active:scale-[.96] transition-transform"
        >
          {t("petbadge.upload.analyze")}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ==================== Analysis Screen ==================== */

function AnalysisScreen({ avatar, onDone }: { avatar: string; onDone: () => void }) {
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
      <div className="rounded-full border border-[rgba(255,157,77,.28)] bg-[rgba(255,255,255,.8)] px-[22px] py-[10px] text-[13.5px] text-[#D47A2E] shadow-[0_8px_18px_-12px_rgba(255,157,77,.45)] uppercase font-bold tracking-[.22em]">
        {t("petbadge.analysis.pill")}
      </div>
      <div className="relative mt-[30px] w-[min(360px,100%)] rounded-[24px]">
        <img src={avatar} alt="Pet photo" className="w-full aspect-[16/10.5] object-cover rounded-[24px] block shadow-[0_24px_50px_-22px_rgba(255,157,77,.5)]" />
        <div
          className="absolute left-0 right-0 h-[64px] top-[-64px] pointer-events-none rounded-[24px] border-b-2 border-[rgba(255,157,77,.9)]"
          style={{
            background: "linear-gradient(180deg,rgba(255,157,77,0),rgba(255,157,77,.28) 70%,rgba(255,157,77,.75))",
            filter: "blur(.4px)",
            animation: "petbadge-scan 2.1s ease-in-out infinite alternate",
          }}
        />
        <span className="absolute left-[38%] top-[34%] text-[30px] opacity-55 -rotate-[16deg]" style={{ animation: "petbadge-pawpulse 1.6s ease-in-out infinite" }}>🐾</span>
        <span className="absolute left-[50%] top-[52%] text-[30px] opacity-55 rotate-[10deg]" style={{ animation: "petbadge-pawpulse 1.6s ease-in-out infinite .4s" }}>🐾</span>
        <div
          className={`absolute right-[-26px] bottom-[-38px] w-[118px] h-[118px] text-[#A0AEC0] transition-all duration-[.45s] ease-[cubic-bezier(.2,.8,.3,1.2)] ${
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
      <div className="mt-[26px] w-[min(360px,100%)] h-[14px] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(255,157,77,.12)] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#FF9D4D] to-[#E8893A] transition-[width] duration-[.12s] linear" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-[14px] text-[24px] font-black text-[#D47A2E]">{pct}%</div>
      <p className="mt-[26px] w-[min(360px,100%)] text-[15.5px] leading-[1.8] text-[#5D6D7A] min-h-[3.6em]">{t(`petbadge.fact.${factIdx}`)}</p>
    </div>
  );
}

/* ==================== Register Screen ==================== */

function RegisterScreen({
  avatar,
  onBack,
  onNext,
}: {
  avatar: string;
  onBack: () => void;
  onNext: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const randName = useCallback(() => {
    setName(t(`petbadge.name.${rnd(0, 23)}`));
  }, [t]);

  return (
    <div>
      <h1 className="text-[37px] font-black">{t("petbadge.register.title")}</h1>
      <p className="mt-2 text-[19px] text-[#4A5A66] font-semibold">{t("petbadge.register.sub")}</p>

      <div className="relative mt-[26px]">
        <BadgeClip />
        <div className="relative rounded-[26px] bg-white p-[22px_20px_24px] shadow-[0_30px_60px_-24px_rgba(255,157,77,.35)]">
          <div className="flex items-center gap-2 pb-[6px]">
            <span className="flex items-center gap-2 text-[13px] text-[#3A4656]">🐾 <span className="uppercase font-bold tracking-[.22em] text-[13px]">PAW &amp; CLAW CORP.</span></span>
            <span className="ml-auto inline-flex items-center gap-[7px] rounded-full bg-[#FFF0E0] px-3 py-[7px] text-[12.5px] font-extrabold text-[#D47A2E]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#FF9D4D]" />{t("petbadge.register.wait")}
            </span>
          </div>
          <div className="text-center text-[27px] font-black my-4 tracking-[.06em]">{t("petbadge.register.mystery")}</div>
          <div className="flex flex-col items-center gap-[14px]">
            <img src={avatar} alt="Candidate photo" className="w-[210px] h-[170px] object-cover rounded-[18px] shadow-[0_18px_36px_-16px_rgba(255,157,77,.5)]" />
            <span className="border-[1.5px] border-[#FF9D4D] text-[#D47A2E] bg-[#FFF7EE] rounded-xl px-4 py-2 text-[14.5px] font-black tracking-[.1em]">{t("petbadge.register.pending")}</span>
          </div>
          <div className="mt-[2px] text-center text-[13.5px] text-[#9AA6B1] tracking-[.16em] font-bold">{t("petbadge.register.no")}</div>
          <div className="mt-[18px] bg-[#FFF0E0] rounded-[16px] p-[18px_16px] text-center">
            <div className="text-[18px] font-black text-[#3A4656]">{t("petbadge.register.mystery")}</div>
            <div className="mt-2 text-[14.5px] font-semibold text-[#8A97A2]">{t("petbadge.register.wait")}</div>
          </div>
        </div>
      </div>

      <input
        className="mt-[24px] w-full border-[1.5px] border-[#F0C9A0] bg-[#FFFDF9] rounded-[18px] px-5 py-[17px] text-[16.5px] font-bold text-[#2F3E4E] outline-none shadow-[0_10px_24px_-16px_rgba(255,157,77,.4)] placeholder:text-[#B4A28C] placeholder:font-semibold focus:border-[#FF9D4D]"
        maxLength={8}
        placeholder={t("petbadge.register.namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onNext(name || t(`petbadge.name.${rnd(0, 23)}`));
        }}
      />

      <div className="mt-[30px] flex gap-3">
        <button
          onClick={randName}
          className="h-[58px] flex-1 rounded-full bg-white text-[17.5px] font-bold text-[#2F3E4E] shadow-[0_8px_20px_-10px_rgba(255,157,77,.35),inset_0_0_0_1px_rgba(255,157,77,.08)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.register.randName")}
        </button>
        <button
          onClick={() => onNext(name || t(`petbadge.name.${rnd(0, 23)}`))}
          className="h-[58px] flex-[1.7] rounded-full bg-gradient-to-br from-[#FF9D4D] to-[#E8893A] text-[17.5px] font-bold text-white shadow-[0_14px_26px_-12px_rgba(255,157,77,.55)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.register.finish")}
        </button>
      </div>
      <p className="mt-[30px] text-center text-[12px] text-[#D47A2E] uppercase tracking-[.22em] font-bold">{t("petbadge.register.foot")}</p>
    </div>
  );
}

/* ==================== Badge Screen ==================== */

const THEME_BG: Record<Theme, string> = {
  ins: "",
  cute: "linear-gradient(180deg,#FFEFF4,#FBE0EA)",
  y2k: "linear-gradient(180deg,#F0EDFF,#E2F1FF)",
  cyber: "radial-gradient(120% 90% at 50% 0%,#1E2D36,#121E26)",
  biz: "linear-gradient(180deg,#F3F2ED,#E7E8E4)",
  hk: "linear-gradient(180deg,#FFF3DF,#F7E3C2)",
};

const THEME_CARD: Record<Theme, string> = {
  ins: "",
  cute: "bg-[#FFF1F5] text-[#7A4155]",
  y2k: "text-[#4B3F8F]",
  cyber: "bg-gradient-to-br from-[#1A2B35] to-[#142029] text-[#D9FFE9]",
  biz: "bg-[#FBFAF6] text-[#22304A]",
  hk: "bg-[#FFF7E9] text-[#7A211C]",
};

const THEME_KEYS: [Theme, string][] = [
  ["ins", "petbadge.theme.ins"],
  ["cute", "petbadge.theme.cute"],
  ["y2k", "petbadge.theme.y2k"],
  ["cyber", "petbadge.theme.cyber"],
  ["biz", "petbadge.theme.biz"],
  ["hk", "petbadge.theme.hk"],
];

const RLBL_KEYS = ["petbadge.radar.颜值", "petbadge.radar.亲和力", "petbadge.radar.观察力", "petbadge.radar.执行力", "petbadge.radar.治愈力", "petbadge.radar.摸鱼能力"];

/* Rarity tiers, pokemon-tcg style: each tier gets its own foil pattern class
   (holo-r-*) and palette. c1/c2 feed the beam gradients, glow (rgb triplet)
   feeds the hover shadow. Tier is derived from the radar average score. */
type Rarity = "common" | "holo" | "ultra" | "gold";

const RARITY_HOLO: Record<Rarity, { c1: string; c2: string; glow: string; stars: string; labelKey: string }> = {
  common: { c1: "#C7D0D8", c2: "#E8EDF1", glow: "150,162,175", stars: "★", labelKey: "petbadge.rarity.common" },
  holo: { c1: "#FFC38C", c2: "#FFEAD4", glow: "255,157,77", stars: "★★", labelKey: "petbadge.rarity.holo" },
  ultra: { c1: "#C9B8FF", c2: "#FFC9E8", glow: "180,140,255", stars: "★★★", labelKey: "petbadge.rarity.ultra" },
  gold: { c1: "#F2CE6B", c2: "#FFF0BC", glow: "255,199,71", stars: "★★★★", labelKey: "petbadge.rarity.gold" },
};

/* ins theme inline color tokens */
const INS = {
  meta: "#9AA6B1",
  line: "#F0C9A0",
  accent: "#FF9D4D",
  greenBg: "#E9F2E3",
  greenText: "#4A8A4F",
  cardBg: "#FFF7EE",
  radarBg: "#FFF0E0",
};

function BadgeScreen({
  avatar,
  name,
  onAgain,
}: {
  avatar: string;
  name: string;
  onAgain: () => void;
}) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>("ins");
  const cardRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ px: 50, py: 50, active: false });
  const curRef = useRef({ x: 50, y: 50, rx: 0, ry: 0, bgx: 50, bgy: 50, o: 0, lift: 0 });
  const rafRef = useRef(0);
  const stopShowcaseRef = useRef<() => void>(() => {});

  const jobIdx = useState(() => rnd(0, 15))[0];
  const hrIdx = useState(() => rnd(0, 6))[0];
  const payIdx = useState(() => rnd(0, 6))[0];
  const vals = useState(() => RLBL_KEYS.map(() => rnd(38, 99)))[0];
  const no = useState(() => `PCP-${todayStr()}-${String(rnd(1, 999)).padStart(3, "0")}`)[0];
  const code = useState(() => `PET ${rnd(1000, 9999)} ${rnd(1000, 9999)}`)[0];

  const job = t(`petbadge.job.${jobIdx}`);
  const hr = t(`petbadge.hr.${hrIdx}`);
  const pay = t(`petbadge.pay.${payIdx}`);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const rarity: Rarity = avg >= 85 ? "gold" : avg >= 72 ? "ultra" : avg >= 58 ? "holo" : "common";
  const holo = RARITY_HOLO[rarity];
  const labels = RLBL_KEYS.map((k) => t(k));

  /* rAF lerp loop: writes CSS vars straight to the DOM (no React re-render per mousemove).
     Faster easing while interacting, slow springy settle on leave — like the reference springs. */
  const tick = useCallback(() => {
    const el = cardRef.current;
    if (!el) {
      rafRef.current = 0;
      return;
    }
    const cur = curRef.current;
    const tgt = targetRef.current;
    const kPos = tgt.active ? 0.22 : 0.07;
    const kRot = tgt.active ? 0.18 : 0.055;
    const kFx = tgt.active ? 0.15 : 0.05;
    cur.x += (tgt.px - cur.x) * kPos;
    cur.y += (tgt.py - cur.y) * kPos;
    const trx = -((cur.x - 50) / 3.5);
    const tryy = (cur.y - 50) / 3.5;
    cur.rx += (trx - cur.rx) * kRot;
    cur.ry += (tryy - cur.ry) * kRot;
    cur.bgx += (37 + (cur.x * 26) / 100 - cur.bgx) * kPos;
    cur.bgy += (33 + (cur.y * 34) / 100 - cur.bgy) * kPos;
    cur.o += ((tgt.active ? 1 : 0) - cur.o) * kFx;
    cur.lift += ((tgt.active ? 1 : 0) - cur.lift) * (tgt.active ? 0.12 : 0.05);

    const s = el.style;
    s.setProperty("--pointer-x", `${cur.x.toFixed(2)}%`);
    s.setProperty("--pointer-y", `${cur.y.toFixed(2)}%`);
    s.setProperty("--rotate-x", `${cur.rx.toFixed(3)}deg`);
    s.setProperty("--rotate-y", `${cur.ry.toFixed(3)}deg`);
    s.setProperty("--background-x", `${cur.bgx.toFixed(2)}%`);
    s.setProperty("--background-y", `${cur.bgy.toFixed(2)}%`);
    s.setProperty("--card-opacity", cur.o.toFixed(3));
    s.setProperty("--card-lift", cur.lift.toFixed(3));
    el.classList.toggle("interacting", cur.o > 0.02);

    const settled =
      !tgt.active &&
      cur.o < 0.01 &&
      cur.lift < 0.01 &&
      Math.abs(cur.rx) < 0.08 &&
      Math.abs(cur.ry) < 0.08;
    if (settled) {
      curRef.current = { x: 50, y: 50, rx: 0, ry: 0, bgx: 50, bgy: 50, o: 0, lift: 0 };
      rafRef.current = 0;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const ensureLoop = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  /* Reveal showcase on entry (sine-loop tilt like the reference showcase card). On
     hover-less (touch) devices it keeps looping until the user touches the card. */
  useEffect(() => {
    const killRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
    if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stopShowcaseRef.current = () => {};
      return killRaf;
    }
    const noHover = window.matchMedia("(hover: none)").matches;
    let r = Math.random() * 6;
    let iv = 0;
    const stop = () => {
      if (iv) {
        clearInterval(iv);
        iv = 0;
      }
      targetRef.current.px = 50;
      targetRef.current.py = 50;
      targetRef.current.active = false;
      ensureLoop();
    };
    stopShowcaseRef.current = stop;
    const startTimer = window.setTimeout(() => {
      iv = window.setInterval(() => {
        r += 0.042;
        targetRef.current.px = 50 + Math.sin(r) * 46;
        targetRef.current.py = 50 + Math.cos(r * 0.9) * 42;
        targetRef.current.active = true;
        ensureLoop();
      }, 33);
    }, 450);
    const capTimer = window.setTimeout(stop, noHover ? 11000 : 3400);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(capTimer);
      if (iv) clearInterval(iv);
      killRaf();
    };
  }, [ensureLoop]);

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      stopShowcaseRef.current();
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      targetRef.current.px = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      targetRef.current.py = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
      targetRef.current.active = true;
      ensureLoop();
    },
    [ensureLoop]
  );

  const handleLeave = useCallback(() => {
    targetRef.current.px = 50;
    targetRef.current.py = 50;
    targetRef.current.active = false;
    ensureLoop();
  }, [ensureLoop]);

  return (
    <div
      className="min-h-dvh transition-colors duration-500"
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <BadgeClip />
          <div
            ref={cardRef}
            className={`holo-card holo-r-${rarity}`}
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={handleLeave}
            onPointerCancel={handleLeave}
          >
            <div
              className={`holo-rotator relative rounded-[26px] p-[24px_20px_22px] transition-colors duration-500 ${
                THEME_CARD[theme] || "bg-white text-[#33424E]"
              } ${theme === "hk" ? "border-2 border-[rgba(196,55,43,.35)] rounded-[20px] relative" : ""}`}
              style={
                {
                  "--holo-c1": holo.c1,
                  "--holo-c2": holo.c2,
                  "--holo-glow": holo.glow,
                  /* multiply vanishes on the dark cyber card; it needs screen there */
                  "--holo-blend": theme === "cyber" ? "screen" : "multiply",
                  ...(theme === "y2k" ? { background: "linear-gradient(160deg,#EFECFF,#DFF2FF 55%,#FDE9F6)" } : undefined),
                } as React.CSSProperties
              }
            >
            {theme === "hk" && <div className="absolute inset-[7px] border-2 border-[rgba(196,55,43,.35)] rounded-[20px] pointer-events-none" />}

            <div className="text-[12px] tracking-[.26em] font-extrabold px-1" style={{ color: theme === "ins" ? INS.meta : undefined }}>
              {t("petbadge.badge.identity")} {new Date().getFullYear()}
            </div>
            <div className="h-px my-3" style={{ background: theme === "ins" ? INS.line : undefined }} />
            <div className="flex items-center gap-[7px] px-[2px]">
              <span className="text-[15px]" style={{ color: theme === "ins" ? INS.accent : undefined }}>🐾</span>
              <span className="uppercase text-[14.5px] font-bold tracking-[.14em]" style={{ letterSpacing: ".14em" }}>PAW &amp; CLAW CORP.</span>
              <span
                className="ml-auto rounded-full px-[14px] py-[7px] text-[13px] font-extrabold tracking-[.06em]"
                style={{
                  background: theme === "ins" ? INS.greenBg : undefined,
                  color: theme === "ins" ? INS.greenText : undefined,
                }}
              >
                {t("petbadge.badge.official入职")}
              </span>
            </div>

            <div className="flex gap-4 mt-[18px] items-stretch">
              <div className="relative flex-none w-[128px]">
                <img src={avatar} alt="Employee photo" className="w-[128px] h-[132px] object-cover rounded-[16px] block shadow-[0_12px_26px_-14px_rgba(60,50,40,.5)]" />
                <span
                  className="absolute right-[-14px] bottom-2 rounded-[6px] px-[7px] py-[3px] text-[11px] font-black tracking-[.14em] -rotate-[11deg] shadow-[0_4px_10px_-4px_rgba(200,50,30,.4)]"
                  style={{
                    background: theme === "cyber" ? "#0C161B" : "#fff",
                    color: theme === "cyber" ? "#FF5C7A" : INS.accent,
                    border: `2px solid ${theme === "cyber" ? "#FF5C7A" : INS.accent}`,
                  }}
                >
                  {t("petbadge.badge.official")}
                </span>
              </div>
              <div className="flex-1 flex flex-col pb-[14px] border-b-[1.5px] min-w-0" style={{ borderColor: theme === "ins" ? INS.line : undefined }}>
                <div className="flex items-center gap-[9px] flex-wrap">
                  <span className="text-[33px] font-black tracking-[.03em] leading-[1.15] break-all">{name}</span>
                  <span
                    className="border-[1.5px] rounded-[8px] px-[7px] py-[3px] text-[11px] font-extrabold tracking-[.08em] whitespace-nowrap"
                    style={{
                      borderColor: theme === "ins" ? INS.meta : undefined,
                      color: theme === "ins" ? INS.meta : undefined,
                    }}
                  >
                    {t(holo.labelKey)} {holo.stars}
                  </span>
                </div>
                <div className="mt-[9px] text-[12px] tracking-[.09em] font-bold whitespace-nowrap" style={{ color: theme === "ins" ? INS.meta : undefined }}>
                  NO．<b style={{ color: theme === "ins" ? undefined : "inherit" }}>{no}</b>
                </div>
                <div className="mt-auto pt-3 text-[20.5px] font-black tracking-[.05em]">{job}</div>
              </div>
            </div>

            <div
              className="mt-4 rounded-[18px] p-3 grid grid-cols-[1.1fr_1fr] gap-[10px]"
              style={{ background: theme === "ins" ? INS.radarBg : undefined }}
            >
              <div className="flex items-center justify-center">
                <div className="w-full" style={{ color: theme === "ins" ? INS.meta : undefined }} dangerouslySetInnerHTML={{ __html: RadarSVG({ vals, labels }) }} />
              </div>
              <div
                className="flex flex-col gap-[10px] rounded-[14px] p-3 shadow-[0_6px_16px_-12px_rgba(60,50,40,.35)]"
                style={{ background: theme === "ins" ? "#fff" : undefined }}
              >
                <div>
                  <div className="text-[10.5px] tracking-[.16em] font-extrabold" style={{ color: theme === "ins" ? INS.meta : undefined }}>{t("petbadge.badge.hr")}</div>
                  <div className="mt-[5px] text-[14.5px] font-extrabold leading-[1.55] tracking-[.02em]">{hr}</div>
                </div>
                <div>
                  <div className="text-[10.5px] tracking-[.16em] font-extrabold" style={{ color: theme === "ins" ? INS.meta : undefined }}>{t("petbadge.badge.pay")}</div>
                  <div className="mt-[5px] text-[14.5px] font-extrabold leading-[1.55] tracking-[.02em]">{pay}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-[14px] border-t-[1.5px] flex items-center gap-[14px]" style={{ borderColor: theme === "ins" ? INS.line : undefined }}>
              <div
                className="flex-none w-[52px] h-[52px] rounded-full border-2 border-dashed flex items-center justify-center -rotate-[12deg] opacity-85"
                style={{ borderColor: theme === "ins" ? INS.accent : undefined, color: theme === "ins" ? INS.accent : undefined }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <ellipse cx="7.2" cy="8.2" rx="2.1" ry="2.8"/><ellipse cx="16.8" cy="8.2" rx="2.1" ry="2.8"/>
                  <ellipse cx="3.8" cy="13" rx="1.9" ry="2.4"/><ellipse cx="20.2" cy="13" rx="1.9" ry="2.4"/>
                  <path d="M12 11.2c3.1 0 5.6 2.5 5.6 5.1 0 2.1-1.7 3.2-3.3 2.6-1.5-.5-3.1-.5-4.6 0-1.6.6-3.3-.5-3.3-2.6 0-2.6 2.5-5.1 5.6-5.1z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ color: theme === "ins" ? "#33424E" : undefined }}><div dangerouslySetInnerHTML={{ __html: BarcodeSVG({ seed: no }) }} /></div>
                <div className="mt-[6px] text-right text-[12.5px] tracking-[.3em] font-extrabold" style={{ color: theme === "ins" ? INS.meta : undefined }}>{code}</div>
              </div>
            </div>

            <div className="holo-shine" />
            <div className="holo-glare" />
          </div>
        </div>
        </div>

        <div className="mt-[30px] grid grid-cols-3 gap-[11px] w-[min(352px,100%)]">
          {THEME_KEYS.map(([key, labelKey]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`border-0 cursor-pointer font-extrabold text-[15px] rounded-full py-[13px] px-1 transition-all active:scale-[.95] whitespace-nowrap ${
                theme === key
                  ? "bg-gradient-to-br from-[#FF9D4D] to-[#E8893A] text-white shadow-[0_12px_24px_-8px_rgba(255,157,77,.6),inset_0_1px_0_rgba(255,255,255,.4)]"
                  : "bg-white text-[#3A4656] shadow-[0_8px_18px_-10px_rgba(255,157,77,.4),inset_0_0_0_1px_rgba(255,157,77,.06)]"
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-[22px] flex gap-3 w-[min(352px,100%)]">
          <button className="h-[58px] flex-1 rounded-full bg-gradient-to-br from-[#FF9D4D] to-[#E8893A] text-[17.5px] font-bold text-white shadow-[0_14px_26px_-12px_rgba(255,157,77,.55)] active:scale-[.96] transition-transform">
            {t("petbadge.badge.wall")}
          </button>
          <button className="h-[58px] flex-1 rounded-full bg-white text-[17.5px] font-bold text-[#2F3E4E] shadow-[0_8px_20px_-10px_rgba(255,157,77,.35),inset_0_0_0_1px_rgba(255,157,77,.08)] active:scale-[.96] transition-transform flex items-center justify-center gap-2">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>
            {t("petbadge.badge.share")}
          </button>
        </div>
        <div className="mt-[22px] text-center">
          <button
            onClick={onAgain}
            className="border-0 bg-transparent text-[#D47A2E] text-[13.5px] font-bold underline decoration-dotted cursor-pointer"
          >
            {t("petbadge.badge.again")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== Main App ==================== */

export function PetBadgeApp() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<Screen>("landing");
  const [avatar, setAvatar] = useState<string>("");
  const [name, setName] = useState("");

  return (
    <>
      <style>{`
        @keyframes petbadge-scan { from { top: -8% } to { top: 88% } }
        @keyframes petbadge-pawpulse { 0%,100% { opacity: .25 } 50% { opacity: .75 } }
        @keyframes petbadge-spin { to { transform: rotate(360deg) } }
        .holo-card {
          --pointer-x: 50%; --pointer-y: 50%;
          --rotate-x: 0deg; --rotate-y: 0deg;
          --card-opacity: 0; --card-lift: 0;
          --background-x: 50%; --background-y: 50%;
          --holo-c1: #FFC38C; --holo-c2: #FFEAD4;
          --holo-glow: 255,157,77; --holo-blend: multiply;
          perspective: 600px;
        }
        .holo-card .holo-rotator {
          transform-style: preserve-3d;
          transform:
            translateY(calc(var(--card-lift) * -8px))
            scale(calc(1 + var(--card-lift) * 0.03))
            rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
          transition: box-shadow .45s ease, background-color .5s ease, color .5s ease, border-color .5s ease;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.35),
            0 30px 60px -24px rgba(120,75,35,.35);
          will-change: transform;
        }
        .holo-card.interacting .holo-rotator {
          box-shadow:
            0 0 2px 1px rgba(255,255,255,.9),
            0 0 5px 1px rgba(var(--holo-glow), .45),
            0 0 22px 6px rgba(var(--holo-glow), .3),
            0 26px 60px -22px rgba(var(--holo-glow), .5);
        }
        .holo-card .holo-shine {
          position: absolute; inset: 0; border-radius: inherit;
          overflow: hidden; z-index: 3; pointer-events: none;
          transform: translateZ(1px);
          opacity: var(--card-opacity);
          mix-blend-mode: var(--holo-blend);
          filter: saturate(1.3);
        }
        /* N common: no foil pattern, glare only (reference: basic cards) */
        .holo-card.holo-r-common .holo-shine::before { content: none; }
        /* R holo: diagonal foil beams drifting with the pointer (reference: rare holo) */
        .holo-card.holo-r-holo .holo-shine {
          background-image: repeating-linear-gradient(112deg,
            transparent 0%, transparent 6%,
            var(--holo-c2) 14%, var(--holo-c1) 22%,
            var(--holo-c2) 30%, transparent 40%, transparent 52%,
            var(--holo-c1) 66%, var(--holo-c2) 76%, transparent 88%);
          background-size: 320% 320%;
          background-position:
            calc(((50% - var(--background-x)) * 2.4) + 50%)
            calc(((50% - var(--background-y)) * 3.2) + 50%);
        }
        /* SR ultra: crossing metallic weave sliding both ways (reference: V full art) */
        .holo-card.holo-r-ultra .holo-shine {
          background-image:
            repeating-linear-gradient(118deg,
              transparent 0%, transparent 8%,
              var(--holo-c2) 18%, var(--holo-c1) 26%,
              var(--holo-c2) 34%, transparent 46%,
              var(--holo-c1) 58%, var(--holo-c2) 68%, transparent 84%),
            repeating-linear-gradient(56deg,
              transparent 0%, transparent 14%,
              var(--holo-c2) 24%, transparent 36%);
          background-size: 320% 320%, 260% 260%;
          background-position:
            calc(((50% - var(--background-x)) * 2.4) + 50%) calc(((50% - var(--background-y)) * 3.2) + 50%),
            calc(((50% - var(--background-x)) * -1.7) + 50%) calc(((50% - var(--background-y)) * -2.3) + 50%);
        }
        /* UR gold: gold beams + two drifting sparkle grids (reference: secret rare glitter) */
        .holo-card.holo-r-gold .holo-shine {
          background-image:
            repeating-linear-gradient(112deg,
              transparent 0%, transparent 6%,
              var(--holo-c2) 14%, var(--holo-c1) 24%,
              var(--holo-c2) 32%, transparent 42%,
              var(--holo-c1) 64%, var(--holo-c2) 74%, transparent 88%),
            radial-gradient(circle, var(--holo-c1) 0.8px, transparent 1.7px),
            radial-gradient(circle, #C98A1E 0.7px, transparent 1.6px);
          background-size: 320% 320%, 17px 23px, 13px 19px;
          background-position:
            calc(((50% - var(--background-x)) * 2.4) + 50%) calc(((50% - var(--background-y)) * 3.2) + 50%),
            calc(((50% - var(--background-x)) * -3) + 50%) calc(((50% - var(--background-y)) * 4) + 50%),
            calc(((50% - var(--background-x)) * 4) + 50%) calc(((50% - var(--background-y)) * -3) + 50%);
        }
        /* vertical light bars sliding the opposite way (reference: shine::before sunpillar) */
        .holo-card .holo-shine::before {
          content: ""; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(90deg,
            rgba(255,255,255,0) 0%, rgba(255,255,255,.95) 4.5%, rgba(255,255,255,0) 9%,
            rgba(255,255,255,0) 26%, rgba(255,255,255,.7) 30%, rgba(255,255,255,0) 34%);
          background-size: 240% 240%;
          background-position:
            calc(((50% - var(--background-x)) * -1.8) + 50%)
            calc(((50% - var(--background-y)) * 1.2) + 50%);
          mix-blend-mode: overlay;
        }
        /* soft bloom under the cursor (reference: shine::after) */
        .holo-card .holo-shine::after {
          content: ""; position: absolute; inset: 0;
          background-image: radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y),
            rgba(255,255,255,.9) 0%, rgba(255,255,255,.2) 30%, rgba(255,255,255,0) 62%);
          mix-blend-mode: soft-light;
        }
        .holo-card .holo-glare {
          position: absolute; inset: 0; border-radius: inherit;
          transform: translateZ(2px); pointer-events: none;
          background: radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y),
            hsla(0, 0%, 100%, .75) 10%,
            hsla(0, 0%, 100%, .4) 24%,
            hsla(0, 0%, 0%, .26) 92%);
          mix-blend-mode: overlay;
          opacity: var(--card-opacity);
        }
      `}</style>
      <div className="max-w-[470px] mx-auto min-h-dvh relative overflow-x-clip bg-white" style={{ boxShadow: "0 0 0 1px rgba(255,157,77,.08),0 40px 90px -40px rgba(255,157,77,.35)" }}>
        <div className="p-[26px_22px_46px] min-h-dvh">
          {screen === "landing" && <LandingScreen onStart={() => setScreen("upload")} />}
          {screen === "upload" && (
            <UploadScreen
              onBack={() => setScreen("landing")}
              onNext={() => setScreen("analysis")}
              avatar={avatar}
              setAvatar={setAvatar}
            />
          )}
          {screen === "analysis" && (
            <AnalysisScreen avatar={avatar} onDone={() => setScreen("register")} />
          )}
          {screen === "register" && (
            <RegisterScreen
              avatar={avatar}
              onBack={() => setScreen("upload")}
              onNext={(n) => {
                setName(n);
                setScreen("badge");
              }}
            />
          )}
          {screen === "badge" && (
            <BadgeScreen avatar={avatar} name={name} onAgain={() => { setScreen("landing"); setAvatar(""); setName(""); }} />
          )}
        </div>
      </div>
    </>
  );
}
