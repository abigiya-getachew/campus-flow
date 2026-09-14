import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(`/api/auth${path}`, options);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify the session cookie is still valid.
  useEffect(() => {
    authRequest<{ user: User }>("/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authRequest<{ user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    // The server sets the HttpOnly cookie — we only need to store the user.
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authRequest<{ user: User }>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setUser(data.user);
  };

  const logout = async () => {
    try {
      // Tell the server to revoke the token and clear the cookie.
      await authRequest("/logout", { method: "POST" });
    } catch {
      // Best-effort: clear local state regardless.
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
