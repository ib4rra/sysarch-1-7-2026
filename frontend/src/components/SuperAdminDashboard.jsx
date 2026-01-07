import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Settings, LogOut, Shield, Lock } from "lucide-react";

function SuperAdminDashboard() {
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
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            <h2 className="text-3xl font-bold text-gray-800">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Admins</p>
                    <p className="text-3xl font-bold text-red-700 mt-2">8</p>
                  </div>
                  <Shield className="w-12 h-12 text-red-400 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">1,248</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">System Health</p>
                    <p className="text-3xl font-bold text-purple-700 mt-2">100%</p>
                  </div>
                  <Lock className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        );

      case "admins":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">Manage Admin Accounts</h2>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition">
                <Plus size={20} /> Create Admin Account
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <p className="text-gray-600">Admin account management interface coming soon...</p>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">System Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">⚙️ General Settings</h3>
                <p className="text-gray-600">System configuration and general settings coming soon...</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">🔒 Security Settings</h3>
                <p className="text-gray-600">Security configuration and access control coming soon...</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">📊 Database Management</h3>
                <p className="text-gray-600">Database maintenance and backup settings coming soon...</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">📝 System Logs</h3>
                <p className="text-gray-600">View system activity and audit logs coming soon...</p>
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
      <nav className="bg-white shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-red-700">Super Admin Panel</h1>
              <p className="text-xs text-gray-500">System Management & Control</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Super Administrator</p>
              <p className="font-semibold text-gray-800">{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen border-r-2 border-red-100">
          <div className="p-6 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold flex items-center gap-3 transition ${
                activeTab === "dashboard"
                  ? "bg-red-100 text-red-700 border-l-4 border-red-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Shield size={20} /> System Overview
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold flex items-center gap-3 transition ${
                activeTab === "admins"
                  ? "bg-red-100 text-red-700 border-l-4 border-red-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users size={20} /> Manage Admin Accounts
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold flex items-center gap-3 transition ${
                activeTab === "settings"
                  ? "bg-red-100 text-red-700 border-l-4 border-red-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={20} /> System Settings
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

export default SuperAdminDashboard;
