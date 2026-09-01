import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";

export function LandingScreen({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center overflow-hidden pt-[5vh]">
      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(226,120,60,.25)] bg-[rgba(255,255,255,.72)] px-5 py-[11px] text-[14px] font-extrabold tracking-[.14em] text-[#D95B2B] shadow-[0_8px_20px_-12px_rgba(220,120,60,.4)] backdrop-blur-sm">
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
      <Button
        onClick={onStart}
        size="lg"
        className="mt-[36px] h-[64px] w-[min(320px,86%)] rounded-full bg-gradient-to-br from-[#FF7A3D] to-[#FF9D4D] text-[21px] font-bold tracking-[.2em] text-white shadow-[0_16px_30px_-10px_rgba(247,140,60,.55),inset_0_1px_0_rgba(255,255,255,.35)] active:scale-[.96] transition-transform"
      >
        {t("petbadge.landing.cta")}
      </Button>
    </div>
  );
}
