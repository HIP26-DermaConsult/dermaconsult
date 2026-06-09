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
import PatientRegisterPage from "@/pages/auth/PatientRegisterPage";
import PatientUploadPage from "@/pages/portal/PatientUploadPage";
import PatientPortalPage from "@/pages/portal/PatientPortalPage";
import PatientConsultationDetailPage from "@/pages/portal/PatientConsultationDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Public patient links */}
      <Route path="/invite/:token" element={<PatientRegisterPage />} />
      <Route path="/upload/konsil/:token" element={<PatientUploadPage />} />
      <Route path="/upload/:token" element={<PatientUploadPage />} />

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

      {/* Patient portal routes */}
      <Route
        element={
          <RequireAuth role="patient">
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/portal" element={<PatientPortalPage />} />
        <Route path="/portal/consultations/:konsilId" element={<PatientConsultationDetailPage />} />
      </Route>

      <Route path="/" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
