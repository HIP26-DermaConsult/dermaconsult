import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

export function RequireAuth({ children, role }: { children: ReactNode; role?: UserRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) {
    const home =
      user.role === "hausarzt"
        ? "/dashboard"
        : user.role === "patient"
          ? "/portal"
          : "/expert/dashboard";
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}
