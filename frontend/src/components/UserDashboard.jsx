import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const userRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setUser({
      id: userId,
      username: username,
      role: userRole,
    });
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-sky-700">🏛️ Barangay Nangka MIS</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-800">{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.username}! 👋</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* User Info Card */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
              <h3 className="font-bold text-sky-700 mb-4">📋 Your Information</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Name:</strong> {user?.username}</p>
                <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
              </div>
            </div>

            {/* Session Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-green-700 mb-4">✅ Session Status</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Active</span></p>
                <p><strong>Token:</strong> <span className="text-green-600 font-semibold">Valid</span></p>
                <p><strong>Access Level:</strong> <span className="text-green-600 font-semibold">Read-Only</span></p>
              </div>
            </div>

            {/* Your Records Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="font-bold text-indigo-700 mb-4">📄 Your Records</h3>
              <button disabled className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed">
                View Records (Coming Soon)
              </button>
              <p className="text-xs text-gray-600 mt-2 text-center">View your personal information and records</p>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">📖 About Your Access</h3>
            <p className="text-gray-700">
              You have <strong>read-only access</strong> to your personal information. This means you can view your records and details in the system, but cannot make changes. 
              If you need to update your information, please contact the Barangay Nangka Office.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
