import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "@/constants/routes";

// Layouts
import { AuthLayout } from "@/layouts/AuthLayout";
import { CitizenLayout } from "@/layouts/CitizenLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Public pages
import { LandingPage } from "@/pages/landing/LandingPage";

// Auth pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

// Citizen pages
import { CitizenDashboard } from "@/pages/citizen/Dashboard";
import { ComplaintsListPage } from "@/pages/citizen/complaints/ComplaintsListPage";
import { ComplaintNewPage } from "@/pages/citizen/complaints/ComplaintNewPage";
import { ComplaintDetailPage } from "@/pages/citizen/complaints/ComplaintDetailPage";
import { ComplaintEditPage } from "@/pages/citizen/complaints/ComplaintEditPage";
import { BloodDonatePage } from "@/pages/citizen/blood/BloodDonatePage";
import { BloodRequestsPage } from "@/pages/citizen/blood/BloodRequestsPage";
import { BloodRequestNewPage } from "@/pages/citizen/blood/BloodRequestNewPage";
import { BloodSearchPage } from "@/pages/citizen/blood/BloodSearchPage";
import { NoticesPage } from "@/pages/citizen/notices/NoticesPage";
import { NoticeDetailPage } from "@/pages/citizen/notices/NoticeDetailPage";
import { ProfilePage } from "@/pages/citizen/ProfilePage";
import { NotificationsPage } from "@/pages/citizen/NotificationsPage";

// Admin pages
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminUsersPage } from "@/pages/admin/UsersPage";
import { AdminComplaintsPage } from "@/pages/admin/complaints/ComplaintsPage";
import { AdminComplaintDetailPage } from "@/pages/admin/complaints/ComplaintDetailPage";
import { AdminBloodDonorsPage } from "@/pages/admin/blood/DonorsPage";
import { AdminBloodRequestsPage } from "@/pages/admin/blood/RequestsPage";
import { AdminNoticesPage } from "@/pages/admin/notices/NoticesPage";
import { AdminNoticeNewPage } from "@/pages/admin/notices/NoticeNewPage";
import { AdminNoticeEditPage } from "@/pages/admin/notices/NoticeEditPage";
import { AdminAnalyticsPage } from "@/pages/admin/AnalyticsPage";
import { AdminActivityLogsPage } from "@/pages/admin/ActivityLogsPage";

// 404
import { NotFoundPage } from "@/pages/NotFoundPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />

        {/* ── Auth ── */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>

        {/* ── Citizen ── */}
        <Route
          element={
            <ProtectedRoute requiredRole="citizen">
              <CitizenLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.CITIZEN.DASHBOARD} element={<CitizenDashboard />} />
          <Route path={ROUTES.CITIZEN.COMPLAINTS} element={<ComplaintsListPage />} />
          <Route path={ROUTES.CITIZEN.COMPLAINT_NEW} element={<ComplaintNewPage />} />
          <Route path="/citizen/complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="/citizen/complaints/:id/edit" element={<ComplaintEditPage />} />
          <Route path={ROUTES.CITIZEN.BLOOD_DONATE} element={<BloodDonatePage />} />
          <Route path={ROUTES.CITIZEN.BLOOD_REQUESTS} element={<BloodRequestsPage />} />
          <Route path={ROUTES.CITIZEN.BLOOD_REQUEST_NEW} element={<BloodRequestNewPage />} />
          <Route path={ROUTES.CITIZEN.BLOOD_SEARCH} element={<BloodSearchPage />} />
          <Route path={ROUTES.CITIZEN.NOTICES} element={<NoticesPage />} />
          <Route path="/citizen/notices/:id" element={<NoticeDetailPage />} />
          <Route path={ROUTES.CITIZEN.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.CITIZEN.NOTIFICATIONS} element={<NotificationsPage />} />
        </Route>

        {/* ── Admin ── */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN.COMPLAINTS} element={<AdminComplaintsPage />} />
          <Route path="/admin/complaints/:id" element={<AdminComplaintDetailPage />} />
          <Route path={ROUTES.ADMIN.BLOOD_DONORS} element={<AdminBloodDonorsPage />} />
          <Route path={ROUTES.ADMIN.BLOOD_REQUESTS} element={<AdminBloodRequestsPage />} />
          <Route path={ROUTES.ADMIN.NOTICES} element={<AdminNoticesPage />} />
          <Route path={ROUTES.ADMIN.NOTICE_NEW} element={<AdminNoticeNewPage />} />
          <Route path="/admin/notices/:id/edit" element={<AdminNoticeEditPage />} />
          <Route path={ROUTES.ADMIN.ANALYTICS} element={<AdminAnalyticsPage />} />
          <Route path={ROUTES.ADMIN.ACTIVITY_LOGS} element={<AdminActivityLogsPage />} />
        </Route>

        {/* ── Fallbacks ── */}
        <Route path="/citizen" element={<Navigate to={ROUTES.CITIZEN.DASHBOARD} replace />} />
        <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
