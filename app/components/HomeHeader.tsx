import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Code2, Search, Settings, LogOut, Menu, X, Bookmark, ChevronDown } from "lucide-react";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import { useAuth } from "~/lib/auth-context";
import { Button } from "~/components/ui/button";
import { AuthDialog } from "~/components/AuthDialog";
import { useTranslation } from "react-i18next";
import { LangSwitcher } from "~/components/LangSwitcher";
import { fetchSquareData } from "~/lib/square-server";

interface AppNavProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

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
          ? "border-b-2 border-primary pb-0.5 text-sm font-semibold text-primary"
          : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
          ? "block rounded-lg bg-[#006c49]/10 dark:bg-[#4edea3]/10 px-4 py-2.5 text-sm font-semibold text-[#006c49] dark:text-[#4edea3]"
          : "block rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-[#e5eeff] dark:hover:bg-[#1e314a] transition-colors"
      }
    >
      {children}
    </Link>
  );
}

function ToolsDropdown() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive =
    location.pathname.startsWith("/pomodoro") ||
    location.pathname.startsWith("/rhythm") ||
    location.pathname.startsWith("/md2html") ||
    location.pathname.startsWith("/any2md");

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
        <div className="absolute left-0 top-full z-50 mt-2 min-w-32 rounded-lg border border-border bg-popover py-1 shadow-lg">
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
          ? "block px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
          : "block px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
  fetchSquareData({ data: { offset: 0 } }).catch(() => {}).finally(() => { _prefetching = false; });
}

export function AppNav({ searchQuery, onSearchChange }: AppNavProps) {
  const { t } = useTranslation();
  const { user, refreshAuth, isMember, membershipExpiresAt } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isOnSquare = location.pathname.startsWith("/square");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search value = from square page (when on square) or local state
  const searchValue = isOnSquare ? (searchQuery ?? "") : localSearch;

  const handleSearchChange = (value: string) => {
    if (isOnSquare) {
      onSearchChange?.(value);
    } else {
      setLocalSearch(value);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isOnSquare && searchValue.trim()) {
      navigate({ to: "/square", search: { q: searchValue.trim() } });
      setLocalSearch("");
    }
  };

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
      <header className="sticky top-0 z-50 w-full border-b border-[#d3e4fe] dark:border-[#3c4a42] bg-white/95 dark:bg-[#0b1c30]/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#006c49] text-white dark:bg-[#4edea3] dark:text-[#002113]">
                <Code2 className="size-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">100mini</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <NavLink href="/">{t("nav.home")}</NavLink>
              <div onPointerEnter={prefetchSquare}>
                <NavLink href="/square">{t("nav.square")}</NavLink>
              </div>
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
            <div className="hidden md:flex items-center size-9">
              <LangSwitcher />
            </div>
            <Button
              variant="ghost"
              size="sm"
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
          <div className="border-t border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#0b1c30] md:hidden">
            <div className="flex flex-col gap-1 px-6 py-4">
              <MobileNavLink href="/" onClick={() => setMobileNavOpen(false)}>{t("nav.home")}</MobileNavLink>
              <div onPointerEnter={prefetchSquare}>
                <MobileNavLink href="/square" onClick={() => setMobileNavOpen(false)}>{t("nav.square")}</MobileNavLink>
              </div>
              <MobileNavLink href="/pomodoro" onClick={() => setMobileNavOpen(false)}>{t("nav.pomodoro")}</MobileNavLink>
              <MobileNavLink href="/rhythm" onClick={() => setMobileNavOpen(false)}>{t("nav.rhythm")}</MobileNavLink>
              <MobileNavLink href="/md2html" onClick={() => setMobileNavOpen(false)}>{t("nav.md2html")}</MobileNavLink>
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
    <header className="sticky top-0 z-50 w-full border-b border-[#d3e4fe] dark:border-[#3c4a42] bg-white/95 dark:bg-[#0b1c30]/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#006c49] text-white dark:bg-[#4edea3] dark:text-[#002113]">
              <Code2 className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">100mini</span>
          </Link>
            <div className="hidden items-center gap-6 md:flex">
            <NavLink href="/">{t("nav.home")}</NavLink>
            <div onPointerEnter={prefetchSquare}>
              <NavLink href="/square">{t("nav.square")}</NavLink>
            </div>
            <ToolsDropdown />
            <NavLink href="/links">{t("nav.profile")}</NavLink>
            {user.role === "admin" && (
              <NavLink href="/admin">{t("nav.admin")}</NavLink>
            )}
          </div>
        </div>

        {/* Right: Search + Icons + Avatar */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center size-9 md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={t("nav.menu")}
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-48 bg-muted pl-9 text-sm lg:w-64"
              placeholder={t("nav.search")}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
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
              className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground cursor-pointer overflow-hidden"
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
              <div className="absolute right-0 top-10 z-50 w-52 rounded-lg border border-border bg-popover shadow-lg">
                <div className="border-b px-3 py-2 text-sm text-muted-foreground">
                  {user.name}
                </div>
                <div className="border-b px-3 py-2">
                  {isMember ? (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {t("nav.member")}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {t("nav.memberExpire", { date: membershipExpiresAt ? new Date(membershipExpiresAt).toLocaleDateString("zh-CN") : "" })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{t("nav.normalUser")}</span>
                  )}
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
                  className="flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
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
        <div className="border-t border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#0b1c30] md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <MobileNavLink href="/" onClick={() => setMobileNavOpen(false)}>{t("nav.home")}</MobileNavLink>
            <div onPointerEnter={prefetchSquare}>
              <MobileNavLink href="/square" onClick={() => setMobileNavOpen(false)}>{t("nav.square")}</MobileNavLink>
            </div>
            <MobileNavLink href="/pomodoro" onClick={() => setMobileNavOpen(false)}>{t("nav.pomodoro")}</MobileNavLink>
            <MobileNavLink href="/rhythm" onClick={() => setMobileNavOpen(false)}>{t("nav.rhythm")}</MobileNavLink>
            <MobileNavLink href="/md2html" onClick={() => setMobileNavOpen(false)}>{t("nav.md2html")}</MobileNavLink>
            <MobileNavLink href="/links" onClick={() => setMobileNavOpen(false)}>{t("nav.profile")}</MobileNavLink>
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
