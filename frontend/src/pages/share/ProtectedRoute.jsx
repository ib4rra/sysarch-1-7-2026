import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRoleId");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!allowedRoles.includes(Number(userRole))) {
      navigate("/unauthorized", { replace: true });
      return;
    }
  }, []);

  // Show nothing while checking auth (avoid flash of content)
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRoleId");

  if (!token || !allowedRoles.includes(Number(userRole))) {
    return null;
  }

  return children;
}
