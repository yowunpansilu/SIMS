import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import StudentListPage from "@/pages/StudentListPage";
import StudentDetailPage from "@/pages/StudentDetailPage";
import DataImportPage from "@/pages/DataImportPage";
import ReportsPage from "@/pages/ReportsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  const isFileProtocol = typeof window !== "undefined" && window.location.protocol === "file:";
  const Router: any = isFileProtocol ? HashRouter : BrowserRouter;
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — wrapped in AppShell layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentListPage />} />
              <Route path="students/:id" element={<StudentDetailPage />} />
              <Route path="import" element={<DataImportPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
