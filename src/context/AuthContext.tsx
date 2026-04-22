import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/services/api";

export type Role = "admin" | "employe" | "caissier" | "livreur";
export interface AuthUser { id: string; name: string; email: string; role: Role; }

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("oxy_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("oxy_token");
    if (token && !user) {
      api.get("/auth/me").then((r) => {
        setUser(r.data.user);
        localStorage.setItem("oxy_user", JSON.stringify(r.data.user));
      }).catch(() => {});
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("oxy_token", data.token);
      localStorage.setItem("oxy_user", JSON.stringify(data.user));
      setUser(data.user);
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("oxy_token");
    localStorage.removeItem("oxy_user");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
