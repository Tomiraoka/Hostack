import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ roles, children, redirectTo = "/login" }) {
  const { auth, isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to={defaultPathFor(role)} replace />;
  }
  return children;
}

function defaultPathFor(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "MANAGER") return "/manager/orders";
  return "/menu";
}
