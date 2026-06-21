import { Bolt, Lock, QrCode } from "lucide-react";

const stats = [
  {
    icon: Bolt,
    title: "即时预览",
    description: "粘贴即预览，高保真渲染",
  },
  {
    icon: Lock,
    title: "加密存储",
    description: "内容安全加密，隐私有保障",
  },
  {
    icon: QrCode,
    title: "一键分享",
    description: "生成链接或二维码，方便传播",
  },
];

export function StatsSection() {
  return (
    <section className="w-full bg-muted/50 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <h4 className="text-base font-semibold">{stat.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
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
