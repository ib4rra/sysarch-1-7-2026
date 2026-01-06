import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRoleId");

  if (!token) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(Number(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
