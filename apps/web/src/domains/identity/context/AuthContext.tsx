import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, setCsrfToken } from "../../../shared/http/api-client";

export type AuthUser = { id: string; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncCsrf = useCallback(async () => {
    const r = await apiFetch("/api/v1/auth/csrf");
    if (!r.ok) return;
    const data = (await r.json()) as { csrfToken?: string };
    if (data.csrfToken) setCsrfToken(data.csrfToken);
  }, []);

  const refresh = useCallback(async () => {
    const r = await apiFetch("/api/v1/auth/me");
    if (r.ok) {
      const data = (await r.json()) as { user: AuthUser };
      setUser(data.user);
      await syncCsrf();
    } else {
      setUser(null);
      setCsrfToken(null);
    }
  }, [syncCsrf]);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await apiFetch("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const err = (await r.json().catch(() => null)) as { error?: { message?: string } } | null;
      throw new Error(err?.error?.message ?? "Falha no login.");
    }
    const data = (await r.json()) as { user: AuthUser; csrfToken: string };
    setUser(data.user);
    setCsrfToken(data.csrfToken);
  }, []);

  const logout = useCallback(async () => {
    const r = await apiFetch("/api/v1/auth/logout", { method: "POST" });
    if (!r.ok) {
      const err = (await r.json().catch(() => null)) as { error?: { message?: string } } | null;
      throw new Error(err?.error?.message ?? "Falha ao terminar sessão.");
    }
    setUser(null);
    setCsrfToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth dentro de AuthProvider");
  return ctx;
}
