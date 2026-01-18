import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, BarChart3, Shield } from "lucide-react";
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
        <div className="no-print">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
