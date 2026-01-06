import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import virtulab from "../../assets/Virtulab.svg";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Check if user already logged in (prevent going back to login)
  const token = localStorage.getItem("token");
  const userRoleId = localStorage.getItem("userRoleId");

  if (token && userRoleId) {
    if (userRoleId === "3") {
      return <Navigate to="/student/StudentDashboard" replace />;
    } else if (userRoleId === "2") {
      return <Navigate to="/instructor/dashboard" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password } = formData;
    if (!email || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // ✅ Save user session to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRoleId", user.role_id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("email", user.email);

      // 🎯 Redirect based on role (replace history so back won't return)
      if (user.role_id === 3) {
        navigate("/student/dashboard", { replace: true });
      } else if (user.role_id === 2) {
        navigate("/instructor/dashboard", { replace: true });
      } else {
        navigate("/unauthorized", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-[#eaf6ff] via-[#d6eeff] to-white">
      <div className="pointer-events-none absolute -top-36 -right-36 w-72 h-72 rounded-full bg-gradient-to-br from-[#bfe9ff] to-[#8fd9ff] opacity-40 blur-3xl" />

      <header className="flex items-center gap-3 px-6 py-4 md:px-12 md:py-6">
        <img src={virtulab} alt="VirtuLab" className="w-12 md:w-14" />
        <h1 className="text-xl md:text-2xl font-extrabold text-sky-700">VirtuLab</h1>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 md:px-8">
        <div className="relative w-full max-w-md bg-white/95 p-8 md:p-12 rounded-3xl shadow-2xl mt-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-4 text-slate-800">Welcome!</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-sky-200 text-gray-800 placeholder-gray-400 text-lg"
            />

            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-sky-200 text-gray-800 placeholder-gray-400 text-lg"
            />

            {error && (<p className="text-red-600 text-sm mb-3 text-center">{error}</p>)}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-2xl hover:shadow-lg transition ${loading ? 'bg-sky-300 cursor-not-allowed' : 'bg-gradient-to-r from-sky-500 to-indigo-500'}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">Don’t have an account?{' '}
            <button onClick={() => navigate('/register')}>
              <span className="font-bold text-sky-600 hover:underline cursor-pointer">Register</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
