import { Bolt, Lock, QrCode, Timer } from "lucide-react";

const stats = [
  {
    icon: Bolt,
    title: "即时预览",
    description: "上传即发布，秒级生效",
  },
  {
    icon: Lock,
    title: "防钓鱼安全",
    description: "CSP 沙箱 + 安全 Banner，保护访客",
  },
  {
    icon: Timer,
    title: "24h 自动销毁",
    description: "匿名上传阅后即焚，不留痕迹",
  },
  {
    icon: QrCode,
    title: "学习广场",
    description: "分享到广场，让更多人发现你的学习单页",
  },
];

export function StatsSection() {
  return (
    <section className="w-full bg-[#eff4ff] dark:bg-[#1e314a] py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
          为什么选择 100mini？
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
