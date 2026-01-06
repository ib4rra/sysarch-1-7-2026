import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import virtulab from "../../assets/Virtulab.svg";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student", // ✅ Default value
  });


  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullname, email, password, confirmPassword, role } = formData;

    if (!fullname || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // ✅ Convert role (string) to role_id (number)
      const role_id = role === "instructor" ? 2 : 3;

      // ✅ Send to backend
      const response = await axios.post("http://localhost:5000/auth/register", {
        username: fullname,
        email,
        password,
        role_id,
      });

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };


  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-[#eaf6ff] via-[#d6eeff] to-white">
      {/* decorative gradient circle */}
      <div className="pointer-events-none absolute -top-36 -left-36 w-72 h-72 rounded-full bg-gradient-to-br from-[#bfe9ff] to-[#8fd9ff] opacity-40 blur-3xl" />

      <header className="flex items-center gap-3 px-6 py-4 md:px-12 md:py-6">
        <img src={virtulab} alt="VirtuLab" className="w-12 md:w-14" />
        <h1 className="text-xl md:text-2xl font-extrabold text-sky-700">VirtuLab</h1>
      </header>

      {/* Register Form Section */}
      <div className="flex flex-1 items-center justify-center px-4 md:px-8">
        <div className="relative w-full max-w-lg bg-white/95 p-8 md:p-12 rounded-3xl shadow-2xl mt-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-4 text-slate-800">
            Create your account
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <label htmlFor="fullname" className="block text-sm font-medium text-slate-600 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-sky-200 text-gray-800 placeholder-gray-400 text-lg"
            />

            {/* Email */}
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-sky-200 text-gray-800 placeholder-gray-400 text-lg"
            />

            {/* Password */}
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-sky-200 text-gray-800 placeholder-gray-400 text-lg"
            />

            {/* Confirm Password */}
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-sky-200 text-gray-800 placeholder-gray-400 text-lg"
            />

            {/* 🧩 Role Selector (Admin excluded) */}
            <label htmlFor="role" className="block text-sm font-medium text-slate-600 mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-sky-200 text-gray-800 text-lg"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>


            {/* Feedback Messages */}
            {error && (
              <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm mb-3 text-center">{success}</p>
            )}

            <button
              type="submit"
              className="w-full text-white py-3 rounded-2xl hover:shadow-lg transition bg-gradient-to-r from-sky-500 to-indigo-500 text-lg font-semibold"
            >
              Create account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")}>
              <span className="font-bold text-sky-600 hover:underline cursor-pointer">Login</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
