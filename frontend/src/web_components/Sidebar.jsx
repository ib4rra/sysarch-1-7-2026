
import React from 'react';
import { Home, Users, Database, Settings, LogOut, QrCode } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pwd', label: 'Manage PWD Users', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 min-h-[calc(100vh-64px)] flex flex-col justify-between py-6">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          item.id === 'pwd' ? (
            <div key={item.id}>
              <button
                onClick={() => setActiveTab('pwd')}
                className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors ${
                  (activeTab === 'pwd' || activeTab === 'pwd-verify')
                    ? 'bg-[#800000]/10 text-[#800000] border-r-4 border-[#800000]'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>

              <div className={`pl-10 mt-1 flex flex-col gap-1 ${activeTab === 'pwd' || activeTab === 'pwd-verify' ? 'block' : 'hidden'}`}>
                <button
                  onClick={() => setActiveTab('pwd')}
                  className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'pwd' ? 'bg-white text-[#800000] shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Database className="inline-block mr-3" size={14} /> Manage
                </button>

                <button
                  onClick={() => setActiveTab('pwd-verify')}
                  className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'pwd-verify' ? 'bg-white text-[#800000] shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <QrCode className="inline-block mr-3" size={14} /> Verify ID
                </button>
              </div>
            </div>
          ) : (
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
          )
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-4 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-auto w-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
