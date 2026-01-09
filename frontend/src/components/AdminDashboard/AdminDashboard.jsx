import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Settings, BarChart3, Shield } from "lucide-react";
import Header from "../../web_components/Header";
import Sidebar from "../../web_components/Sidebar";
import ManageView from "./ManageView";
import VerifyIDView from "./VerifyIDView";
import HomeView from "./HomeView";
import AnalyticsView from "./AnalyticsView";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

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
      case "home":
        return <HomeView />;

      case "dashboard":
        return <AnalyticsView />;

      case "pwd":
        return <ManageView />;

      case "pwd-verify":
        return <VerifyIDView />;

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Component */}
      <Header 
        userLabel={`Admin`} 
        userName={user?.username || "Admin"}
      />

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar Component */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
