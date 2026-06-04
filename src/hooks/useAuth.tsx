import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import type { User, UserRole } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginAs: (role: UserRole) => Promise<User>;
  loginAsDemoUser: (userId: string) => Promise<User>;
  loginAsPatient: (patientId: string) => Promise<User>;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  registerPatient: (
    token: string,
    input: { email: string; password: string; dobConfirm: string }
  ) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setLoading(false);
  }, []);

  const loginAs = useCallback(async (role: UserRole) => {
    const u = await authService.loginAs(role);
    setUser(u);
    return u;
  }, []);

  const loginAsDemoUser = useCallback(async (userId: string) => {
    const u = await authService.loginAsDemoUser(userId);
    setUser(u);
    return u;
  }, []);

  const loginAsPatient = useCallback(async (patientId: string) => {
    const u = await authService.loginAsPatient(patientId);
    setUser(u);
    return u;
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const u = await authService.loginWithCredentials(email, password);
    setUser(u);
    return u;
  }, []);

  const registerPatient = useCallback(
    async (token: string, input: { email: string; password: string; dobConfirm: string }) => {
      const u = await authService.registerPatient(token, input);
      setUser(u);
      return u;
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, loginAs, loginAsDemoUser, loginAsPatient, loginWithCredentials, registerPatient, logout }),
    [user, loading, loginAs, loginAsDemoUser, loginAsPatient, loginWithCredentials, registerPatient, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
