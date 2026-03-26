import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "ludo_auth_token";

async function apiFetch(path: string, body: object): Promise<{ access_token: string; user: AuthUser }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail;
    const message = Array.isArray(detail)
      ? (detail as { msg?: string }[]).map((d) => d.msg ?? String(d)).join(", ")
      : typeof detail === "string"
      ? detail
      : "Request failed";
    throw new Error(message);
  }
  return data as { access_token: string; user: AuthUser };
}

async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Session expired");
  return res.json() as Promise<AuthUser>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setState({ user: null, token: null, loading: false });
      return;
    }
    fetchMe(stored)
      .then((user) => setState({ user, token: stored, loading: false }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, loading: false });
      });
  }, []);

  const login = async (username: string, password: string) => {
    const { access_token, user } = await apiFetch("/auth/login", { username, password });
    localStorage.setItem(TOKEN_KEY, access_token);
    setState({ user, token: access_token, loading: false });
  };

  const register = async (username: string, email: string, password: string) => {
    const { access_token, user } = await apiFetch("/auth/register", { username, email, password });
    localStorage.setItem(TOKEN_KEY, access_token);
    setState({ user, token: access_token, loading: false });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
