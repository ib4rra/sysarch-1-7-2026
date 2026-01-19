import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../web_components/Header";
import UserSidebar from "../../web_components/UserSidebar";
import UserHomeView from "./UserHomeView";
import { pwdUserAPI, pwdAdminAPI, authAPI } from "../../api";
import UserSettingsView from "./UserSettingsView";


function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [showPasswords, setShowPasswords] = useState(true);

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

    // Set a basic user state and fetch full PWD info when available
    const displayName = localStorage.getItem('displayName') || username;
    setUser({
      id: userId,
      username: username,
      role: userRole,
      fullName: displayName,
      isActive: true,
    });

    // Seed full name from JWT if available (some login flows include firstname/lastname)
    try {
      const rawToken = token || localStorage.getItem('token');
      if (rawToken) {
        const parts = rawToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const tFirst = (payload.firstname || payload.firstName || '').trim();
          const tLast = (payload.lastname || payload.lastName || '').trim();
          if (tFirst || tLast) {
            const tFull = `${tFirst} ${tLast}`.trim().toUpperCase();
            setUser(prev => ({ ...(prev || {}), fullName: tFull }));
            try { localStorage.setItem('displayName', tFull); } catch (e) {}
          }
        }
      }
    } catch (e) { /* ignore */ }

    // Fetch PWD user's own record to get exact full name and account status
    (async () => {
      try {
        const resp = await pwdUserAPI.getOwnRecord();
        const info = resp?.data?.personal_info || resp?.personal_info || resp?.data || null;
        if (info) {
          let first = (info.firstname || '').trim();
          let last = (info.lastname || '').trim();
          const formattedId = info.formattedPwdId || info.pwd_id || username || null;

          // If names are missing, try the public verify endpoint which also returns names
          if ((first === '' || last === '') && formattedId) {
            try {
              const verifyResp = await pwdAdminAPI.getRegistrantById(encodeURIComponent(formattedId));
              const verified = verifyResp?.data || verifyResp;
              if (verified) {
                first = (verified.firstName || verified.firstname || '').trim();
                last = (verified.lastName || verified.lastname || '').trim();
              }
            } catch (err) {
              console.warn('PWD verify fallback failed:', err?.response?.data || err?.message || err);
            }
          }

          const full = `${first} ${last}`.replace(/\s+/g, ' ').trim().toUpperCase();
          setUser(prev => ({
            ...(prev || {}),
            fullName: full || (prev?.username || '').toUpperCase(),
            formattedId: formattedId,
            firstName: first || null,
            middleName: info.middlename || null,
            lastName: last || null,
            isActive: info.isActive !== undefined ? !!info.isActive : (info.login_active ? !!info.login_active : true),
          }));

          try { localStorage.setItem('displayName', full || (username || '').toUpperCase()); } catch (e) { /* ignore */ }
        }
      } catch (err) {
        console.warn('Could not fetch PWD record:', err?.response?.data || err?.message || err);
      } finally {
        setLoading(false);
      }
    })();

  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };
    // Count only non-space characters
    const noSpaces = password.replace(/\s/g, '');
    let score = 0;
    if (noSpaces.length >= 8) score++;
    if (noSpaces.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    const strengths = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Weak", color: "bg-red-500" },
      { score: 2, label: "Fair", color: "bg-yellow-500" },
      { score: 3, label: "Good", color: "bg-blue-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
      { score: 5, label: "Very Strong", color: "bg-green-600" },
    ];
    return strengths[score] || strengths[5];
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    // Remove spaces from password fields
    const cleanValue = (name === 'newPassword' || name === 'confirmPassword') 
      ? value.replace(/\s/g, '') 
      : value;
    setPasswordData(prev => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordMessage({ type: "error", text: "All password fields are required" });
        setPasswordLoading(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordMessage({ type: "error", text: "New passwords do not match" });
        setPasswordLoading(false);
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordMessage({ type: "error", text: "Password must be at least 8 characters long" });
        setPasswordLoading(false);
        return;
      }

      // Call API to change password
      console.log('Attempting to change password...');
      const response = await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      console.log('Change password response:', response);

      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error('Change password error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to change password";
      setPasswordMessage({ type: "error", text: errorMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

const renderContent = () => {
  switch (activeTab) {
    case "home":
      return <UserHomeView />;

    case "settings":
      const passwordStrength = getPasswordStrength(passwordData.newPassword);
      const passwordsMatch = passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword;
      return (
        <UserSettingsView
          passwordData={passwordData}
          passwordLoading={passwordLoading}
          passwordMessage={passwordMessage}
          showPasswords={showPasswords}
          setShowPasswords={setShowPasswords}
          handlePasswordChange={handlePasswordChange}
          handleSavePassword={handleSavePassword}
          passwordStrength={passwordStrength}
          passwordsMatch={passwordsMatch}
        />
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
        userName={user?.fullName || user?.username || "User"}
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