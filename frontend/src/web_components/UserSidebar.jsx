import React from 'react';
import { User, FileText, Settings, LogOut, Home } from 'lucide-react';

const UserSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'records', label: 'My Records', icon: FileText },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 min-h-[calc(100vh-64px)] flex flex-col justify-between py-6">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === item.id 
                ? 'bg-[#800000]/10 text-[#800000] border-r-4 border-[#800000]' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-auto w-full"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default UserSidebar;
