import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { BadgeClip, todayStr } from "./helpers";

export function UploadScreen({
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
        <Badge variant="secondary" className="bg-[#F6EBDB] text-[#A3835B] px-4 py-[9px] text-[13.5px] font-bold">
          {t("petbadge.upload.privacy")}
        </Badge>
      </div>

      <div className="relative mt-[22px]">
        <BadgeClip />
        <div className="relative rounded-[26px] bg-white p-[22px_20px_24px] shadow-[0_30px_60px_-24px_rgba(160,95,45,.35)]">
          <div className="flex justify-between items-center gap-[10px] py-[2px] px-1 pb-[14px]">
            <span className="text-[12.5px] text-[#6E8CA0] flex items-center gap-[6px]">🐾 <b>PET BADGE · CANDIDATE</b></span>
            <span className="text-[12.5px] text-[#8FA3B2] tracking-[.08em] font-semibold">PCP-{todayStr()}-001</span>
          </div>

          <div
            className={`mt-[6px] rounded-[20px] border-2 border-dashed bg-[#FDf7ee] p-[34px_18px_30px] flex flex-col items-center gap-4 ${
              hasImage ? "border-solid border-[#EBD9C2] !p-3" : "border-[#D9BFA2]"
            }`}
          >
            {hasImage && avatar ? (
              <img src={avatar} alt="Preview" className="w-full aspect-[1/.92] object-cover rounded-[14px] block" />
            ) : (
              <>
                <div className="flex items-center gap-[14px] text-[#A78358]">
                  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
                    <rect x="6" y="16" width="38" height="30" rx="7"/><circle cx="25" cy="31" r="8.5"/><path d="M14 16 l4 -6 h14 l4 6"/><circle cx="39" cy="24" r="1.6" fill="currentColor"/>
                    <g transform="translate(40 26)"><circle cx="6" cy="4" r="2.6"/><circle cx="13" cy="3" r="2.6"/><circle cx="19.5" cy="6" r="2.4"/><circle cx="8" cy="11" r="2.5"/><circle cx="15" cy="11.5" r="2.4"/></g>
                  </svg>
                </div>
                <Button
                  onClick={() => fileRef.current?.click()}
                  className="h-[52px] rounded-full bg-gradient-to-br from-[#C17248] to-[#A65A34] px-[30px] text-[16.5px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(166,90,52,.6),inset_0_1px_0_rgba(255,255,255,.25)] active:scale-[.96] transition-transform"
                >
                  {t("petbadge.upload.pick")}
                </Button>
                <span className="text-[14.5px] font-semibold text-[#B29A7E]">{t("petbadge.upload.format")}</span>
              </>
            )}
          </div>

          {hasImage && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="h-[44px] rounded-full px-[22px] text-[14.5px] bg-white text-[#C17248] shadow-[inset_0_0_0_1.5px_#E3C7AC] active:scale-[.96] transition-transform"
              >
                {t("petbadge.upload.retake")}
              </Button>
            </div>
          )}

          <div className="mt-[14px] text-center">
            <Button
              variant="link"
              onClick={() => fileRef.current?.click()}
              className="text-[#B08968] text-[13.5px] font-bold underline decoration-dotted"
            >
              {t("petbadge.upload.change")}
            </Button>
          </div>
        </div>
      </div>

      {hasImage && (
        <div className="mt-[18px] rounded-[14px] bg-[#E7F4E4] p-[13px_16px] text-[14.5px] font-extrabold text-[#3E7C46] flex gap-2 items-center justify-center">
          {t("petbadge.upload.ok")}
        </div>
      )}

      <h2 className="mt-[26px] mb-3 text-center text-[17px] font-black text-[#8A6B4C] tracking-[.12em]">{t("petbadge.upload.guide")}</h2>
      <div className="flex gap-[9px] flex-wrap justify-center">
        <span className="rounded-xl bg-white px-[13px] py-[9px] text-[13.5px] font-extrabold text-[#3A4656] shadow-[0_6px_14px_-8px_rgba(150,100,60,.35),inset_0_0_0_1px_rgba(150,110,70,.06)]">{t("petbadge.upload.tip1")}</span>
        <span className="rounded-xl bg-white px-[13px] py-[9px] text-[13.5px] font-extrabold text-[#3A4656] shadow-[0_6px_14px_-8px_rgba(150,100,60,.35),inset_0_0_0_1px_rgba(150,110,70,.06)]">{t("petbadge.upload.tip2")}</span>
        <span className="rounded-xl bg-[#FDF1EE] px-[13px] py-[9px] text-[13.5px] font-extrabold text-[#D8402C] shadow-[0_6px_14px_-8px_rgba(150,100,60,.35),inset_0_0_0_1px_rgba(150,110,70,.06)]">{t("petbadge.upload.tip3")}</span>
      </div>

      <div className="mt-[26px] flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-[58px] flex-1 rounded-full bg-white text-[17.5px] font-bold text-[#2F3E4E] shadow-[0_8px_20px_-10px_rgba(150,100,60,.35),inset_0_0_0_1px_rgba(150,110,70,.08)] active:scale-[.96] transition-transform"
        >
          {t("petbadge.upload.back")}
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasImage}
          className="h-[58px] flex-[1.7] rounded-full bg-gradient-to-br from-[#C17248] to-[#A65A34] text-[17.5px] font-bold text-white shadow-[0_12px_24px_-10px_rgba(166,90,52,.6),inset_0_1px_0_rgba(255,255,255,.25)] disabled:opacity-45 disabled:pointer-events-none disabled:saturate-[.6] active:scale-[.96] transition-transform"
        >
          {t("petbadge.upload.analyze")}
        </Button>
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
