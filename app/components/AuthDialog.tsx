import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import { useAuth } from "~/lib/auth-context";
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
import { useTranslation } from "react-i18next";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
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
        setError(result.error.message || t("components.auth.loginFailed"));
      } else {
        onSuccess();
      }
    } catch {
      setError(t("components.auth.networkError"));
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
        setError(result.error.message || t("components.auth.registerFailed"));
      } else {
        onSuccess();
      }
    } catch {
      setError(t("components.auth.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="signin" className="flex-1">
          {t("components.auth.login")}
        </TabsTrigger>
        <TabsTrigger value="signup" className="flex-1">
          {t("components.auth.register")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="space-y-4 mt-4">
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            className="max-sm:h-11"
            placeholder={t("components.auth.email")}
            required
          />
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            className="max-sm:h-11"
            placeholder={t("components.auth.password")}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full max-sm:h-11" disabled={loading}>
            {loading ? t("components.auth.loggingIn") : t("components.auth.loginBtn")}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4 mt-4">
          <Input
            name="name"
            autoComplete="nickname"
            className="max-sm:h-11"
            placeholder={t("components.auth.nickname")}
            required
          />
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            className="max-sm:h-11"
            placeholder={t("components.auth.email")}
            required
          />
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            className="max-sm:h-11"
            placeholder={t("components.auth.passwordHint")}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full max-sm:h-11" disabled={loading}>
            {loading ? t("components.auth.registering") : t("components.auth.registerBtn")}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const { refreshAuth } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.pathname + window.location.search,
      });
    } catch {
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          // 桌面居中卡片；移动端（<sm）改为底部抽屉：贴底、占满宽度、圆角只留上方、
          // 高度上限留给键盘，底部留出 iPhone home indicator 的安全区。
          "sm:max-w-md max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:px-5 max-sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-sm:max-h-[88dvh]"
        }
      >
        <DialogHeader className="max-sm:sticky max-sm:top-0 max-sm:z-10 max-sm:-mx-5 max-sm:-mt-4 max-sm:border-b max-sm:border-border max-sm:px-5 max-sm:pt-4 max-sm:pb-2 max-sm:bg-popover">
          <DialogTitle className="pr-10">{t("components.auth.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full max-sm:h-11"
            disabled={googleLoading}
            onClick={handleGoogle}
          >
            <GoogleIcon />
            {t("components.auth.google")}
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            {t("components.auth.or")}
            <div className="h-px flex-1 bg-border" />
          </div>
          <LoginForm
            onSuccess={() => {
              onSuccess?.();
              onOpenChange(false);
              refreshAuth();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
