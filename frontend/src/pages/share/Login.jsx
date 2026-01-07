import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import API from "../../api";
import Header from "../../web_components/Header";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    idNumber: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  // ✅ Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await API.get("/health");
        setBackendStatus("✅ Connected");
      } catch (err) {
        setBackendStatus("❌ Disconnected");
      }
    };
    checkBackend();
  }, []);

  // ✅ Check if user already logged in - use effect instead of Navigate in render
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (token && userRole) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit - Let backend determine user type
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { idNumber, password } = formData;

    if (!idNumber || !password) {
      setError("ID Number and Password are required.");
      setLoading(false);
      return;
    }

    try {
      // Send unified login request - backend will handle both staff and PWD users
      const response = await API.post("/auth/unified-login", {
        idNumber,
        password,
      });

      const { token, refreshToken, user } = response.data;

      // ✅ Save user session to localStorage
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userRoleId", user.role_id);
      localStorage.setItem("username", user.username || "User");

      // 🎯 Redirect based on role
      // role_id 1 = Super Admin → /super-admin
      // role_id 2 = Person-in-Charge/Admin → /admin
      // role_id 3,4 = Users → /dashboard
      if (user.role_id === 1) {
        navigate("/super-admin", { replace: true });
      } else if (user.role_id === 2) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      {/* Header Component */}
      <Header userLabel="" userName="Guest" />

      {/* Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-[#3a0606] rounded-2xl p-8 border-2 border-[#5a0a0a] shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-white text-2xl font-bold uppercase tracking-wide leading-tight">
              PWD Management<br />System
            </h2>
            <div className="w-full h-[1px] bg-gray-500/50 mt-4"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              name="idNumber"
              placeholder="ID Number / Username"
              className="w-full bg-white px-4 py-2 pr-10 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
              style={{ color: 'rgb(31, 41, 55)' }}
              value={formData.idNumber}
              onChange={handleChange}
              disabled={loading || !backendStatus?.includes("✅")}
              required
            />
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full bg-white px-4 py-2 pr-10 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
              style={{ color: 'rgb(31, 41, 55)' }}
              value={formData.password}
              onChange={handleChange}
              disabled={loading || !backendStatus?.includes("✅")}
              required
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !backendStatus?.includes("✅")}
            className={`w-full font-bold py-2 rounded-lg border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-all active:scale-[0.98] ${
              loading || !backendStatus?.includes("✅")
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-b from-gray-100 to-gray-300 text-gray-800 hover:from-white hover:to-gray-200 border-gray-400"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

      <div className="mt-8 text-center">
          <div className="w-full h-[1px] bg-gray-500/50 mb-4"></div>
           {/* <button
            className="text-white text-sm hover:underline tracking-wide"
            onClick={() => navigate("/forgot-password")}
            disabled={loading}
          >
            Forgot Password ?
          </button> */} 
        </div>
     
      </div>
      </div>
    </div>
  );
}

export default Login;

