import { Bolt, Lock, QrCode, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";

export function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Bolt,
      title: t("components.stats.preview"),
      description: t("components.stats.previewDesc"),
    },
    {
      icon: Lock,
      title: t("components.stats.security"),
      description: t("components.stats.securityDesc"),
    },
    {
      icon: Timer,
      title: t("components.stats.expiry"),
      description: t("components.stats.expiryDesc"),
    },
    {
      icon: QrCode,
      title: t("components.stats.square"),
      description: t("components.stats.squareDesc"),
    },
  ];

  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-8 text-2xl font-extrabold tracking-tight md:text-3xl">
          {t("components.stats.heading")}
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-[2px] bg-[#d8ff00] text-[#111214]">
                  <Icon className="size-7" />
                </div>
                <h3 className="text-[13px] font-extrabold uppercase tracking-[.06em]">{stat.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
