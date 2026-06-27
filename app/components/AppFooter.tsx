import { Code2 } from "lucide-react";

const footerLinks = [
  // { label: "隐私政策", href: "#" },
  // { label: "服务条款", href: "#" },
  // { label: "帮助中心", href: "#" },
  { label: "联系我们", href: "#" },
];

export function AppFooter() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-4 md:flex-row">
        <div className="flex flex-col gap-1">
          <a href="/" className="flex items-center gap-2">
            <Code2 className="size-4 text-primary" />
            <span className="text-sm font-bold text-primary">100mini</span>
          </a>
          <p className="text-xs text-muted-foreground">
            每个人都能建的小网站
          </p>

        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
