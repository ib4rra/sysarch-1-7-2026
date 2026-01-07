import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../web_components/Header";
import UserSidebar from "../web_components/UserSidebar";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="text-lg font-semibold text-gray-800 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">Account Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">Login Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">Session Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "records":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Records</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
                  <h3 className="font-bold text-sky-700 mb-2">📋 Personal Records</h3>
                  <p className="text-gray-600 text-sm">View your personal information on file</p>
                  <button disabled className="w-full mt-4 bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed text-sm">
                    Coming Soon
                  </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-green-700 mb-2">📄 Documents</h3>
                  <p className="text-gray-600 text-sm">Access your official documents</p>
                  <button disabled className="w-full mt-4 bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed text-sm">
                    Coming Soon
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="font-bold text-purple-700 mb-2">📊 History</h3>
                  <p className="text-gray-600 text-sm">View your account activity history</p>
                  <button disabled className="w-full mt-4 bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed text-sm">
                    Coming Soon
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">ℹ️ Read-Only Access</h3>
                <p className="text-gray-700">
                  You have read-only access to your records. You can view your information but cannot make modifications.
                  To request changes to your records, please contact the Barangay Nangka Office.
                </p>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-800">Change Password</p>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <button disabled className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed text-sm">
                      Coming Soon
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-800">Email Preferences</p>
                      <p className="text-sm text-gray-600">Manage your notification settings</p>
                    </div>
                    <button disabled className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed text-sm">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Privacy & Security</h3>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <p className="text-gray-700">
                    Your data is protected and encrypted. We follow all data privacy regulations to keep your information safe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Component */}
      <Header 
        userLabel={`User`} 
        userName={user?.username || "User"}
      />

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        {/* User Sidebar Component */}
        <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
