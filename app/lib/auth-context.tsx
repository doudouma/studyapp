import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authClient } from "~/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
}

interface AuthContextValue {
  user: User | null;
  authLoading: boolean;
  refreshAuth: () => Promise<void>;
  isMember: boolean;
  membershipExpiresAt: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: true,
  refreshAuth: async () => {},
  isMember: false,
  membershipExpiresAt: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membershipExpiresAt, setMembershipExpiresAt] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      const sessionUser = session?.data?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        const res = await fetch("/api/me");
        const data = await res.json() as { isMember?: boolean; membershipExpiresAt?: string | null };
        setIsMember(data.isMember ?? false);
        setMembershipExpiresAt(data.membershipExpiresAt ?? null);
      } else {
        setIsMember(false);
        setMembershipExpiresAt(null);
      }
    } catch {
      setUser(null);
      setIsMember(false);
      setMembershipExpiresAt(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ user, authLoading, refreshAuth, isMember, membershipExpiresAt }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
