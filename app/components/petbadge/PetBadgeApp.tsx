import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { type Screen, type Theme, rnd, todayStr, RLBL_KEYS, THEME_BG, THEME_CARD, THEME_KEYS, RadarSVG, BarcodeSVG, BadgeClip } from "./helpers";
import { LandingScreen } from "./LandingScreen";
import { UploadScreen } from "./UploadScreen";
import { AnalysisScreen } from "./AnalysisScreen";

const ShareModal = lazy(() =>
  import("~/components/share/ShareModal").then((m) => ({ default: m.ShareModal }))
);



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
        <div className="relative rounded-[26px] bg-white p-[22px_20px_24px] shadow-[0_30px_60px_-24px_rgba(160,95,45,.35)]">
          <div className="flex items-center gap-2 pb-[6px]">
            <span className="flex items-center gap-2 text-[13px] text-[#3A4656]">🐾 <span className="uppercase font-bold tracking-[.22em] text-[13px]">PAW &amp; CLAW CORP.</span></span>
            <span className="ml-auto inline-flex items-center gap-[7px] rounded-full bg-[#FDEBDD] px-3 py-[7px] text-[12.5px] font-extrabold text-[#D95B2B]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#F4562C]" />{t("petbadge.register.wait")}
            </span>
          </div>
          <div className="text-center text-[27px] font-black my-4 tracking-[.06em]">{t("petbadge.register.mystery")}</div>
          <div className="flex flex-col items-center gap-[14px]">
            <img src={avatar} alt="Candidate photo" className="w-[210px] h-[170px] object-cover rounded-[18px] shadow-[0_18px_36px_-16px_rgba(160,95,45,.5)]" />
            <span className="border-[1.5px] border-[#F08A4B] text-[#E06A2B] bg-[#FFF9F3] rounded-xl px-4 py-2 text-[14.5px] font-black tracking-[.1em]">{t("petbadge.register.pending")}</span>
          </div>
          <div className="mt-[2px] text-center text-[13.5px] text-[#9AA6B1] tracking-[.16em] font-bold">{t("petbadge.register.no")}</div>
          <div className="mt-[18px] bg-[#F6EEE3] rounded-[16px] p-[18px_16px] text-center">
            <div className="text-[18px] font-black text-[#3A4656]">{t("petbadge.register.mystery")}</div>
            <div className="mt-2 text-[14.5px] font-semibold text-[#8A97A2]">{t("petbadge.register.wait")}</div>
          </div>
        </div>
      </div>

      <input
        className="mt-[24px] w-full border-[1.5px] border-[#E8D5BD] bg-[#FFFDF9] rounded-[18px] px-5 py-[17px] text-[16.5px] font-bold text-[#2F3E4E] outline-none shadow-[0_10px_24px_-16px_rgba(150,100,60,.4)] placeholder:text-[#B4A28C] placeholder:font-semibold focus:border-[#E8A06B]"
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
          className="h-[58px] flex-1 rounded-full bg-white text-[17.5px] font-bold text-[#2F3E4E] shadow-[0_8px_20px_-10px_rgba(150,100,60,.35),inset_0_0_0_1px_rgba(150,110,70,.08)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.register.randName")}
        </button>
        <button
          onClick={() => onNext(name || t(`petbadge.name.${rnd(0, 23)}`))}
          className="h-[58px] flex-[1.7] rounded-full bg-[#26262B] text-[17.5px] font-bold text-white shadow-[0_14px_26px_-12px_rgba(30,30,35,.55)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.register.finish")}
        </button>
      </div>
      <p className="mt-[30px] text-center text-[12px] text-[#C09A78] uppercase tracking-[.22em] font-bold">{t("petbadge.register.foot")}</p>
    </div>
  );
}

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
    <div
      className="min-h-dvh transition-colors duration-500"
    >
      <div className="flex flex-col items-center">
        <div ref={badgeRef} className="relative">
          <BadgeClip />
            <div
              className={`relative rounded-[26px] p-[24px_20px_22px] shadow-[0_30px_60px_-24px_rgba(160,95,45,.35)] transition-colors duration-500 ${
                THEME_CARD[theme] || "bg-white text-[#33424E]"
              } ${theme === "hk" ? "border-2 border-[rgba(196,55,43,.35)] rounded-[20px] relative" : ""}`}
              style={theme === "y2k" ? { background: "linear-gradient(160deg,#EFECFF,#DFF2FF 55%,#FDE9F6)" } : undefined}
            >
            {theme === "hk" && <div className="absolute inset-[7px] border-2 border-[rgba(196,55,43,.35)] rounded-[20px] pointer-events-none" />}

            <div className="text-[12px] tracking-[.26em] font-extrabold px-1" style={{ color: theme === "ins" ? "#9AA6B1" : undefined }}>
              {t("petbadge.badge.identity")} {new Date().getFullYear()}
            </div>
            <div className="h-px my-3" style={{ background: theme === "ins" ? "#EAE2D6" : undefined }} />
            <div className="flex items-center gap-[7px] px-[2px]">
              <span className="text-[15px]" style={{ color: theme === "ins" ? "#E2603F" : undefined }}>🐾</span>
              <span className="uppercase text-[14.5px] font-bold tracking-[.14em]" style={{ letterSpacing: ".14em" }}>PAW &amp; CLAW CORP.</span>
              <span
                className="ml-auto rounded-full px-[14px] py-[7px] text-[13px] font-extrabold tracking-[.06em]"
                style={{
                  background: theme === "ins" ? "#E9F2E3" : undefined,
                  color: theme === "ins" ? "#4A8A4F" : undefined,
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
                    color: theme === "cyber" ? "#FF5C7A" : "#E2482E",
                    border: `2px solid ${theme === "cyber" ? "#FF5C7A" : "#E2482E"}`,
                  }}
                >
                  {t("petbadge.badge.official")}
                </span>
              </div>
              <div className="flex-1 flex flex-col pb-[14px] border-b-[1.5px] min-w-0" style={{ borderColor: theme === "ins" ? "#EAE2D6" : undefined }}>
                <div className="flex items-center gap-[9px] flex-wrap">
                  <span className="text-[33px] font-black tracking-[.03em] leading-[1.15] break-all">{name}</span>
                  <span
                    className="border-[1.5px] rounded-[8px] px-[7px] py-[3px] text-[11px] font-extrabold tracking-[.08em] whitespace-nowrap"
                    style={{
                      borderColor: theme === "ins" ? "#9AA6B1" : undefined,
                      color: theme === "ins" ? "#9AA6B1" : undefined,
                    }}
                  >
                    {t("petbadge.badge.staff")} {rank}
                  </span>
                </div>
                <div className="mt-[9px] text-[12px] tracking-[.09em] font-bold whitespace-nowrap" style={{ color: theme === "ins" ? "#9AA6B1" : undefined }}>
                  NO．<b style={{ color: theme === "ins" ? undefined : "inherit" }}>{no}</b>
                </div>
                <div className="mt-auto pt-3 text-[20.5px] font-black tracking-[.05em]">{job}</div>
              </div>
            </div>

            <div
              className="mt-4 rounded-[18px] p-3 grid grid-cols-[1.1fr_1fr] gap-[10px]"
              style={{ background: theme === "ins" ? "#F5EEE3" : undefined }}
            >
              <div className="flex items-center justify-center">
                <div className="w-full" style={{ color: theme === "ins" ? "#9AA6B1" : undefined }} dangerouslySetInnerHTML={{ __html: RadarSVG({ vals, labels }) }} />
              </div>
              <div
                className="flex flex-col gap-[10px] rounded-[14px] p-3 shadow-[0_6px_16px_-12px_rgba(60,50,40,.35)]"
                style={{ background: theme === "ins" ? "#fff" : undefined }}
              >
                <div>
                  <div className="text-[10.5px] tracking-[.16em] font-extrabold" style={{ color: theme === "ins" ? "#9AA6B1" : undefined }}>{t("petbadge.badge.hr")}</div>
                  <div className="mt-[5px] text-[14.5px] font-extrabold leading-[1.55] tracking-[.02em]">{hr}</div>
                </div>
                <div>
                  <div className="text-[10.5px] tracking-[.16em] font-extrabold" style={{ color: theme === "ins" ? "#9AA6B1" : undefined }}>{t("petbadge.badge.pay")}</div>
                  <div className="mt-[5px] text-[14.5px] font-extrabold leading-[1.55] tracking-[.02em]">{pay}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-[14px] border-t-[1.5px] flex items-center gap-[14px]" style={{ borderColor: theme === "ins" ? "#EAE2D6" : undefined }}>
              <div
                className="flex-none w-[52px] h-[52px] rounded-full border-2 border-dashed flex items-center justify-center -rotate-[12deg] opacity-85"
                style={{ borderColor: theme === "ins" ? "#E2603F" : undefined, color: theme === "ins" ? "#E2603F" : undefined }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <ellipse cx="7.2" cy="8.2" rx="2.1" ry="2.8"/><ellipse cx="16.8" cy="8.2" rx="2.1" ry="2.8"/>
                  <ellipse cx="3.8" cy="13" rx="1.9" ry="2.4"/><ellipse cx="20.2" cy="13" rx="1.9" ry="2.4"/>
                  <path d="M12 11.2c3.1 0 5.6 2.5 5.6 5.1 0 2.1-1.7 3.2-3.3 2.6-1.5-.5-3.1-.5-4.6 0-1.6.6-3.3-.5-3.3-2.6 0-2.6 2.5-5.1 5.6-5.1z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ color: theme === "ins" ? "#33424E" : undefined }}><div dangerouslySetInnerHTML={{ __html: BarcodeSVG({ seed: no }) }} /></div>
                <div className="mt-[6px] text-right text-[12.5px] tracking-[.3em] font-extrabold" style={{ color: theme === "ins" ? "#9AA6B1" : undefined }}>{code}</div>
              </div>
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
                  ? "bg-gradient-to-br from-[#FF7A3D] to-[#FF9D4D] text-white shadow-[0_12px_24px_-8px_rgba(247,140,60,.6),inset_0_1px_0_rgba(255,255,255,.4)]"
                  : "bg-white text-[#3A4656] shadow-[0_8px_18px_-10px_rgba(150,100,60,.4),inset_0_0_0_1px_rgba(150,110,70,.06)]"
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-[22px] flex gap-3 w-[min(352px,100%)]">
          <button className="h-[58px] flex-1 rounded-full bg-[#26262B] text-[17.5px] font-bold text-white shadow-[0_14px_26px_-12px_rgba(30,30,35,.55)] active:scale-[.96] transition-transform">
            {t("petbadge.badge.wall")}
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="h-[58px] flex-1 rounded-full bg-white text-[17.5px] font-bold text-[#2F3E4E] shadow-[0_8px_20px_-10px_rgba(150,100,60,.35),inset_0_0_0_1px_rgba(150,110,70,.08)] active:scale-[.96] transition-transform flex items-center justify-center gap-2"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>
            {t("petbadge.badge.share")}
          </button>
        </div>
        <div className="mt-[22px] text-center">
          <button
            onClick={onAgain}
            className="border-0 bg-transparent text-[#B08968] text-[13.5px] font-bold underline decoration-dotted cursor-pointer"
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
      <div className="max-w-[470px] mx-auto min-h-dvh relative overflow-x-clip bg-white" style={{ boxShadow: "0 0 0 1px rgba(150,100,60,.08),0 40px 90px -40px rgba(150,90,40,.35)" }}>
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
