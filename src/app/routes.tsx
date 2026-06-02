import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RouteGuard";
import HausarztDashboardPage from "@/pages/hausarzt/DashboardPage";
import HausarztKonsileListPage from "@/pages/hausarzt/KonsileListPage";
import NewKonsilPage from "@/pages/hausarzt/NewKonsilPage";
import HausarztKonsilDetailPage from "@/pages/hausarzt/KonsilDetailPage";
import PatientsListPage from "@/pages/hausarzt/PatientsListPage";
import PatientDetailPage from "@/pages/hausarzt/PatientDetailPage";
import PatientFormPage from "@/pages/hausarzt/PatientFormPage";
import ExpertDashboardPage from "@/pages/expert/ExpertDashboardPage";
import ExpertKonsileListPage from "@/pages/expert/ExpertKonsileListPage";
import ExpertKonsilDetailPage from "@/pages/expert/ExpertKonsilDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Hausarzt routes */}
      <Route
        element={
          <RequireAuth role="hausarzt">
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<HausarztDashboardPage />} />
        <Route path="/konsile" element={<HausarztKonsileListPage />} />
        <Route path="/konsile/new" element={<NewKonsilPage />} />
        <Route path="/konsile/:id" element={<HausarztKonsilDetailPage />} />
        <Route path="/patients" element={<PatientsListPage />} />
        <Route path="/patients/new" element={<PatientFormPage mode="create" />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/patients/:id/edit" element={<PatientFormPage mode="edit" />} />
      </Route>

      {/* Expert routes */}
      <Route
        element={
          <RequireAuth role="dermatologist">
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/expert/dashboard" element={<ExpertDashboardPage />} />
        <Route path="/expert/konsile" element={<ExpertKonsileListPage />} />
        <Route path="/expert/konsile/:id" element={<ExpertKonsilDetailPage />} />
        <Route path="/expert/activity" element={<ExpertKonsileListPage />} />
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function RoleRedirect() {
  const raw = typeof window !== "undefined" ? localStorage.getItem("derma_consult_user") : null;
  if (!raw) return <Navigate to="/login" replace />;
  try {
    const u = JSON.parse(raw);
    return <Navigate to={u.role === "hausarzt" ? "/dashboard" : "/expert/dashboard"} replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
