import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Code2, Settings, LogOut, Menu, X, Bookmark, ChevronDown, ChevronRight, User } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useAuth } from "~/lib/auth-context";
import { Button } from "~/components/ui/button";
import { AuthDialog } from "~/components/AuthDialog";
import { useTranslation } from "react-i18next";
import { LangSwitcher } from "~/components/LangSwitcher";
import { fetchSquareItems } from "~/features/square/api";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive =
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      className={
        isActive
          ? "border-b-2 border-[#111214] pb-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#111214] dark:border-[#d8ff00] dark:text-[#ededed]"
          : "text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  const location = useLocation();
  const isActive =
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      onClick={onClick}
      className={
        isActive
          ? "block rounded-[2px] bg-[#111214] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#d8ff00]"
          : "block rounded-[2px] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:bg-[#f2f2f2] hover:text-[#111214] dark:hover:bg-[#1b1e22] dark:hover:text-[#ededed]"
      }
    >
      {children}
    </Link>
  );
}

function MobileGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[2px] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:bg-[#f2f2f2] hover:text-[#111214] dark:hover:bg-[#1b1e22] dark:hover:text-[#ededed]"
      >
        {label}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="flex flex-col gap-1 pt-0.5">{children}</div>}
    </div>
  );
}

function ToolsDropdown() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive =
    location.pathname.startsWith("/claude-artifact-to-link") ||
    location.pathname.startsWith("/pomodoro") ||
    location.pathname.startsWith("/rhythm") ||
    location.pathname.startsWith("/md2html") ||
    location.pathname.startsWith("/any2md") ||
    location.pathname.startsWith("/freetool") ||
    location.pathname.startsWith("/idphoto") ||
    location.pathname.startsWith("/petbadge") ||
    location.pathname.startsWith("/petsafe") ||
    location.pathname.startsWith("/ai-books/learning-path") ||
    location.pathname.startsWith("/ai-skills-assessment");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          isActive || open
            ? "flex items-center gap-0.5 border-b-2 border-primary pb-0.5 text-sm font-semibold text-primary"
            : "flex items-center gap-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        {t("nav.tools")}
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-40 rounded-[2px] border border-[#e3e3e3] bg-white py-1 dark:border-[#2a2d32] dark:bg-[#15171a]">
          <DropdownLink href="/freetool" onClick={() => setOpen(false)}>
            {t("nav.toolsAll")}
          </DropdownLink>
          <div className="mx-3 my-1 border-t border-border" />
          <DropdownLink href="/claude-artifact-to-link" onClick={() => setOpen(false)}>
            {t("nav.claudeArtifact")}
          </DropdownLink>
          <DropdownLink href="/pomodoro" onClick={() => setOpen(false)}>
            {t("nav.pomodoro")}
          </DropdownLink>
          <DropdownLink href="/rhythm" onClick={() => setOpen(false)}>
            {t("nav.rhythm")}
          </DropdownLink>
          <DropdownLink href="/md2html" onClick={() => setOpen(false)}>
            {t("nav.md2html")}
          </DropdownLink>
          <DropdownLink href="/any2md" onClick={() => setOpen(false)}>
            {t("nav.any2md")}
          </DropdownLink>
          <DropdownLink href="/idphoto" onClick={() => setOpen(false)}>
            {t("nav.idphoto")}
          </DropdownLink>
          <DropdownLink href="/petbadge" onClick={() => setOpen(false)}>
            {t("nav.petbadge")}
          </DropdownLink>
          <DropdownLink href="/petsafe" onClick={() => setOpen(false)}>
            {t("nav.petsafe")}
          </DropdownLink>
          <DropdownLink href="/ai-books/learning-path" onClick={() => setOpen(false)}>
            {t("nav.aiLearningPath")}
          </DropdownLink>
          <DropdownLink href="/ai-skills-assessment" onClick={() => setOpen(false)}>
            {t("nav.aiAssessment")}
          </DropdownLink>
        </div>
      )}
    </div>
  );
}

function GamesDropdown() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive =
    location.pathname.startsWith("/games") ||
    location.pathname.startsWith("/papercut") ||
    location.pathname.startsWith("/deliveryrush") ||
    location.pathname.startsWith("/enso") ||
    location.pathname.startsWith("/outbreak");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          isActive || open
            ? "flex items-center gap-0.5 border-b-2 border-primary pb-0.5 text-sm font-semibold text-primary"
            : "flex items-center gap-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        {t("nav.game")}
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-40 rounded-[2px] border border-[#e3e3e3] bg-white py-1 dark:border-[#2a2d32] dark:bg-[#15171a]">
          <DropdownLink href="/games" onClick={() => setOpen(false)}>
            {t("nav.gamesAll")}
          </DropdownLink>
          <div className="mx-3 my-1 border-t border-border" />
          <DropdownLink href="/papercut" onClick={() => setOpen(false)}>
            {t("nav.papercut")}
          </DropdownLink>
          <DropdownLink href="/deliveryrush" onClick={() => setOpen(false)}>
            {t("nav.deliveryrush")}
          </DropdownLink>
          <DropdownLink href="/enso" onClick={() => setOpen(false)}>
            {t("nav.enso")}
          </DropdownLink>
          <DropdownLink href="/outbreak" onClick={() => setOpen(false)}>
            {t("nav.outbreak")}
          </DropdownLink>
        </div>
      )}
    </div>
  );
}

function DropdownLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      onClick={onClick}
      className={
        isActive
          ? "block px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#111214] transition-colors hover:bg-[#f2f2f2] dark:text-[#ededed] dark:hover:bg-[#1b1e22]"
          : "block px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-[#f2f2f2] hover:text-[#111214] dark:hover:bg-[#1b1e22] dark:hover:text-[#ededed]"
      }
    >
      {children}
    </Link>
  );
}

function handleBookmark() {
  const url = window.location.href;
  const title = document.title;

  const win = window as unknown as {
    sidebar?: { addPanel: (t: string, u: string, s: string) => void };
    external?: { AddFavorite?: (u: string, t: string) => void };
  };

  if (win.sidebar?.addPanel) {
    // Firefox (legacy)
    win.sidebar.addPanel(title, url, "");
  } else if (win.external?.AddFavorite) {
    // Internet Explorer / legacy Edge
    win.external.AddFavorite(url, title);
  } else {
    // Chrome, Safari, modern Edge, modern Firefox
    const isMac = navigator.userAgent.includes("Mac");
    const key = isMac ? "Cmd" : "Ctrl";
    alert(`Press ${key}+D to bookmark this page`);
  }
}

let _prefetching = false;
function prefetchSquare() {
  if (_prefetching) return;
  _prefetching = true;
  fetchSquareItems(0).catch(() => {}).finally(() => { _prefetching = false; });
}

export function AppNav() {
  const { t } = useTranslation();
  const { user, refreshAuth, points } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await authClient.signOut();
    refreshAuth();
    navigate({ to: "/" });
  };

  const avatarFallback = user?.name?.charAt(0).toUpperCase() || "U";

  // ========== 未登录模式 ==========
  if (!user) {
    return (
      <header className="aix-header sticky top-0 z-50 w-full border-b border-[#e3e3e3] bg-[#ededed]/95 backdrop-blur dark:border-[#2a2d32] dark:bg-[#0c0d0f]/95">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-[2px] bg-[#111214] text-[#d8ff00] dark:bg-[#d8ff00] dark:text-[#111214]">
                <Code2 className="size-5" />
              </div>
              <span className="text-[15px] font-extrabold uppercase tracking-[0.16em]">100mini</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <NavLink href="/">{t("nav.home")}</NavLink>
              <div onPointerEnter={prefetchSquare}>
                <NavLink href="/square">{t("nav.square")}</NavLink>
              </div>
              <NavLink href="/showcase">{t("nav.showcase")}</NavLink>
  <NavLink href="/100-questions">{t("nav.questions")}</NavLink>
            <NavLink href="/ai-books">{t("nav.aiBooks")}</NavLink>
              <GamesDropdown />
              <ToolsDropdown />
            </div>
          </div>

          <button
            className="flex items-center justify-center size-9 md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={t("nav.menu")}
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex items-center gap-2">
            <button
              className="hidden sm:flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={handleBookmark}
              title={t("nav.bookmark")}
              aria-label={t("nav.bookmark")}
            >
              <Bookmark className="size-4" />
            </button>
            <div className="hidden md:flex items-center">
              <LangSwitcher />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] font-bold uppercase tracking-[0.1em]"
              onClick={() => setAuthOpen(true)}
            >
              {t("nav.login")}
            </Button>
          </div>
          <AuthDialog
            open={authOpen}
            onOpenChange={setAuthOpen}
            onSuccess={() => { navigate({ to: "/" }); }}
          />
        </nav>
        {mobileNavOpen && (
          <div className="border-t border-[#e3e3e3] bg-[#ededed] dark:border-[#2a2d32] dark:bg-[#0c0d0f] md:hidden">
            <div className="flex flex-col gap-1 px-6 py-4">
              <MobileNavLink href="/" onClick={() => setMobileNavOpen(false)}>{t("nav.home")}</MobileNavLink>
              <div onPointerEnter={prefetchSquare}>
                <MobileNavLink href="/square" onClick={() => setMobileNavOpen(false)}>{t("nav.square")}</MobileNavLink>
              </div>
              <MobileNavLink href="/showcase" onClick={() => setMobileNavOpen(false)}>{t("nav.showcase")}</MobileNavLink>
            <MobileNavLink href="/100-questions" onClick={() => setMobileNavOpen(false)}>{t("nav.questions")}</MobileNavLink>
            <MobileNavLink href="/ai-books" onClick={() => setMobileNavOpen(false)}>{t("nav.aiBooks")}</MobileNavLink>
              <MobileGroup label={t("nav.tools")}>
                <MobileNavLink href="/freetool" onClick={() => setMobileNavOpen(false)}>{t("nav.toolsAll")}</MobileNavLink>
                <MobileNavLink href="/claude-artifact-to-link" onClick={() => setMobileNavOpen(false)}>{t("nav.claudeArtifact")}</MobileNavLink>
                <MobileNavLink href="/pomodoro" onClick={() => setMobileNavOpen(false)}>{t("nav.pomodoro")}</MobileNavLink>
                <MobileNavLink href="/rhythm" onClick={() => setMobileNavOpen(false)}>{t("nav.rhythm")}</MobileNavLink>
                <MobileNavLink href="/md2html" onClick={() => setMobileNavOpen(false)}>{t("nav.md2html")}</MobileNavLink>
                <MobileNavLink href="/any2md" onClick={() => setMobileNavOpen(false)}>{t("nav.any2md")}</MobileNavLink>
                <MobileNavLink href="/idphoto" onClick={() => setMobileNavOpen(false)}>{t("nav.idphoto")}</MobileNavLink>
                <MobileNavLink href="/petbadge" onClick={() => setMobileNavOpen(false)}>{t("nav.petbadge")}</MobileNavLink>
                <MobileNavLink href="/petsafe" onClick={() => setMobileNavOpen(false)}>{t("nav.petsafe")}</MobileNavLink>
                <MobileNavLink href="/ai-books/learning-path" onClick={() => setMobileNavOpen(false)}>{t("nav.aiLearningPath")}</MobileNavLink>
                <MobileNavLink href="/ai-skills-assessment" onClick={() => setMobileNavOpen(false)}>{t("nav.aiAssessment")}</MobileNavLink>
              </MobileGroup>
              <MobileGroup label={t("nav.game")}>
                <MobileNavLink href="/games" onClick={() => setMobileNavOpen(false)}>{t("nav.gamesAll")}</MobileNavLink>
                <MobileNavLink href="/papercut" onClick={() => setMobileNavOpen(false)}>{t("nav.papercut")}</MobileNavLink>
                <MobileNavLink href="/deliveryrush" onClick={() => setMobileNavOpen(false)}>{t("nav.deliveryrush")}</MobileNavLink>
                <MobileNavLink href="/enso" onClick={() => setMobileNavOpen(false)}>{t("nav.enso")}</MobileNavLink>
                <MobileNavLink href="/outbreak" onClick={() => setMobileNavOpen(false)}>{t("nav.outbreak")}</MobileNavLink>
              </MobileGroup>
              <div className="px-4 pt-2">
                <LangSwitcher />
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }

  // ========== 已登录模式 ==========
  return (
    <header className="aix-header sticky top-0 z-50 w-full border-b border-[#e3e3e3] bg-[#ededed]/95 backdrop-blur dark:border-[#2a2d32] dark:bg-[#0c0d0f]/95">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-[2px] bg-[#111214] text-[#d8ff00] dark:bg-[#d8ff00] dark:text-[#111214]">
              <Code2 className="size-5" />
            </div>
            <span className="text-[15px] font-extrabold uppercase tracking-[0.16em]">100mini</span>
          </Link>
            <div className="hidden items-center gap-6 md:flex">
            <NavLink href="/">{t("nav.home")}</NavLink>
            <div onPointerEnter={prefetchSquare}>
              <NavLink href="/square">{t("nav.square")}</NavLink>
            </div>
            <NavLink href="/showcase">{t("nav.showcase")}</NavLink>
            <NavLink href="/100-questions">{t("nav.questions")}</NavLink>
            <NavLink href="/ai-books">{t("nav.aiBooks")}</NavLink>
            <GamesDropdown />
            <ToolsDropdown />
          </div>
        </div>

        {/* Right: Icons + Avatar */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center size-9 md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={t("nav.menu")}
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          {/* <Button variant="ghost" size="icon" className="size-9">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <Settings className="size-4" />
          </Button> */}
          <button
            className="hidden sm:flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={handleBookmark}
            title={t("nav.bookmark")}
            aria-label={t("nav.bookmark")}
          >
            <Bookmark className="size-4" />
          </button>
          <div className="hidden md:flex items-center size-9">
            <LangSwitcher />
          </div>
          <div className="relative" ref={menuRef}>
            <button
              className="flex size-8 items-center justify-center rounded-[2px] bg-[#111214] text-xs font-bold text-[#d8ff00] cursor-pointer overflow-hidden dark:bg-[#d8ff00] dark:text-[#111214]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                avatarFallback
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-[2px] border border-[#e3e3e3] bg-white dark:border-[#2a2d32] dark:bg-[#15171a]">
                <button
                  className="group flex w-full cursor-pointer items-center gap-2 border-b px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                  onClick={() => { setMenuOpen(false); navigate({ to: "/links" }); }}
                >
                  <User className="size-4 text-muted-foreground group-hover:text-primary" />
                  <span className="truncate">{user.name}</span>
                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
                <div className="border-b px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t("nav.points")}</span>
                    <span className="text-sm font-semibold text-foreground">{points}</span>
                  </div>
                </div>
                {user.role === "admin" && (
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted cursor-pointer"
                    onClick={() => { setMenuOpen(false); navigate({ to: "/admin" }); }}
                  >
                    <Settings className="size-4" />
                    {t("nav.admin")}
                  </button>
                )}
                <button
                  className="flex w-full cursor-pointer items-center gap-2 rounded-b-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  {t("nav.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {mobileNavOpen && (
        <div className="border-t border-[#e3e3e3] bg-[#ededed] dark:border-[#2a2d32] dark:bg-[#0c0d0f] md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <MobileNavLink href="/" onClick={() => setMobileNavOpen(false)}>{t("nav.home")}</MobileNavLink>
            <div onPointerEnter={prefetchSquare}>
              <MobileNavLink href="/square" onClick={() => setMobileNavOpen(false)}>{t("nav.square")}</MobileNavLink>
            </div>
            <MobileNavLink href="/showcase" onClick={() => setMobileNavOpen(false)}>{t("nav.showcase")}</MobileNavLink>
            <MobileNavLink href="/100-questions" onClick={() => setMobileNavOpen(false)}>{t("nav.questions")}</MobileNavLink>
            <MobileNavLink href="/ai-books" onClick={() => setMobileNavOpen(false)}>{t("nav.aiBooks")}</MobileNavLink>
            <MobileGroup label={t("nav.tools")}>
              <MobileNavLink href="/freetool" onClick={() => setMobileNavOpen(false)}>{t("nav.toolsAll")}</MobileNavLink>
              <MobileNavLink href="/pomodoro" onClick={() => setMobileNavOpen(false)}>{t("nav.pomodoro")}</MobileNavLink>
              <MobileNavLink href="/rhythm" onClick={() => setMobileNavOpen(false)}>{t("nav.rhythm")}</MobileNavLink>
              <MobileNavLink href="/md2html" onClick={() => setMobileNavOpen(false)}>{t("nav.md2html")}</MobileNavLink>
              <MobileNavLink href="/any2md" onClick={() => setMobileNavOpen(false)}>{t("nav.any2md")}</MobileNavLink>
              <MobileNavLink href="/idphoto" onClick={() => setMobileNavOpen(false)}>{t("nav.idphoto")}</MobileNavLink>
              <MobileNavLink href="/petbadge" onClick={() => setMobileNavOpen(false)}>{t("nav.petbadge")}</MobileNavLink>
              <MobileNavLink href="/petsafe" onClick={() => setMobileNavOpen(false)}>{t("nav.petsafe")}</MobileNavLink>
                <MobileNavLink href="/ai-books/learning-path" onClick={() => setMobileNavOpen(false)}>{t("nav.aiLearningPath")}</MobileNavLink>
                <MobileNavLink href="/ai-skills-assessment" onClick={() => setMobileNavOpen(false)}>{t("nav.aiAssessment")}</MobileNavLink>
            </MobileGroup>
            <MobileGroup label={t("nav.game")}>
              <MobileNavLink href="/games" onClick={() => setMobileNavOpen(false)}>{t("nav.gamesAll")}</MobileNavLink>
              <MobileNavLink href="/papercut" onClick={() => setMobileNavOpen(false)}>{t("nav.papercut")}</MobileNavLink>
              <MobileNavLink href="/deliveryrush" onClick={() => setMobileNavOpen(false)}>{t("nav.deliveryrush")}</MobileNavLink>
              <MobileNavLink href="/enso" onClick={() => setMobileNavOpen(false)}>{t("nav.enso")}</MobileNavLink>
              <MobileNavLink href="/outbreak" onClick={() => setMobileNavOpen(false)}>{t("nav.outbreak")}</MobileNavLink>
            </MobileGroup>
            {user.role === "admin" && (
              <MobileNavLink href="/admin" onClick={() => setMobileNavOpen(false)}>{t("nav.admin")}</MobileNavLink>
            )}
            <div className="px-4 pt-2">
              <LangSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
