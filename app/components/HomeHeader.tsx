import { useState, useRef, useEffect } from "react";
import { Code2, Search, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface HomeHeaderProps {
  user: User;
}

export function HomeHeader({ user }: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarFallback = user.name?.charAt(0).toUpperCase() || "U";

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
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">100mini</span>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="/"
              className="border-b-2 border-primary pb-0.5 text-sm font-semibold text-primary"
            >
              首页
            </a>
            <a
              href="#my-pages"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              我的链接
            </a>
          </div>
        </div>

        {/* Right: Search + Icons + Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-48 bg-muted pl-9 text-sm lg:w-64"
              placeholder="搜索页面..."
            />
          </div>
          <Button variant="ghost" size="icon" className="size-9">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <Settings className="size-4" />
          </Button>
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
              <div className="absolute right-0 top-10 z-50 w-44 rounded-lg border border-border bg-popover shadow-lg">
                <div className="border-b px-3 py-2 text-sm text-muted-foreground">
                  {user.name}
                </div>
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
    </header>
  );
}
