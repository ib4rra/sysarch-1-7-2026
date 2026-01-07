import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Settings, LogOut, BarChart3, Shield } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
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

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Staff</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">24</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">PWD Users</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">1,248</p>
                  </div>
                  <Shield className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Records</p>
                    <p className="text-3xl font-bold text-purple-700 mt-2">42</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Expiring IDs</p>
                    <p className="text-3xl font-bold text-orange-700 mt-2">18</p>
                  </div>
                  <Settings className="w-12 h-12 text-orange-400 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        );

      case "staff":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">Manage Staff</h2>
              <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
                <Plus size={20} /> Create Staff Account
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <p className="text-gray-600">Staff management interface coming soon...</p>
            </div>
          </div>
        );

      case "pwd":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">Manage PWD Users</h2>
              <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
                <Plus size={20} /> Create PWD Account
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <p className="text-gray-600">PWD user management interface coming soon...</p>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">System Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">General Settings</h3>
                <p className="text-gray-600">General system configuration coming soon...</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Security Settings</h3>
                <p className="text-gray-600">Security configuration coming soon...</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-sky-600" />
            <h1 className="text-2xl font-bold text-sky-700">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Admin User</p>
              <p className="font-semibold text-gray-800">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold flex items-center gap-3 transition ${
                activeTab === "dashboard"
                  ? "bg-sky-100 text-sky-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart3 size={20} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold flex items-center gap-3 transition ${
                activeTab === "staff"
                  ? "bg-sky-100 text-sky-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users size={20} /> Manage Staff
            </button>
            <button
              onClick={() => setActiveTab("pwd")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold flex items-center gap-3 transition ${
                activeTab === "pwd"
                  ? "bg-sky-100 text-sky-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Shield size={20} /> Manage PWD Users
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold flex items-center gap-3 transition ${
                activeTab === "settings"
                  ? "bg-sky-100 text-sky-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={20} /> Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
