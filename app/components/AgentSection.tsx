import { useState } from "react";
import { Bot, ExternalLink, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const SKILL_URL = "https://www.100mini.com/skill/100mini-upload";

export function AgentSection() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyText = `Tell your agent to load 100mini-upload\n${SKILL_URL}`;

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
    <section className="mx-auto max-w-2xl px-6 py-8">
      <div className="rounded-2xl border border-[#d3e4fe]/60 dark:border-[#3c4a42] bg-white dark:bg-[#15243b] p-5 flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#006c49]/10 dark:bg-[#4edea3]/10">
          <Bot className="size-5 text-[#006c49] dark:text-[#4edea3]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-foreground">{t("home.agent.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {t("home.agent.desc")}{" "}
            <code className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold text-foreground">
              100mini-skill
            </code>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <a
              href={SKILL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-[#006c49] dark:hover:text-[#4edea3] transition-colors"
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
