// Guards dashboard routes: requires a verified session (via AuthContext -> GET /auth/me) and,
// when `role` is given, requires the user to hold that exact role. Renders children directly if
// given, otherwise an <Outlet /> so it can wrap a nested route tree.
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../services/authService";

export default function ProtectedRoute({ role, children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children ?? <Outlet />;
}
