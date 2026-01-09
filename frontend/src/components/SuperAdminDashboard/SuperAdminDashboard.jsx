import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Settings, Shield, Lock, LogOut } from "lucide-react";
import Header from "../../web_components/Header";
import SuperAdminSidebar from "../../web_components/SuperAdminSidebar";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Component */}
      <Header 
        userLabel={`Super Admin`} 
        userName={user?.username || "Super Admin"}
      />

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        {/* SuperAdmin Sidebar Component */}
        <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
