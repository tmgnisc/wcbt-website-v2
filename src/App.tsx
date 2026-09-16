import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { Toaster } from '@/components/shared/Toaster';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Chart, drag-and-drop and form-heavy pages are split out of the initial bundle.
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((module) => ({ default: module.NotificationsPage })),
);
const StaffListPage = lazy(() =>
  import('@/pages/staff/StaffListPage').then((module) => ({ default: module.StaffListPage })),
);
const StaffFormPage = lazy(() =>
  import('@/pages/staff/StaffFormPage').then((module) => ({ default: module.StaffFormPage })),
);
const StaffDetailPage = lazy(() =>
  import('@/pages/staff/StaffDetailPage').then((module) => ({ default: module.StaffDetailPage })),
);
const AdmissionsPage = lazy(() =>
  import('@/pages/admissions/AdmissionsPage').then((module) => ({ default: module.AdmissionsPage })),
);
const AdmissionDetailPage = lazy(() =>
  import('@/pages/admissions/AdmissionDetailPage').then((module) => ({
    default: module.AdmissionDetailPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-wcbt-maroon" aria-label="Loading page" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/staff" element={<StaffListPage />} />
                  <Route path="/staff/:id" element={<StaffDetailPage />} />
                  <Route path="/admissions" element={<AdmissionsPage />} />
                  <Route path="/admissions/:id" element={<AdmissionDetailPage />} />
                  <Route
                    path="/students"
                    element={
                      <PlaceholderPage
                        title="Students"
                        description="Enrolled student records are created when an application is converted from the Admissions module."
                      />
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <PlaceholderPage
                        title="Reports"
                        description="Admission funnels, staff headcount and exam reports will be published here."
                      />
                    }
                  />

                  <Route element={<ProtectedRoute adminOnly />}>
                    <Route path="/staff/new" element={<StaffFormPage mode="create" />} />
                    <Route path="/staff/:id/edit" element={<StaffFormPage mode="edit" />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
