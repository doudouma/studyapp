import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Camera } from "lucide-react";

const ShareModal = lazy(() =>
  import("~/components/share/ShareModal").then((m) => ({ default: m.ShareModal }))
);

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
    svg += `<polygon points="${poly(R * f)}" fill="none" stroke="#1a1a1a" stroke-opacity="0.35" stroke-width="2"/>`;
  });
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, R);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#1a1a1a" stroke-opacity="0.3" stroke-width="2"/>`;
  }
  svg += `<polygon points="${vals.map((v, i) => pt(i, (R * v) / 100).map((x) => x.toFixed(1)).join(",")).join(" ")}" fill="#ff3333" fill-opacity="0.2" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>`;
  vals.forEach((v, i) => {
    const [x, y] = pt(i, (R * v) / 100);
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#1a1a1a"/>`;
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
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="900" fill="#1a1a1a" font-family="sans-serif">${labels[i]}</text>`;
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
    if (r() > 0.42) bars.push(`<rect x="${x.toFixed(1)}" y="0" width="${w}" height="34" fill="#1a1a1a"/>`);
    x += w + (r() > 0.5 ? 1.5 : 2.5);
  }
  return `<svg viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden="true">${bars.join("")}</svg>`;
}

/* ==================== Halftone Background ==================== */

function HalftoneBg({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.03] ${className}`}
      style={{
        backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "4px 4px",
      }}
    />
  );
}

/* ==================== Action Lines ==================== */

function ActionLines({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.04] ${className}`}
      style={{
        background: "repeating-linear-gradient(45deg, transparent, transparent 8px, #1a1a1a 8px, #1a1a1a 9px)",
      }}
    />
  );
}

/* ==================== Clip Component ==================== */

function BadgeClip() {
  return (
    <div className="relative z-[3] flex h-[72px] flex-col items-center pointer-events-none">
      <div className="w-[42px] h-[52px] rounded-t-lg rounded-b-[7px] bg-[#1a1a1a] border-4 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" />
      <div className="w-[76px] h-[15px] -mt-[3px] bg-[#666] rounded-lg border-4 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" />
      <div className="w-[88px] h-[10px] mt-[1px] bg-[#1a1a1a] rounded-lg" />
    </div>
  );
}

/* ==================== Comic Button ==================== */

function ComicButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "dark";
  className?: string;
  disabled?: boolean;
}) {
  const colors = {
    primary: "bg-[#ff3333] text-white",
    secondary: "bg-white text-[#1a1a1a]",
    dark: "bg-[#1a1a1a] text-white",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg border-4 border-[#1a1a1a] 
        shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]
        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        transition-all duration-100
        font-black uppercase tracking-wide
        ${colors[variant]}
        disabled:opacity-40 disabled:pointer-events-none
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/* ==================== Landing Screen ==================== */

function LandingScreen({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center overflow-hidden py-[5vh] relative">
      <HalftoneBg />
      <ActionLines />
      
      <div className="relative inline-flex items-center gap-2 border-4 border-[#1a1a1a] bg-[#ffcc00] px-5 py-3 font-black uppercase tracking-widest text-[13px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        🐾 {t("petbadge.landing.pill")}
      </div>
      
      <h1 className="relative mt-10 text-center font-black uppercase tracking-wide text-4xl md:text-5xl lg:text-6xl leading-tight">
        {t("petbadge.landing.hero1")}<br />{t("petbadge.landing.hero2")}
        <span className="inline-block text-3xl rotate-12 -translate-y-2">🏷️</span>
      </h1>
      
      <p className="relative mt-8 text-center text-base font-bold leading-relaxed text-[#4a4a4a] max-w-md" 
         dangerouslySetInnerHTML={{ __html: t("petbadge.landing.sub") }} />
      
      <p className="relative mt-6 text-center text-lg font-black uppercase tracking-wide">
        {t("petbadge.landing.heroTip")}
      </p>
      
      <button
        onClick={onStart}
        className="relative mt-8 h-16 w-[min(320px,86%)] rounded-lg border-4 border-[#1a1a1a] bg-[#ff3333] text-white font-black uppercase tracking-widest text-xl shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
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
    <div className="relative">
      <HalftoneBg />
      
      <h1 className="relative font-black uppercase tracking-wide text-3xl leading-tight" 
          dangerouslySetInnerHTML={{ __html: t("petbadge.upload.title") }} />
      <p className="relative mt-3 text-base font-bold leading-relaxed text-[#4a4a4a]" 
         dangerouslySetInnerHTML={{ __html: t("petbadge.upload.sub") }} />
      
      <div className="relative my-5 flex justify-center">
        <span className="inline-flex items-center gap-2 border-4 border-[#1a1a1a] bg-[#ffcc00] px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
          {t("petbadge.upload.privacy")}
        </span>
      </div>

      <div className="relative mt-5">
        <BadgeClip />
        <div className="relative rounded-lg border-4 border-[#1a1a1a] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <HalftoneBg className="rounded-lg" />
          
          <div className="relative flex justify-between items-center gap-2 py-1 pb-4">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              🐾 PET BADGE · CANDIDATE
            </span>
            <span className="text-xs font-black tracking-wider">PCP-{todayStr()}-001</span>
          </div>

          <div
            className={`relative mt-2 rounded-lg border-4 border-dashed p-8 flex flex-col items-center gap-4 ${
              hasImage ? "border-solid border-[#1a1a1a] !p-3" : "border-[#999]"
            }`}
          >
            {hasImage && avatar ? (
              <img src={avatar} alt="Preview" className="w-full aspect-square object-cover rounded-lg block border-4 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]" />
            ) : (
              <>
                <div className="flex items-center gap-4 text-[#1a1a1a]">
                  <Camera className="w-16 h-16" strokeWidth={1.5} />
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="h-12 rounded-lg border-4 border-[#1a1a1a] bg-[#3366ff] px-6 text-base font-black uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
                >
                  {t("petbadge.upload.pick")}
                </button>
                <span className="text-sm font-black uppercase tracking-wider">{t("petbadge.upload.format")}</span>
              </>
            )}
          </div>

          {hasImage && (
            <div className="relative mt-4 flex justify-center">
              <button
                onClick={() => fileRef.current?.click()}
                className="h-10 rounded-lg border-4 border-[#1a1a1a] bg-white px-5 text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100"
              >
                {t("petbadge.upload.retake")}
              </button>
            </div>
          )}

          <div className="relative mt-4 text-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="border-0 bg-transparent text-[#3366ff] text-sm font-black uppercase tracking-wider underline decoration-dotted cursor-pointer"
            >
              {t("petbadge.upload.change")}
            </button>
          </div>
        </div>
      </div>

      {hasImage && (
        <div className="relative mt-5 rounded-lg border-4 border-[#1a1a1a] bg-[#33cc33] p-3 text-sm font-black uppercase tracking-wider text-white text-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
          {t("petbadge.upload.ok")}
        </div>
      )}

      <h2 className="relative mt-6 mb-3 text-center text-base font-black uppercase tracking-widest">{t("petbadge.upload.guide")}</h2>
      <div className="relative flex gap-2 flex-wrap justify-center">
        <span className="rounded-lg border-4 border-[#1a1a1a] bg-white px-3 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">{t("petbadge.upload.tip1")}</span>
        <span className="rounded-lg border-4 border-[#1a1a1a] bg-white px-3 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">{t("petbadge.upload.tip2")}</span>
        <span className="rounded-lg border-4 border-[#1a1a1a] bg-[#ffcc00] px-3 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">{t("petbadge.upload.tip3")}</span>
      </div>

      <div className="relative mt-6 flex gap-3">
        <ComicButton onClick={onBack} variant="secondary" className="h-14 flex-1">
          {t("petbadge.upload.back")}
        </ComicButton>
        <ComicButton onClick={onNext} variant="primary" className="h-14 flex-[1.7]" disabled={!hasImage}>
          {t("petbadge.upload.analyze")}
        </ComicButton>
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
    <div className="relative flex flex-col items-center pt-[12vh]">
      <HalftoneBg />
      
      <div className="relative border-4 border-[#1a1a1a] bg-[#ffcc00] px-5 py-2 text-xs font-black uppercase tracking-[.22em] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        {t("petbadge.analysis.pill")}
      </div>
      
      <div className="relative mt-8 w-[min(360px,100%)]">
        <img src={avatar} alt="Pet photo" className="w-full aspect-[16/10.5] object-cover rounded-lg block border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]" />
        
        <div
          className="absolute left-0 right-0 h-16 top-[-64px] pointer-events-none rounded-lg border-b-4 border-[#ff3333]"
          style={{
            background: "linear-gradient(180deg,rgba(255,51,51,0),rgba(255,51,51,.3) 70%,rgba(255,51,51,.8))",
            animation: "petbadge-scan 2.1s ease-in-out infinite alternate",
          }}
        />
        
        <span className="absolute left-[38%] top-[34%] text-3xl opacity-60 -rotate-16" style={{ animation: "petbadge-pawpulse 1.6s ease-in-out infinite" }}>🐾</span>
        <span className="absolute left-[50%] top-[52%] text-3xl opacity-60 rotate-10" style={{ animation: "petbadge-pawpulse 1.6s ease-in-out infinite .4s" }}>🐾</span>
        
        <div
          className={`absolute right-[-26px] bottom-[-38px] w-[118px] h-[118px] text-[#1a1a1a] transition-all duration-100 ${
            stampShow ? "opacity-100 scale-100 -rotate-10" : "opacity-0 scale-150 -rotate-24"
          }`}
        >
          <svg viewBox="0 0 120 120" className="w-full h-full" style={{ animation: "petbadge-spin 24s linear infinite" }}>
            <defs><path id="cir" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>
            <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="4"/>
            <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="2" opacity=".75"/>
            <text fontSize="10" letterSpacing="2.2" fontWeight="900" fill="currentColor"><textPath href="#cir">OFFICIAL PET IDENTITY ✦ PAW &amp; CLAW ✦ </textPath></text>
            <text x="60" y="55" textAnchor="middle" fontSize="12" fontWeight="900" fill="currentColor">PET ID</text>
            <text x="60" y="72" textAnchor="middle" fontSize="16" fontWeight="900" fill="currentColor">CRY</text>
            <text x="60" y="85" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor">2026</text>
          </svg>
        </div>
      </div>
      
      <h2 className="relative mt-14 text-2xl font-black uppercase tracking-wide">{t("petbadge.analysis.title")}</h2>
      <p className="relative mt-5 text-base font-bold text-[#4a4a4a]">{t("petbadge.analysis.sub")}</p>
      
      <div className="relative mt-6 w-[min(360px,100%)] h-4 rounded-lg bg-white border-4 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
        <div className="h-full bg-[#ff3333] transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
      
      <div className="relative mt-4 text-3xl font-black text-[#ff3333]">{pct}%</div>
      
      <p className="relative mt-6 w-[min(360px,100%)] text-sm font-bold leading-relaxed text-[#4a4a4a] min-h-[3.6em]">
        {t(`petbadge.fact.${factIdx}`)}
      </p>
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
    <div className="relative">
      <HalftoneBg />
      
      <h1 className="relative font-black uppercase tracking-wide text-3xl">{t("petbadge.register.title")}</h1>
      <p className="relative mt-2 text-lg font-bold text-[#4a4a4a]">{t("petbadge.register.sub")}</p>

      <div className="relative mt-6">
        <BadgeClip />
        <div className="relative rounded-lg border-4 border-[#1a1a1a] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <HalftoneBg className="rounded-lg" />
          
          <div className="relative flex items-center gap-2 pb-2">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">🐾 PAW &amp; CLAW CORP.</span>
            <span className="relative ml-auto inline-flex items-center gap-2 border-4 border-[#1a1a1a] bg-[#ffcc00] px-3 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
              <span className="w-2 h-2 rounded-full bg-[#ff3333]" />{t("petbadge.register.wait")}
            </span>
          </div>
          
          <div className="relative text-center text-2xl font-black uppercase tracking-wider my-4">{t("petbadge.register.mystery")}</div>
          
          <div className="relative flex flex-col items-center gap-4">
            <img src={avatar} alt="Candidate photo" className="w-48 h-40 object-cover rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]" />
            <span className="border-4 border-[#1a1a1a] bg-[#ffcc00] px-4 py-2 text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">{t("petbadge.register.pending")}</span>
          </div>
          
          <div className="relative mt-2 text-center text-xs font-black uppercase tracking-widest">{t("petbadge.register.no")}</div>
          
          <div className="relative mt-5 border-4 border-[#1a1a1a] bg-[#f5f5f5] rounded-lg p-5 text-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
            <div className="text-lg font-black uppercase tracking-wider">{t("petbadge.register.mystery")}</div>
            <div className="mt-2 text-sm font-bold text-[#666]">{t("petbadge.register.wait")}</div>
          </div>
        </div>
      </div>

      <input
        className="relative mt-6 w-full rounded-lg border-4 border-[#1a1a1a] bg-white px-5 py-4 text-base font-bold outline-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] focus:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] placeholder:text-[#999] placeholder:font-black placeholder:uppercase placeholder:tracking-wider transition-all duration-100"
        maxLength={8}
        placeholder={t("petbadge.register.namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onNext(name || t(`petbadge.name.${rnd(0, 23)}`));
        }}
      />

      <div className="relative mt-8 flex gap-3">
        <ComicButton onClick={randName} variant="secondary" className="h-14 flex-1">
          {t("petbadge.register.randName")}
        </ComicButton>
        <ComicButton onClick={() => onNext(name || t(`petbadge.name.${rnd(0, 23)}`))} variant="dark" className="h-14 flex-[1.7]">
          {t("petbadge.register.finish")}
        </ComicButton>
      </div>
      
      <p className="relative mt-8 text-center text-xs font-black uppercase tracking-[.22em]">{t("petbadge.register.foot")}</p>
    </div>
  );
}

/* ==================== Badge Screen ==================== */

const THEME_BG: Record<Theme, string> = {
  ins: "",
  cute: "bg-[#fff0f5]",
  y2k: "bg-[#f0f0ff]",
  cyber: "bg-[#475569]",
  biz: "bg-[#f5f5f0]",
  hk: "bg-[#fff8e6]",
};

const THEME_CARD: Record<Theme, string> = {
  ins: "bg-white text-[#1a1a1a]",
  cute: "bg-[#fff0f5] text-[#1a1a1a]",
  y2k: "bg-[#f0f0ff] text-[#1a1a1a]",
  cyber: "bg-[#475569] text-[#33ff66]",
  biz: "bg-[#f5f5f0] text-[#1a1a1a]",
  hk: "bg-[#fff8e6] text-[#1a1a1a]",
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
  const [shareOpen, setShareOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

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
  const rank = avg > 82 ? "★★★" : avg > 64 ? "★★" : "★";
  const labels = RLBL_KEYS.map((k) => t(k));

  return (
    <div className={`min-h-dvh transition-colors duration-100`}>
      <HalftoneBg />
      <div className="relative flex flex-col items-center">
        <div ref={badgeRef} className="relative">
          <BadgeClip />
          <div
            className={`relative rounded-lg border-4 border-[#1a1a1a] p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-colors duration-100 ${THEME_CARD[theme]}`}
          >
            <HalftoneBg className="rounded-lg" />
            
            <div className="relative text-xs font-black uppercase tracking-[.26em] px-1">
              {t("petbadge.badge.identity")} {new Date().getFullYear()}
            </div>
            <div className="relative h-1 my-3 bg-[#1a1a1a]" />
            <div className="relative flex items-center gap-2 px-1">
              <span className="text-base">🐾</span>
              <span className="relative uppercase text-sm font-black tracking-widest">PAW &amp; CLAW CORP.</span>
              <span className="relative ml-auto border-4 border-[#1a1a1a] bg-[#33cc33] px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                {t("petbadge.badge.official入职")}
              </span>
            </div>

            <div className="relative flex gap-4 mt-5 items-stretch">
              <div className="relative flex-none w-32">
                <img src={avatar} alt="Employee photo" className="w-32 h-32 object-cover rounded-lg block border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]" />
                <span className="absolute right-[-14px] bottom-2 rounded-lg border-4 border-[#1a1a1a] bg-[#ff3333] px-2 py-1 text-[10px] font-black uppercase tracking-wider -rotate-12 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                  {t("petbadge.badge.official")}
                </span>
              </div>
              <div className="relative flex-1 flex flex-col pb-4 border-b-4 border-[#1a1a1a] min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xl font-black uppercase tracking-wider leading-tight break-all">{name}</span>
                  <span className="border-4 border-[#1a1a1a] rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                    {t("petbadge.badge.staff")} {rank}
                  </span>
                </div>
                <div className="mt-2 text-xs font-black tracking-wider whitespace-nowrap">
                  NO．<b>{no}</b>
                </div>
                <div className="mt-auto pt-3 text-xl font-black uppercase tracking-wider">{job}</div>
              </div>
            </div>

            <div className="relative mt-4 rounded-lg border-4 border-[#1a1a1a] p-3 grid grid-cols-[1.1fr_1fr] gap-3 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
              <div className="relative flex items-center justify-center">
                <div className="relative w-full" dangerouslySetInnerHTML={{ __html: RadarSVG({ vals, labels }) }} />
              </div>
              <div className="relative flex flex-col gap-3 rounded-lg border-4 border-[#1a1a1a] p-3 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] bg-white">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest">{t("petbadge.badge.hr")}</div>
                  <div className="mt-1 text-sm font-black leading-tight tracking-wide">{hr}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest">{t("petbadge.badge.pay")}</div>
                  <div className="mt-1 text-sm font-black leading-tight tracking-wide">{pay}</div>
                </div>
              </div>
            </div>

            <div className="relative mt-4 pt-4 border-t-4 border-[#1a1a1a] flex items-center gap-4">
              <div className="relative flex-none w-12 h-12 rounded-full border-4 border-dashed border-[#ff3333] flex items-center justify-center -rotate-12 text-[#ff3333]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <ellipse cx="7.2" cy="8.2" rx="2.1" ry="2.8"/><ellipse cx="16.8" cy="8.2" rx="2.1" ry="2.8"/>
                  <ellipse cx="3.8" cy="13" rx="1.9" ry="2.4"/><ellipse cx="20.2" cy="13" rx="1.9" ry="2.4"/>
                  <path d="M12 11.2c3.1 0 5.6 2.5 5.6 5.1 0 2.1-1.7 3.2-3.3 2.6-1.5-.5-3.1-.5-4.6 0-1.6.6-3.3-.5-3.3-2.6 0-2.6 2.5-5.1 5.6-5.1z"/>
                </svg>
              </div>
              <div className="relative flex-1 min-w-0">
                <div dangerouslySetInnerHTML={{ __html: BarcodeSVG({ seed: no }) }} />
                <div className="relative mt-2 text-right text-xs font-black tracking-[.3em]">{code}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-3 w-[min(352px,100%)]">
          {THEME_KEYS.map(([key, labelKey]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`relative rounded-lg border-4 border-[#1a1a1a] cursor-pointer font-black uppercase text-sm py-3 px-1 transition-all duration-100 whitespace-nowrap shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${
                theme === key
                  ? "bg-[#ff3333] text-white"
                  : "bg-white text-[#1a1a1a]"
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="relative mt-5 flex gap-3 w-[min(352px,100%)]">
          {/* TODO: Pin to Wall - 暂时隐藏，后续考虑功能
          <ComicButton variant="dark" className="h-14 flex-1">
            {t("petbadge.badge.wall")}
          </ComicButton>
          */}
          <button
            onClick={() => setShareOpen(true)}
            className="relative h-14 flex-1 rounded-lg border-4 border-[#1a1a1a] bg-white text-base font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100 flex items-center justify-center gap-2"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>
            {t("petbadge.badge.share")}
          </button>
        </div>
        
        <div className="relative mt-5 text-center">
          <button
            onClick={onAgain}
            className="border-0 bg-transparent text-[#3366ff] text-sm font-black uppercase tracking-wider underline decoration-dotted cursor-pointer"
          >
            {t("petbadge.badge.again")}
          </button>
        </div>
      </div>
      <Suspense>
        <ShareModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          text={name ? `我的宠物「${name}」入职了！岗位：${job}` : "看看你家宠物适合什么岗位？"}
          captureRef={badgeRef}
          fileName={`petbadge-${name || "share"}.png`}
        />
      </Suspense>
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
      `}</style>
      <div className="relative max-w-[470px] mx-auto min-h-dvh border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-x-clip">
        <HalftoneBg />
        <div className="relative p-6 min-h-dvh">
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
