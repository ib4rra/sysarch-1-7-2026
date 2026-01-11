import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Settings, Shield, Lock, LogOut } from "lucide-react";
import Header from "../../web_components/Header";
import SuperAdminSidebar from "../../web_components/SuperAdminSidebar";
import HomeView from "../AdminDashboard/HomeView";
import AnalyticsView from "../AdminDashboard/AnalyticsView";
import SettingsView from "../AdminDashboard/SettingsView";
import ManageView from "../AdminDashboard/ManageView";

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
        return <AnalyticsView />;

      case "home":
        return <HomeView />;

      case "manage":
        return <ManageView />;

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
        return <SettingsView />;

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
