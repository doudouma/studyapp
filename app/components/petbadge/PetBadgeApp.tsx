import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type Screen } from "./helpers";
import { LandingScreen } from "./LandingScreen";
import { UploadScreen } from "./UploadScreen";
import { AnalysisScreen } from "./AnalysisScreen";
import { RegisterScreen } from "./RegisterScreen";
import { BadgeScreen } from "./BadgeScreen";

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
