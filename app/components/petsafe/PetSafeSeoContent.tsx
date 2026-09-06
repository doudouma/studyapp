import { useTranslation } from "react-i18next";
import { ShieldAlert, QrCode, FileImage, Share2, Clock, Lock, Smartphone, PawPrint } from "lucide-react";
import { BASE_URL } from "~/lib/seo";
import { PETSAFE_FAQ_KEYS } from "./petsafe-constants";

const features = [
  { icon: FileImage, key: "poster", color: "#ff3333" },
  { icon: QrCode, key: "qr", color: "#3366ff" },
  { icon: Share2, key: "copy", color: "#33cc33" },
  { icon: Clock, key: "guide", color: "#ffcc00" },
  { icon: Lock, key: "privacy", color: "#33cc33" },
  { icon: Smartphone, key: "finder", color: "#3366ff" },
];


export default function PetSafeSeoContent() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-kuaile text-[#1a1a1a]">
      {/* Hero / Intro */}
      <section className="bg-white border-4 border-[#1a1a1a] shadow-[8px_8px_0_rgba(26,26,26,1)] p-6 sm:p-8 mb-8">
        <p className="text-[#ff3333] font-black uppercase text-sm tracking-wider mb-2">{t("petsafe.seo.tagline")}</p>
        <h2 className="font-['Bangers',cursive] text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
          {t("petsafe.seo.heroTitle")}
        </h2>
        <p className="text-[#4a4a4a] font-bold text-base sm:text-lg leading-relaxed max-w-2xl">
          {t("petsafe.seo.heroDesc")}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {(["noServer", "noSignup", "noWatermark", "free", "noSubscription"] as const).map((key) => (
            <span key={key} className="border-4 border-[#1a1a1a] bg-[#ffcc00] shadow-[4px_4px_0_rgba(26,26,26,1)] px-3 py-1.5 text-xs font-black uppercase">
              {t(`petsafe.seo.pill.${key}`)}
            </span>
          ))}
        </div>
      </section>

      {/* What It Is */}
      <section className="mb-8">
        <h2 className="font-['Bangers',cursive] text-2xl sm:text-3xl mb-4">{t("petsafe.seo.whatIsTitle")}</h2>
        <div className="bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0_rgba(26,26,26,1)] p-5">
          <p className="font-bold text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: t("petsafe.seo.whatIsDesc") }} />
        </div>
      </section>

      {/* Features */}
      <section className="mb-8">
        <h2 className="font-['Bangers',cursive] text-2xl sm:text-3xl mb-4">{t("petsafe.seo.featuresTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, key, color }, i) => (
            <div key={key} className="bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0_rgba(26,26,26,1)] p-4">
              <span className="font-['Bangers',cursive] text-3xl" style={{ color }}>{`F${i + 1}`}</span>
              <h3 className="font-bold text-base mt-1 mb-1">{t(`petsafe.seo.feature.${key}.title`)}</h3>
              <p className="text-[13px] font-semibold text-[#4a4a4a] leading-snug">{t(`petsafe.seo.feature.${key}.desc`)}</p>
              <span className="block mt-2 text-[11px] font-black uppercase text-[#3366ff]">{t(`petsafe.seo.feature.${key}.pain`)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-8">
        <h2 className="font-['Bangers',cursive] text-2xl sm:text-3xl mb-4">{t("petsafe.seo.howTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["snap", "generate", "recover"] as const).map((key, i) => (
            <div key={key} className="bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0_rgba(26,26,26,1)] p-4 relative pl-14">
              <span className="absolute left-3 top-3 w-8 h-8 bg-[#ff3333] text-white border-2 border-[#1a1a1a] flex items-center justify-center font-['Bangers',cursive] text-lg">{i + 1}</span>
              <h3 className="font-bold text-sm">{t(`petsafe.seo.step.${key}.title`)}</h3>
              <p className="text-[13px] font-semibold text-[#4a4a4a] mt-1">{t(`petsafe.seo.step.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Q&A */}
      <section className="mb-8">
        <h2 className="font-['Bangers',cursive] text-2xl sm:text-3xl mb-4">{t("petsafe.seo.qaTitle")}</h2>
        <div className="flex flex-col gap-3">
          {PETSAFE_FAQ_KEYS.map((key) => (
            <div key={key} className="bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0_rgba(26,26,26,1)] overflow-hidden">
              <div className="bg-[#1a1a1a] text-[#ffcc00] font-black px-4 py-3 text-sm">
                {t(`petsafe.seo.qa.${key}.q`)}
              </div>
              <div className="px-4 py-3 text-[13px] font-semibold leading-relaxed" dangerouslySetInnerHTML={{ __html: t(`petsafe.seo.qa.${key}.a`) }} />
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Line */}
      <section className="bg-[#ffcc00] border-4 border-[#1a1a1a] shadow-[8px_8px_0_rgba(26,26,26,1)] p-6 text-center">
        <h3 className="font-['Bangers',cursive] text-2xl sm:text-3xl mb-2">{t("petsafe.seo.bottomLine")}</h3>
        <p className="font-bold text-sm sm:text-base max-w-xl mx-auto">{t("petsafe.seo.bottomLineDesc")}</p>
      </section>

      {/* Related Tools */}
      <nav className="mt-8 bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0_rgba(26,26,26,1)] p-5" aria-label="Related tools">
        <h3 className="font-['Bangers',cursive] text-xl mb-3">{t("petsafe.seo.relatedTitle")}</h3>
        <div className="flex flex-wrap gap-3">
          <a href={`${BASE_URL}/petbadge`} className="inline-flex items-center gap-2 border-4 border-[#1a1a1a] bg-[#fffef0] hover:bg-[#ffcc00] shadow-[4px_4px_0_rgba(26,26,26,1)] px-4 py-2 text-sm font-black uppercase transition-colors">
            <PawPrint className="w-4 h-4" />
            {t("petsafe.seo.related.petbadge")}
          </a>
        </div>
      </nav>
    </div>
  );
}
