import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PageContainer from "@/components/layout/PageContainer";

function PlaceholderPage({ title, desc }: { title: string; desc: string }) {
  return (
    <PageContainer title={title} description={desc}>
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Coming soon</p>
      </div>
    </PageContainer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
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
              <Route
                path="students"
                element={<PlaceholderPage title="Students" desc="Manage student records" />}
              />
              <Route
                path="import"
                element={<PlaceholderPage title="Data Import" desc="Import student data from CSV" />}
              />
              <Route
                path="reports"
                element={<PlaceholderPage title="Reports" desc="Generate and export reports" />}
              />
              <Route
                path="users"
                element={<PlaceholderPage title="User Management" desc="Manage user accounts" />}
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
