import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { BadgeClip, rnd } from "./helpers";

export function RegisterScreen({
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

      <Input
        className="mt-[24px] h-auto border-[1.5px] border-[#E8D5BD] bg-[#FFFDF9] rounded-[18px] px-5 py-[17px] text-[16.5px] font-bold text-[#2F3E4E] shadow-[0_10px_24px_-16px_rgba(150,100,60,.4)] placeholder:text-[#B4A28C] placeholder:font-semibold focus:border-[#E8A06B]"
        maxLength={8}
        placeholder={t("petbadge.register.namePlaceholder")}
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onNext(name || t(`petbadge.name.${rnd(0, 23)}`));
        }}
      />

      <div className="mt-[30px] flex gap-3">
        <Button
          variant="outline"
          onClick={randName}
          className="h-[58px] flex-1 rounded-full bg-white text-[17.5px] font-bold text-[#2F3E4E] shadow-[0_8px_20px_-10px_rgba(150,100,60,.35),inset_0_0_0_1px_rgba(150,110,70,.08)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.register.randName")}
        </Button>
        <Button
          onClick={() => onNext(name || t(`petbadge.name.${rnd(0, 23)}`))}
          className="h-[58px] flex-[1.7] rounded-full bg-[#26262B] text-[17.5px] font-bold text-white shadow-[0_14px_26px_-12px_rgba(30,30,35,.55)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.register.finish")}
        </Button>
      </div>
      <p className="mt-[30px] text-center text-[12px] text-[#C09A78] uppercase tracking-[.22em] font-bold">{t("petbadge.register.foot")}</p>
    </div>
  );
}
