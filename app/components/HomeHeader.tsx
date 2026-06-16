import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Code2, Search, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AppNavProps {
  user: User | null;
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

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result?.error) {
        setError(result.error.message || "登录失败");
      } else {
        onSuccess();
        window.location.reload();
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const name = form.get("name") as string;

    try {
      const result = await authClient.signUp.email({ email, password, name });
      if (result?.error) {
        setError(result.error.message || "注册失败");
      } else {
        onSuccess();
        window.location.reload();
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="signin" className="flex-1">
          登录
        </TabsTrigger>
        <TabsTrigger value="signup" className="flex-1">
          注册
        </TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="space-y-4 mt-4">
          <Input name="email" type="email" placeholder="邮箱" required />
          <Input
            name="password"
            type="password"
            placeholder="密码"
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4 mt-4">
          <Input name="name" placeholder="昵称" required />
          <Input name="email" type="email" placeholder="邮箱" required />
          <Input
            name="password"
            type="password"
            placeholder="密码（至少 8 位）"
            required
            minLength={8}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}

export function AppNav({ user }: AppNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const avatarFallback = user?.name?.charAt(0).toUpperCase() || "U";

  // ========== 未登录模式 ==========
  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">100mini</span>
          </Link>

          <Dialog open={authOpen} onOpenChange={setAuthOpen}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthOpen(true)}
            >
              登录 / 注册
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>登录 100mini</DialogTitle>
              </DialogHeader>
              <LoginForm onSuccess={() => setAuthOpen(false)} />
            </DialogContent>
          </Dialog>
        </nav>
      </header>
    );
  }

  // ========== 已登录模式 ==========
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">100mini</span>
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <NavLink href="/">首页</NavLink>
            <NavLink href="/links">我的链接</NavLink>
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
