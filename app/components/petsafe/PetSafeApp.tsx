import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { uploadPage } from "~/features/pages/api";
import { generatePetLandingHTML } from "./pet-landing-template";
import {
  ShieldAlert,
  PawPrint,
  MapPin,
  Camera,
  FileImage,
  QrCode,
  Share2,
  ListChecks,
  Download,
  Printer,
  BellRing,
  PhoneCall,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Clock,
  Compass,
  Eye,
  Radio,
  BadgeCheck,
  Smartphone,
  Copy,
  Check,
  Lightbulb,
  Lock,
} from "lucide-react";

type Tab = "poster" | "qr" | "copy" | "guide";
type PosterRatio = "a4" | "square" | "story";
type Platform = "xhs" | "nextdoor" | "reddit";

interface PetState {
  name: string;
  breed: string;
  gender: string;
  chipId: string;
  reward: string;
  features: string;
  lostLocation: string;
  lostTime: string;
  ownerName: string;
  ownerPhone: string;
  avatarUrl: string;
  tagMedical: boolean;
  tagTimid: boolean;
  tagReward: boolean;
}

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80";

function makeInitialState(t: (key: string) => string): PetState {
  return {
    name: t("petsafe.sample1.name"),
    breed: t("petsafe.sample1.breed"),
    gender: t("petsafe.sample1.gender"),
    chipId: t("petsafe.sample1.chipId"),
    reward: t("petsafe.sample1.reward"),
    features: t("petsafe.sample1.features"),
    lostLocation: t("petsafe.sample1.lostLocation"),
    lostTime: t("petsafe.sample1.lostTime"),
    ownerName: t("petsafe.sample1.ownerName"),
    ownerPhone: t("petsafe.sample1.ownerPhone"),
    avatarUrl: DEFAULT_AVATAR,
    tagMedical: true,
    tagTimid: true,
    tagReward: true,
  };
}

function makeSampleState(t: (key: string) => string): PetState {
  return {
    name: t("petsafe.sample2.name"),
    breed: t("petsafe.sample2.breed"),
    gender: t("petsafe.sample2.gender"),
    chipId: t("petsafe.sample2.chipId"),
    reward: t("petsafe.sample2.reward"),
    features: t("petsafe.sample2.features"),
    lostLocation: t("petsafe.sample2.lostLocation"),
    lostTime: t("petsafe.sample2.lostTime"),
    ownerName: t("petsafe.sample2.ownerName"),
    ownerPhone: t("petsafe.sample2.ownerPhone"),
    avatarUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80",
    tagMedical: false,
    tagTimid: true,
    tagReward: true,
  };
}

function getCopyTemplate(platform: Platform, s: PetState, t: (key: string) => string): string {
  const phone = s.ownerPhone || "138-xxxx-xxxx";
  const name = s.name || "Pet";

  if (platform === "xhs") {
    return `🚨${t("petsafe.copy.xhs.title")}${name}🚨

${t("petsafe.copy.xhs.line1")}

📌 ${t("petsafe.copy.xhs.breed")}: ${s.breed} (${s.gender})
📌 ${t("petsafe.copy.xhs.features")}: ${s.features}
📌 ${t("petsafe.copy.xhs.chip")}: ${s.chipId}
💰 ${t("petsafe.copy.xhs.reward")}: ${s.reward}

${t("petsafe.copy.xhs.note")}${s.tagMedical ? t("petsafe.copy.xhs.medical") : ""}
📞 ${t("petsafe.copy.xhs.phone")}: ${phone} (${s.ownerName})

${t("petsafe.copy.xhs.hashtags")}`;
  }
  if (platform === "nextdoor") {
    return `【${t("petsafe.copy.nextdoor.title")}】
${t("petsafe.copy.nextdoor.line1")}
• ${t("petsafe.copy.nextdoor.name")}: ${name} (${s.breed})
• ${t("petsafe.copy.nextdoor.location")}: ${s.lostLocation}
• ${t("petsafe.copy.nextdoor.time")}: ${s.lostTime}
• ${t("petsafe.copy.nextdoor.features")}: ${s.features}
• ${t("petsafe.copy.nextdoor.chip")}: ${s.chipId}
• ${t("petsafe.copy.nextdoor.reward")}: ${s.reward}
${t("petsafe.copy.nextdoor.contact")} ${phone}`;
  }
  return `[LOST PET EMERGENCY REPORT] - Reward: ${s.reward}
Pet Name: ${name}
Breed/Color: ${s.breed}
Microchip ID: ${s.chipId}
Last Seen: ${s.lostLocation} at ${s.lostTime}
Distinguishing Marks: ${s.features}
Medical: ${s.tagMedical ? "URGENT DAILY MEDICATION REQUIRED" : "None"}
Contact: ${s.ownerName} at ${phone}
Please do not chase. Safe QR landing: https://pawclaw.safe/p/${s.chipId}`;
}

export default function PetSafeApp() {
  const { t } = useTranslation();
  const [state, setState] = useState<PetState>(() => makeInitialState(t));
  const [tab, setTab] = useState<Tab>("poster");
  const [ratio, setRatio] = useState<PosterRatio>("a4");
  const [platform, setPlatform] = useState<Platform>("xhs");
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [guideChecks, setGuideChecks] = useState<boolean[]>([false, false, false, false, false, false]);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [shareToSquare, setShareToSquare] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const tagQrCanvasRef = useRef<HTMLCanvasElement>(null);

  const update = useCallback((patch: Partial<PetState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const url = generatedUrl || `https://pawclaw.safe/p/${state.chipId}`;
    // Small delay to ensure canvas is in DOM after tab switch
    const timer = setTimeout(() => {
      if (qrCanvasRef.current) {
        QRCode.toCanvas(qrCanvasRef.current, url, {
          width: 64,
          margin: 1,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
      }
      if (tagQrCanvasRef.current) {
        QRCode.toCanvas(tagQrCanvasRef.current, url, {
          width: 80,
          margin: 1,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [generatedUrl, state.chipId, tab]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleExportPoster = async () => {
    if (!posterRef.current) return;
    showToast(t("petsafe.toast.rendering"));
    try {
      const { snapdom } = await import("@zumer/snapdom");
      const blob = await snapdom.toBlob(posterRef.current, {
        type: "png",
        backgroundColor: "#ffffff",
        scale: 3,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lost-pet-poster_${state.name || "Pet"}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t("petsafe.toast.exported"));
    } catch {
      showToast(t("petsafe.toast.exportFailed"));
    }
  };

  const handleCopy = () => {
    const text = getCopyTemplate(platform, state, t);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast(t("petsafe.toast.copied"));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGenerateQR = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const html = generatePetLandingHTML(state, t);
      const blob = new Blob([html], { type: "text/html" });
      const file = new File([blob], "petsafe.html", { type: "text/html" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `PAW&CLAW Safe - ${state.name || "Pet"}`);
      formData.append("category", "petsafe");
      formData.append("tags", "petsafe,qr,lost-pet");
      formData.append("shareToSquare", String(shareToSquare));

      const result = await uploadPage(formData);
      if (result.ok) {
        const d = result as { ok: true; data: { url: string; id: string } };
        const fullUrl = `${window.location.origin}${d.data.url}`;
        setGeneratedUrl(fullUrl);
        showToast(shareToSquare ? t("petsafe.toast.sharedToSquare") : t("petsafe.toast.qrGenerated"));
      } else {
        const errMsg = "error" in result ? result.error : t("petsafe.toast.qrFailed");
        showToast(errMsg || t("petsafe.toast.qrFailed"));
      }
    } catch (e) {
      console.error("QR generation failed:", e);
      showToast(t("petsafe.toast.qrFailed"));
    } finally {
      setGenerating(false);
    }
  };

  const toggleGuideCheck = (idx: number) => {
    setGuideChecks((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const checkedCount = guideChecks.filter(Boolean).length;
  const totalChecks = guideChecks.length;

  const ratioStyles: Record<PosterRatio, { width: string; aspectRatio: string }> = {
    a4: { width: "380px", aspectRatio: "auto" },
    square: { width: "420px", aspectRatio: "1 / 1" },
    story: { width: "340px", aspectRatio: "9 / 16" },
  };

  const tabs: { id: Tab; label: string; icon: typeof FileImage }[] = [
    { id: "poster", label: t("petsafe.tab.poster"), icon: FileImage },
    { id: "qr", label: t("petsafe.tab.qr"), icon: QrCode },
    { id: "copy", label: t("petsafe.tab.copy"), icon: Share2 },
    { id: "guide", label: t("petsafe.tab.guide"), icon: ListChecks },
  ];

  const guideSteps = [
    {
      timeRange: t("petsafe.guide.step1.time"),
      title: t("petsafe.guide.step1.title"),
      color: "bg-[#ff3333] text-white",
      icon: Compass,
      badge: "GO!",
      items: [t("petsafe.guide.step1.item1"), t("petsafe.guide.step1.item2")],
    },
    {
      timeRange: t("petsafe.guide.step2.time"),
      title: t("petsafe.guide.step2.title"),
      color: "bg-[#ffcc00] text-[#1a1a1a]",
      icon: Eye,
      badge: "BAM!",
      items: [t("petsafe.guide.step2.item1"), t("petsafe.guide.step2.item2")],
    },
    {
      timeRange: t("petsafe.guide.step3.time"),
      title: t("petsafe.guide.step3.title"),
      color: "bg-[#3366ff] text-white",
      icon: Radio,
      badge: "48H!",
      items: [t("petsafe.guide.step3.item1"), t("petsafe.guide.step3.item2")],
    },
  ];

  const genderOptions = [
    t("petsafe.form.gender.neuteredMale"),
    t("petsafe.form.gender.neuteredFemale"),
    t("petsafe.form.gender.intactMale"),
    t("petsafe.form.gender.intactFemale"),
    t("petsafe.form.gender.unknown"),
  ];

  const warningTags = [
    ["tagMedical", t("petsafe.form.tagMedical")],
    ["tagTimid", t("petsafe.form.tagTimid")],
    ["tagReward", t("petsafe.form.tagReward")],
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--paper)] font-kuaile text-[#1a1a1a]">
      {/* Header */}
      <header className="bg-[#ffcc00] border-b-4 border-[#1a1a1a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 bg-[#ff3333] border-4 border-[#1a1a1a] shadow-[4px_4px_0_rgba(26,26,26,1)] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bang text-2xl md:text-3xl uppercase tracking-wide leading-none ink-title">PAW&amp;CLAW SAFE</span>
                <span className="bg-[#1a1a1a] text-[#ffcc00] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">{t("petsafe.header.badge")}</span>
              </div>
              <p className="mt-1.5 inline-block bg-white border-4 border-[#1a1a1a] px-2 py-0.5 text-[10px] md:text-[11px] font-bold shadow-[3px_3px_0_rgba(26,26,26,1)]">{t("petsafe.header.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setTab("guide")} className="btn-comic btn-pow px-3 py-2 text-xs hidden sm:inline-flex">
              <Clock className="w-4 h-4" />
              <span>{t("petsafe.header.guide")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Profile Form */}
        <section className="lg:col-span-5 bg-white border-4 border-[#1a1a1a] shadow-[8px_8px_0_rgba(26,26,26,1)] p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2 border-b-4 border-dashed border-[#1a1a1a] pb-3">
            <h2 className="flex items-center gap-2 font-black uppercase tracking-wide text-base md:text-lg">
              <PawPrint className="w-5 h-5 text-[#ff3333]" />
              <span>{t("petsafe.form.title")}</span>
            </h2>
            <button onClick={() => setState(makeInitialState(t))} className="btn-comic px-2 py-1 text-[10px]">
              <span>{t("petsafe.form.reset")}</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4">
              <div
                className="relative group block w-24 h-24 shrink-0 border-4 border-[#1a1a1a] overflow-hidden cursor-pointer bg-[#fffef0] shadow-[4px_4px_0_rgba(26,26,26,1)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={state.avatarUrl} alt="Pet Avatar" className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-[#1a1a1a]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex flex-col items-center justify-center gap-1 text-white text-[10px] font-black uppercase">
                  <Camera className="w-5 h-5" />
                  <span>{t("petsafe.form.changePhoto")}</span>
                </span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div>
                <label className="label-comic">{t("petsafe.form.name")}</label>
                <input type="text" value={state.name} onChange={(e) => update({ name: e.target.value })} className="input-comic" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label-comic">{t("petsafe.form.breed")}</label>
                  <input type="text" value={state.breed} onChange={(e) => update({ breed: e.target.value })} className="input-comic" />
                </div>
                <div>
                  <label className="label-comic">{t("petsafe.form.gender")}</label>
                  <select value={state.gender} onChange={(e) => update({ gender: e.target.value })} className="input-comic">
                    {genderOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            </div>

            {/* Chips & Reward */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-comic">{t("petsafe.form.chipId")}</label>
                <input type="text" value={state.chipId} onChange={(e) => update({ chipId: e.target.value })} className="input-comic font-mono" />
              </div>
              <div>
                <label className="label-comic">{t("petsafe.form.reward")}</label>
                <input type="text" value={state.reward} onChange={(e) => update({ reward: e.target.value })} className="input-comic input-zap font-black" />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="label-comic">{t("petsafe.form.features")}</label>
              <input type="text" value={state.features} onChange={(e) => update({ features: e.target.value })} className="input-comic" />
            </div>

            {/* Warning Tags */}
            <div>
              <span className="label-comic">{t("petsafe.form.tags")}</span>
              <div className="grid grid-cols-3 gap-2">
                {warningTags.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1.5 p-2 bg-[#fffef0] border-4 border-[#1a1a1a] cursor-pointer hover:bg-[#ffcc00] transition-colors duration-100 font-black text-[11px]">
                    <input type="checkbox" checked={state[key]} onChange={(e) => update({ [key]: e.target.checked })} className="chk" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lost Info */}
            <div className="bg-[#ffcc00] border-4 border-[#1a1a1a] shadow-[4px_4px_0_rgba(26,26,26,1)] p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-black uppercase text-xs">
                <MapPin className="w-4 h-4" />
                <span>{t("petsafe.form.lostInfo")}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="label-comic">{t("petsafe.form.lostLocation")}</label>
                  <input type="text" value={state.lostLocation} onChange={(e) => update({ lostLocation: e.target.value })} className="input-comic" />
                </div>
                <div>
                  <label className="label-comic">{t("petsafe.form.lostTime")}</label>
                  <input type="text" value={state.lostTime} onChange={(e) => update({ lostTime: e.target.value })} className="input-comic" />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2">
              <span className="label-comic">{t("petsafe.form.contact")}</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={state.ownerName} onChange={(e) => update({ ownerName: e.target.value })} placeholder={t("petsafe.form.ownerNamePlaceholder")} className="input-comic" />
                <input type="text" value={state.ownerPhone} onChange={(e) => update({ ownerPhone: e.target.value })} placeholder={t("petsafe.form.ownerPhonePlaceholder")} className="input-comic font-mono" />
              </div>
            </div>
          </div>

          <div className="border-t-4 border-dashed border-[#1a1a1a] pt-3 flex items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1 font-bold"><Lock className="w-3.5 h-3.5 text-[#33cc33]" /> {t("petsafe.form.privacy")}</span>
            <span className="bg-[#1a1a1a] text-[#ffcc00] px-2 py-0.5 font-black uppercase text-[10px]">{t("petsafe.form.syncAll")}</span>
          </div>
        </section>

        {/* Right: Tabs & Content */}
        <section className="lg:col-span-7 flex flex-col gap-5 lg:gap-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 md:gap-3" role="tablist">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} role="tab" className={`tab-btn ${tab === t.id ? "tab-btn-active" : ""}`}>
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Poster */}
          {tab === "poster" && (
            <div className="flex flex-col gap-4">
              <div className="no-print bg-white border-4 border-[#1a1a1a] shadow-[4px_4px_0_rgba(26,26,26,1)] p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase">{t("petsafe.poster.ratio")}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {([["a4", t("petsafe.poster.ratioA4")], ["square", t("petsafe.poster.ratioSquare")], ["story", t("petsafe.poster.ratioStory")]] as const).map(([r, label]) => (
                      <button key={r} onClick={() => setRatio(r)} className={`ratio-btn ${ratio === r ? "ratio-btn-active" : ""}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={handleExportPoster} className="btn-comic btn-pow px-3 py-1.5 text-[11px]">
                    <Download className="w-4 h-4" />
                    <span>{t("petsafe.poster.export")}</span>
                  </button>
                  <button onClick={() => window.print()} className="btn-comic px-3 py-1.5 text-[11px]">
                    <Printer className="w-4 h-4" />
                    <span>{t("petsafe.poster.print")}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-center items-start py-2 overflow-auto">
                <div ref={posterRef} className="bg-white text-[#1a1a1a] border-4 border-[#1a1a1a] shadow-[16px_16px_0_rgba(26,26,26,1)] transition-all duration-100 flex flex-col justify-between" style={{ width: ratioStyles[ratio].width, minHeight: ratio === "a4" ? "537px" : undefined, aspectRatio: ratioStyles[ratio].aspectRatio }}>
                  <div className="relative bg-[#ff3333] text-white px-4 py-3 text-center border-b-4 border-[#1a1a1a] overflow-hidden">
                    <div className="absolute inset-0 halftone opacity-10 pointer-events-none" />
                    <div className="relative flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black uppercase tracking-wider ink-stroke">
                      <AlertTriangle className="w-7 h-7" />
                      <span>{t("petsafe.poster.emergency")}</span>
                    </div>
                    {state.tagReward && state.reward && (
                      <div className="relative inline-block bg-[#ffcc00] text-[#1a1a1a] border-4 border-[#1a1a1a] px-3 py-0.5 mt-2 text-sm font-black uppercase shadow-[3px_3px_0_rgba(26,26,26,1)]">{t("petsafe.poster.reward")} {state.reward}</div>
                    )}
                  </div>
                  <div className="action-lines h-2 border-b-4 border-[#1a1a1a]" />
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="relative w-full aspect-[4/3] overflow-hidden border-4 border-[#1a1a1a] bg-[#fffef0]">
                      <img src={state.avatarUrl} alt="Lost Pet" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
                        {state.tagMedical && <span className="px-2 py-0.5 text-[11px] font-black uppercase bg-[#ff3333] text-white ink-stroke-sm shadow-[3px_3px_0_rgba(26,26,26,1)]">{t("petsafe.form.tagMedical")}</span>}
                        {state.tagTimid && <span className="px-2 py-0.5 text-[11px] font-black uppercase bg-[#ffcc00] text-[#1a1a1a] shadow-[3px_3px_0_rgba(26,26,26,1)]">{t("petsafe.form.tagTimid")}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <div className="flex items-baseline justify-between gap-2 border-b-4 border-[#1a1a1a] pb-1.5">
                        <span className="font-bang text-xl uppercase tracking-wide">{state.name || t("petsafe.poster.unnamed")}</span>
                        <span className="text-[11px] font-black uppercase text-right">{state.breed} / {state.gender}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] font-bold leading-snug">
                        <p><span className="font-black uppercase">{t("petsafe.poster.feature")}</span> {state.features || t("petsafe.poster.featureEmpty")}</p>
                        <p><span className="font-black uppercase bg-[#ffcc00] px-1">{t("petsafe.poster.location")}</span> <span className="font-black">{state.lostLocation || t("petsafe.poster.locationEmpty")}</span></p>
                        <p><span className="font-black uppercase">{t("petsafe.poster.time")}</span> {state.lostTime || t("petsafe.poster.timeEmpty")}</p>
                        <p className="text-[10px] text-[#4a4a4a]"><span className="font-black text-[#1a1a1a]">{t("petsafe.poster.chip")}</span> <span className="font-mono font-bold">{state.chipId || t("petsafe.poster.chipEmpty")}</span></p>
                      </div>
                    </div>
                    <div className="mt-auto bubble tail-t bg-white px-3 py-2.5 flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="text-[11px] font-black uppercase">{t("petsafe.poster.contactHint")}</div>
                        <div className="inline-block self-start bg-[#ff3333] text-white ink-stroke px-2 py-0.5 text-lg font-black tracking-tight font-mono">{state.ownerPhone || t("petsafe.poster.phoneEmpty")}</div>
                        <div className="text-[10px] font-bold text-[#4a4a4a]">{t("petsafe.poster.ownerPrefix")}{state.ownerName || t("petsafe.poster.ownerEmpty")}</div>
                      </div>
                      <div className="flex flex-col items-center shrink-0">
                        <div className="bg-white border-4 border-[#1a1a1a] p-1"><canvas ref={qrCanvasRef} /></div>
                        <span className="text-[8px] font-black uppercase mt-1">{t("petsafe.poster.scanHint")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] text-white text-[10px] py-1.5 text-center font-black uppercase tracking-[0.2em]">{t("petsafe.poster.footer")}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR Tag */}
          {tab === "qr" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-black uppercase text-sm md:text-base">
                    <BadgeCheck className="w-5 h-5 text-[#3366ff]" />
                    <span>{t("petsafe.qr.title")}</span>
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bubble tail-b bg-[#ffcc00] px-3 py-1.5 text-[11px] font-black uppercase">{t("petsafe.qr.subtitle")}</div>
                    <label className="flex items-center gap-1.5 text-[11px] font-black cursor-pointer">
                      <input type="checkbox" checked={shareToSquare} onChange={(e) => setShareToSquare(e.target.checked)} className="chk" />
                      <span>{t("petsafe.qr.shareToSquare")}</span>
                    </label>
                    <button onClick={handleGenerateQR} disabled={generating} className={`btn-comic px-3 py-1.5 text-[11px] ${generating ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <QrCode className="w-4 h-4" />
                      <span>{generating ? t("petsafe.qr.generating") : t("petsafe.qr.generateBtn")}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  <div className="card-comic group p-5 flex flex-col items-center text-center justify-between aspect-[1.5/1]">
                    <div className="w-5 h-5 rounded-full border-4 border-[#1a1a1a] bg-[#fffef0]" />
                    <div className="my-auto flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 border-4 border-[#1a1a1a] overflow-hidden bg-[#fffef0]">
                        <img src={state.avatarUrl} alt="Pet" className="w-full h-full object-cover" />
                      </div>
                      <div className="font-bang text-xl uppercase tracking-wider">{(state.name || "PET").toUpperCase()}</div>
                      <div className="bg-[#3366ff] text-white px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest">{t("petsafe.qr.verified")}</div>
                    </div>
                    <div className="text-[9px] font-mono font-bold text-[#4a4a4a]">ID: PAW-2026-{state.chipId?.slice(-5) || "00000"}</div>
                    <span className="badge-new"><span className="starburst relative w-full h-full bg-[#ffcc00] flex items-center justify-center font-black uppercase text-[10px] text-[#1a1a1a]">NEW!</span></span>
                  </div>

                  <div className="card-comic group p-5 flex flex-col items-center text-center justify-between aspect-[1.5/1]">
                    <div className="w-5 h-5 rounded-full border-4 border-[#1a1a1a] bg-[#fffef0]" />
                    <div className="flex items-center gap-4 my-auto">
                      <div className="bg-white border-4 border-[#1a1a1a] p-1.5"><canvas ref={tagQrCanvasRef} /></div>
                      <div className="text-left flex flex-col gap-1">
                        <div className="text-sm font-black uppercase text-[#ff3333]">{t("petsafe.qr.scanContact")}</div>
                        <div className="text-[11px] leading-tight font-bold text-[#1a1a1a]">
                          <p>{t("petsafe.qr.helpAlone")}</p>
                          <p>{t("petsafe.qr.helpHome")}</p>
                        </div>
                        <div className="text-[9px] font-mono font-bold text-[#4a4a4a] pt-1">CHIP: {state.chipId?.slice(0, 4)}...{state.chipId?.slice(-3)}</div>
                      </div>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-[#4a4a4a]">{t("petsafe.qr.footer")}</div>
                    <span className="badge-new"><span className="starburst relative w-full h-full bg-[#ffcc00] flex items-center justify-center font-black uppercase text-[10px] text-[#1a1a1a]">24H!</span></span>
                  </div>
                </div>
              </div>

              {generatedUrl && (
                <div className="bg-white border-4 border-[#1a1a1a] shadow-[4px_4px_0_rgba(26,26,26,1)] p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase">
                    <CheckCircle className="w-4 h-4 text-[#33cc33]" />
                    <span>{t("petsafe.qr.generatedUrl")}</span>
                  </div>
                  <div className="bg-[#fffef0] border-2 border-[#1a1a1a] p-2 font-mono text-[11px] break-all">{generatedUrl}</div>
                </div>
              )}

              <div className="action-lines h-2 opacity-40" />

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-black uppercase text-sm md:text-base">
                    <Smartphone className="w-5 h-5 text-[#33cc33]" />
                    <span>{t("petsafe.qr.landingTitle")}</span>
                  </h3>
                  <span className="bg-[#33cc33] text-[#1a1a1a] border-4 border-[#1a1a1a] px-2 py-0.5 text-[10px] font-black uppercase shadow-[3px_3px_0_rgba(26,26,26,1)]">{t("petsafe.qr.landingSubtitle")}</span>
                </div>

                <div className="max-w-md mx-auto w-full bg-[#1a1a1a] border-4 border-[#1a1a1a] shadow-[8px_8px_0_rgba(26,26,26,1)] p-3">
                  <div className="bg-white p-4 flex flex-col gap-4 text-[#1a1a1a]">
                    <div className="bubble tail-b bg-[#ffcc00] p-3 flex items-start gap-2.5">
                      <BellRing className="w-5 h-5 shrink-0 mt-0.5 animate-pulse-subtle" />
                      <div>
                        <h4 className="text-xs font-black uppercase">{t("petsafe.qr.landingThank")}</h4>
                        <p className="text-[11px] font-bold mt-0.5">{t("petsafe.qr.landingDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[#fffef0] border-4 border-[#1a1a1a] p-2.5">
                      <img src={state.avatarUrl} alt="Pet" className="w-14 h-14 object-cover border-4 border-[#1a1a1a]" />
                      <div className="flex flex-col gap-0.5 text-xs min-w-0">
                        <div className="font-black text-sm flex items-center gap-2 flex-wrap">
                          <span>{state.name || "Pet"}</span>
                          <span className="bg-[#ff3333] text-white ink-stroke-sm px-1.5 py-0.5 text-[10px] font-black uppercase">{t("petsafe.qr.statusLost")}</span>
                        </div>
                        <p className="text-[11px] font-bold text-[#4a4a4a]">{state.breed} · {state.gender}</p>
                        {state.tagReward && <p className="bg-[#ffcc00] self-start px-1 font-black text-[11px]">{t("petsafe.poster.reward")} {state.reward}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <button className="btn-comic btn-pow w-full py-2.5 text-xs">
                        <PhoneCall className="w-4 h-4" />
                        <span>{t("petsafe.qr.callOwner")}</span>
                      </button>
                      <button className="btn-comic btn-go w-full py-2.5 text-xs">
                        <Navigation className="w-4 h-4" />
                        <span>{t("petsafe.qr.reportLocation")}</span>
                      </button>
                    </div>
                    <div className="border-4 border-dashed border-[#1a1a1a] bg-[#fffef0] p-2.5 text-[11px] font-bold">
                      <strong className="flex items-center gap-1 mb-1 font-black uppercase"><ShieldAlert className="w-3.5 h-3.5" /> {t("petsafe.qr注意事项")}</strong>
                      <p>{state.tagMedical ? t("petsafe.qr.urgentMed") : ""} {state.features || ""}{t("petsafe.qr.noChase")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Social Copy */}
          {tab === "copy" && (
            <div className="flex flex-col gap-4 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-dashed border-[#1a1a1a] pb-3">
                <h3 className="font-black uppercase text-sm md:text-base">{t("petsafe.copy.title")}</h3>
                <p className="text-[11px] font-bold text-[#4a4a4a]">{t("petsafe.copy.subtitle")}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([["xhs", t("petsafe.copy.platform.xhs")], ["nextdoor", t("petsafe.copy.platform.nextdoor")], ["reddit", t("petsafe.copy.platform.reddit")]] as const).map(([p, label]) => (
                  <button key={p} onClick={() => setPlatform(p)} className={`plat-btn ${platform === p ? "plat-btn-active" : ""}`}><span>{label}</span></button>
                ))}
              </div>
              <div className="relative">
                <textarea readOnly value={getCopyTemplate(platform, state, t)} rows={9} className="input-comic font-mono text-xs leading-relaxed resize-y" />
                <button onClick={handleCopy} className="btn-comic btn-pow absolute top-3 right-3 px-3 py-1.5 text-[11px]">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t("petsafe.copy.copied") : t("petsafe.copy.copyBtn")}</span>
                </button>
              </div>
              <div className="bubble tail-b bg-[#ffcc00] p-3.5 text-xs font-bold flex flex-col gap-1">
                <div className="font-black uppercase flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> {t("petsafe.copy.tips")}</div>
                <p>1. {t("petsafe.copy.tip1")} <strong className="bg-white px-1 font-black">{t("petsafe.copy.tip1Mid")}</strong> {t("petsafe.copy.tip1End")}</p>
                <p>2. {t("petsafe.copy.tip2")}</p>
              </div>
            </div>
          )}

          {/* TAB 4: 48h Guide */}
          {tab === "guide" && (
            <div className="flex flex-col gap-4 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-dashed border-[#1a1a1a] pb-3">
                <div>
                  <h3 className="font-black uppercase text-sm md:text-base">{t("petsafe.guide.title")}</h3>
                  <p className="text-[11px] font-bold text-[#4a4a4a] mt-0.5">{t("petsafe.guide.subtitle")}</p>
                </div>
                <div className="bg-[#3366ff] text-white border-4 border-[#1a1a1a] px-2.5 py-1 text-xs font-black uppercase shadow-[3px_3px_0_rgba(26,26,26,1)]">
                  {t("petsafe.guide.progress")} {checkedCount}/{totalChecks} {t("petsafe.guide.done")}
                </div>
              </div>
              <div className="flex flex-col gap-4 text-xs">
                {guideSteps.map((step, si) => {
                  const Icon = step.icon;
                  const stepChecks = step.items.map((_, ii) => si * 2 + ii);
                  return (
                    <div key={si} className="card-comic group">
                      <div className={`${step.color} px-3 py-2 border-b-4 border-[#1a1a1a] flex items-center justify-between gap-2 flex-wrap`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-[#1a1a1a] text-white px-2 py-0.5 text-[10px] font-black uppercase">{step.timeRange}</span>
                          <span className="text-xs font-black uppercase">{step.title}</span>
                        </div>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="p-3.5 flex flex-col gap-2">
                        {step.items.map((item, ii) => (
                          <label key={ii} className="flex items-start gap-2 cursor-pointer font-bold">
                            <input type="checkbox" checked={guideChecks[stepChecks[ii]]} onChange={() => toggleGuideCheck(stepChecks[ii])} className="chk mt-0.5" />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                      <span className="badge-new"><span className="starburst relative w-full h-full bg-[#ffcc00] flex items-center justify-center font-black uppercase text-[10px] text-[#1a1a1a]">{step.badge}</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
          <div className="bubble tail-b bg-[#ffcc00] px-4 py-2.5 flex items-center gap-2 text-xs font-black">
            <CheckCircle className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Action Lines */}
      <div className="action-lines h-2 border-t-4 border-[#1a1a1a]" />

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-4 text-center text-xs font-bold">
        <p>{t("petsafe.footer")}</p>
      </footer>
    </div>
  );
}
