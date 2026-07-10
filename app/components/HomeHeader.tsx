import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Code2, Search, Settings, LogOut, Menu, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import { useAuth } from "~/lib/auth-context";
import { Button } from "~/components/ui/button";
import { AuthDialog } from "~/components/AuthDialog";

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

export function AppNav({ searchQuery, onSearchChange }: AppNavProps) {
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
              <NavLink href="/">首页</NavLink>
              <NavLink href="/square">广场</NavLink>
              <NavLink href="/pomodoro">番茄时钟</NavLink>
            </div>
          </div>

          <button
            className="flex items-center justify-center size-9 md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="菜单"
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAuthOpen(true)}
          >
            登录 / 注册
          </Button>
          <AuthDialog
            open={authOpen}
            onOpenChange={setAuthOpen}
            onSuccess={() => { navigate({ to: "/" }); }}
          />
        </nav>
        {mobileNavOpen && (
          <div className="border-t border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#0b1c30] md:hidden">
            <div className="flex flex-col gap-1 px-6 py-4">
              <MobileNavLink href="/" onClick={() => setMobileNavOpen(false)}>首页</MobileNavLink>
              <MobileNavLink href="/square" onClick={() => setMobileNavOpen(false)}>广场</MobileNavLink>
              <MobileNavLink href="/pomodoro" onClick={() => setMobileNavOpen(false)}>番茄时钟</MobileNavLink>
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
            <NavLink href="/">首页</NavLink>
            <NavLink href="/square">广场</NavLink>
            <NavLink href="/pomodoro">番茄时钟</NavLink>
            <NavLink href="/links">个人中心</NavLink>
            {user.role === "admin" && (
              <NavLink href="/admin">管理后台</NavLink>
            )}
          </div>
        </div>

        {/* Right: Search + Icons + Avatar */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center size-9 md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="菜单"
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-48 bg-muted pl-9 text-sm lg:w-64"
              placeholder="搜索页面..."
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
                        🏆 会员
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        到期 {membershipExpiresAt ? new Date(membershipExpiresAt).toLocaleDateString("zh-CN") : ""}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">普通用户</span>
                  )}
                </div>
                {user.role === "admin" && (
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted cursor-pointer"
                    onClick={() => { setMenuOpen(false); navigate({ to: "/admin" }); }}
                  >
                    <Settings className="size-4" />
                    管理后台
                  </button>
                )}
                <button
                  className="flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {mobileNavOpen && (
        <div className="border-t border-[#d3e4fe] dark:border-[#3c4a42] bg-white dark:bg-[#0b1c30] md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <MobileNavLink href="/" onClick={() => setMobileNavOpen(false)}>首页</MobileNavLink>
            <MobileNavLink href="/square" onClick={() => setMobileNavOpen(false)}>广场</MobileNavLink>
            <MobileNavLink href="/pomodoro" onClick={() => setMobileNavOpen(false)}>番茄时钟</MobileNavLink>
            <MobileNavLink href="/links" onClick={() => setMobileNavOpen(false)}>个人中心</MobileNavLink>
            {user.role === "admin" && (
              <MobileNavLink href="/admin" onClick={() => setMobileNavOpen(false)}>管理后台</MobileNavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
