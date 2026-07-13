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
          <Input name="email" type="email" placeholder={t("components.auth.email")} required />
          <Input
            name="password"
            type="password"
            placeholder={t("components.auth.password")}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("components.auth.loggingIn") : t("components.auth.loginBtn")}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4 mt-4">
          <Input name="name" placeholder={t("components.auth.nickname")} required />
          <Input name="email" type="email" placeholder={t("components.auth.email")} required />
          <Input
            name="password"
            type="password"
            placeholder={t("components.auth.passwordHint")}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("components.auth.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <LoginForm
          onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
            refreshAuth();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
