import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: i18n.t("contact.title") },
      { name: "description", content: i18n.t("contact.desc") },
    ],
  }),
  component: ContactPage,
});

type ContactNavLink = { label: string; href: string; divider?: boolean };
type ContactNavGroup = { label: string; links: ContactNavLink[] };

function ContactPage() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.square"), href: "/square" },
    { label: t("nav.showcase"), href: "/showcase" },
  ];

  const navGroups: ContactNavGroup[] = [
    {
      label: t("nav.tools"),
      links: [
        { label: t("nav.toolsAll"), href: "/freetool" },
        { label: "", href: "", divider: true },
        { label: t("nav.claudeArtifact"), href: "/claude-artifact-to-link" },
        { label: t("nav.pomodoro"), href: "/pomodoro" },
        { label: t("nav.rhythm"), href: "/rhythm" },
        { label: t("nav.md2html"), href: "/md2html" },
        { label: t("nav.any2md"), href: "/any2md" },
        { label: t("nav.idphoto"), href: "/idphoto" },
        { label: t("nav.petbadge"), href: "/petbadge" },
        { label: t("nav.petsafe"), href: "/petsafe" },
      ],
    },
    {
      label: t("nav.game"),
      links: [
        { label: t("nav.gamesAll"), href: "/games" },
        { label: "", href: "", divider: true },
        { label: t("nav.papercut"), href: "/papercut" },
        { label: t("nav.deliveryrush"), href: "/deliveryrush" },
        { label: t("nav.enso"), href: "/enso" },
        { label: t("nav.outbreak"), href: "/outbreak" },
      ],
    },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("icreativechina@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <section className="h-screen w-full overflow-hidden relative flex flex-col">
      <style>{`
        * { font-family: 'Helvetica Now Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .liquid-glass {
          background: rgba(255, 255, 255, 0.01);
          background-blend-mode: luminosity;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        .liquid-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
            rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown { animation: dropdown-in 0.2s ease-out; }
        .duration-400 { transition-duration: 400ms; }
      `}</style>

      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260703_053131_1ec3dd1c-d627-44fb-ab20-6e1fce41b0d5.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/10 z-[1]" />

      {/* Navigation */}
      <nav className="relative z-10 px-5 sm:px-6 md:px-12 lg:px-16 py-4 sm:py-5">
        <div ref={navRef} className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 14L14 26L2 14L14 2Z" fill="white" fillOpacity="0.9" />
              <path d="M14 6L22 14L14 22L6 14L14 6Z" fill="white" fillOpacity="0.5" />
            </svg>
            <span className="text-white text-lg sm:text-xl font-medium tracking-tight">100mini</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {navGroups.map((group) => (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === group.label ? null : group.label)}
                  className="flex items-center gap-0.5 text-white/90 hover:text-white text-sm font-medium transition-colors"
                >
                  {group.label}
                  <ChevronDown className={`size-3.5 transition-transform ${openDropdown === group.label ? "rotate-180" : ""}`} />
                </button>
                {openDropdown === group.label && (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-44 liquid-glass rounded-2xl py-2 animate-dropdown">
                    {group.links.map((link, i) =>
                      link.divider ? (
                        <div key={`divider-${i}`} className="mx-3 my-1 border-t border-white/10" />
                      ) : (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/links" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
              {t("nav.profile")}
            </Link>
            <Link
              to="/"
              className="liquid-glass rounded-full px-5 py-2 text-white text-sm font-medium"
            >
              {t("nav.getStarted")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative size-8 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden absolute left-4 right-4 top-full mt-2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="bg-[#2C221C]/95 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-white/90 hover:text-white text-lg font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {navGroups.map((group) => (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => setOpenMobileGroup(openMobileGroup === group.label ? null : group.label)}
                    className="flex w-full items-center justify-between text-white/90 hover:text-white text-lg font-medium"
                  >
                    {group.label}
                    <ChevronDown className={`size-4 transition-transform ${openMobileGroup === group.label ? "rotate-180" : ""}`} />
                  </button>
                  {openMobileGroup === group.label && (
                    <div className="flex flex-col gap-3 mt-3 pl-3 border-l border-white/10">
                      {group.links.map((link, i) =>
                        link.divider ? null : (
                          <Link
                            key={`${link.href}-${i}`}
                            to={link.href}
                            className="text-white/70 hover:text-white text-base font-medium"
                            onClick={() => setMobileOpen(false)}
                          >
                            {link.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
              <Link
                to="/links"
                className="text-white/90 hover:text-white text-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.profile")}
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4">
              <Link
                to="/"
                className="liquid-glass rounded-full px-5 py-2 text-white text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex items-start justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="text-center max-w-3xl px-5">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-[-0.02em]">
            {t("contact.heading")}
          </h1>
          <p className="text-white/60 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-[-0.02em]">
            {t("contact.subtitle")}<br />
            {t("contact.subtitle2")}
          </p>
          <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto mt-6 sm:mt-8">
            {t("contact.message")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <a
              href="mailto:icreativechina@gmail.com"
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-white/90 transition-colors"
            >
              {t("contact.sendEmail")}
            </a>
            <button
              onClick={copyEmail}
              className="px-5 sm:px-6 py-2.5 sm:py-3 liquid-glass rounded-full text-white text-sm font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <><Check className="size-3.5" /> {t("contact.copied")}</>
              ) : (
                <><Copy className="size-3.5" /> {t("contact.copyEmail")}</>
              )}
            </button>
          </div>

          {/* Contact details */}
          <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/60 text-sm">
            <a href="mailto:icreativechina@gmail.com" className="hover:text-white transition-colors">
              icreativechina@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
