// Redirects already-authenticated users away from public-only pages (login/register) to their dashboard.
import { Navigate } from "react-router-dom";
import { getSession, getDashboardPath } from "../services/authService";

export default function GuestOnlyRoute({ children }) {
  const session = getSession();
  if (session?.user?.role) {
    return <Navigate to={getDashboardPath(session.user.role)} replace />;
  }
  return children;
}
