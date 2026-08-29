import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authClient } from "~/lib/auth-client";
import { fetchMe } from "~/features/pages/api";

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
  points: number;
  pageCount: number;
  limit: number;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: true,
  refreshAuth: async () => {},
  isMember: false,
  membershipExpiresAt: null,
  points: 0,
  pageCount: 0,
  limit: 0,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membershipExpiresAt, setMembershipExpiresAt] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [limit, setLimit] = useState(0);

  const refreshAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      const session = await authClient.getSession();
      const sessionUser = session?.data?.user ?? null;
      setUser(sessionUser);
      if (!sessionUser) {
        setIsMember(false);
        setMembershipExpiresAt(null);
        setPoints(0);
        setPageCount(0);
        return;
      }
    } catch {
      setUser(null);
      setIsMember(false);
      setMembershipExpiresAt(null);
      return;
    }
    // Session valid — fetch profile. A transient /api/me failure must NOT
    // log the user out or leave points stale; keep the existing session.
    try {
      const data = await fetchMe();
      setIsMember(data.isMember ?? false);
      setMembershipExpiresAt(data.membershipExpiresAt ?? null);
        setPoints(data.points ?? 0);
        setPageCount(data.pageCount ?? 0);
        setLimit(data.limit ?? 0);
    } catch {
      // keep current session; points will refresh on next refreshAuth
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ user, authLoading, refreshAuth, isMember, membershipExpiresAt, points, pageCount, limit }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
