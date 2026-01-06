import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleRedirect({ roleId }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (roleId === 1) navigate("/admin/dashboard");
    else if (roleId === 2) navigate("/instructor/dashboard");
    else if (roleId === 3) navigate("/student/dashboard");
  }, [roleId, navigate]);

  return null;
}
