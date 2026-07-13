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
    <section className="w-full bg-[#eff4ff] dark:bg-[#1e314a] py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
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
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#006c49]/10 text-[#006c49] dark:bg-[#4edea3]/10 dark:text-[#4edea3]">
                  <Icon className="size-7" />
                </div>
                <h4 className="text-lg font-semibold">{stat.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
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
