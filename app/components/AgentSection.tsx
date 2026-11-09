import { useState } from "react";
import { Bot, ExternalLink, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const SKILL_URL = "https://www.100mini.com/skill/100mini-upload";

export function AgentSection() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyText = `Tell your agent to load 100mini-skill\n${SKILL_URL}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      const el = document.createElement("textarea");
      el.value = copyText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full">
      <div className="rounded-[2px] border border-[#e3e3e3] bg-white p-5 flex items-start gap-4 dark:border-[#2a2d32] dark:bg-[#15171a]">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-[#d8ff00]">
          <Bot className="size-5 text-[#111214]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-foreground">{t("home.agent.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {t("home.agent.desc")}{" "}
            <code className="inline-block rounded-[2px] bg-[#f2f2f2] px-1.5 py-0.5 text-xs font-mono font-semibold text-foreground dark:bg-[#1b1e22]">
              100mini-skill
            </code>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <a
              href={SKILL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-[#111214] dark:hover:text-[#d8ff00] transition-colors"
            >
              <ExternalLink className="size-3 shrink-0" />
              {SKILL_URL}
            </a>
            <button
              onClick={handleCopy}
              className="size-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={t("common.copy")}
            >
              {copied ? <Check className="size-3.5 text-green-600 dark:text-green-400" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
