import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/app-shell";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import ExpenseManagementPage from "./pages/ExpenseManagement";
import RequestsPage from "./pages/SpendRequestsList";
import { RequestForm } from "./components/requests/request-form";
import RequestDetailPage from "./pages/SpendRequestDetail";
import BudgetPage from "./pages/BudgetPage";
import MasterDataPage from "./pages/MasterData";
import UsersPage from "./pages/UserManagement";
import ProfilePage from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="expenses" element={<ExpenseManagementPage />} />
            <Route path="expenses/requests" element={<RequestsPage />} />
            <Route path="expenses/requests/new" element={<RequestForm />} />
            <Route path="expenses/requests/:id" element={<RequestDetailPage />} />
            <Route path="spend-requests/*" element={<Navigate to="/expenses/requests" replace />} />
            <Route path="budgets" element={<BudgetPage />} />
            <Route path="master-data" element={<MasterDataPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
