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

const CSRF_SYNC_ATTEMPTS = 3;
const CSRF_RETRY_MS = 150;
const ME_NETWORK_RETRIES = 5;
const ME_RETRY_BASE_MS = 300;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncCsrf = useCallback(async (): Promise<boolean> => {
    for (let attempt = 0; attempt < CSRF_SYNC_ATTEMPTS; attempt++) {
      const r = await apiFetch("/api/v1/auth/csrf");
      if (r.ok) {
        const data = (await r.json()) as { csrfToken?: string };
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
          return true;
        }
      }
      if (attempt < CSRF_SYNC_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, CSRF_RETRY_MS * (attempt + 1)));
      }
    }
    return false;
  }, []);

  const refresh = useCallback(async () => {
    let r: Response | undefined;
    for (let attempt = 0; attempt < ME_NETWORK_RETRIES; attempt++) {
      try {
        r = await apiFetch("/api/v1/auth/me");
        break;
      } catch {
        if (attempt === ME_NETWORK_RETRIES - 1) {
          setUser(null);
          setCsrfToken(null);
          return;
        }
        await new Promise((res) => setTimeout(res, ME_RETRY_BASE_MS * (attempt + 1)));
      }
    }
    if (!r) return;
    if (r.ok) {
      const data = (await r.json()) as { user: AuthUser };
      setUser(data.user);
      const csrfOk = await syncCsrf();
      if (!csrfOk) {
        setUser(null);
        setCsrfToken(null);
      }
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
