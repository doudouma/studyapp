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
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: true,
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      setUser(session?.data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ user, authLoading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
