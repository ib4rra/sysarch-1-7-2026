
import React, { useState } from 'react';
import Header from './web_components/Header';
import LoginForm from './pages/Index';
import Sidebar from './web_components/Sidebar';
import HomeView from './components/HomeView';
import AnalyticsView from './components/AnalyticsView';
import ManageView from './components/ManageView';
import ForgotPasswordView from './components/ForgotPasswordView';
import VerifyIDView from './components/VerifyIDView';

const App = () => {
  const [authState, setAuthState] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);

  const handleLogin = (id, pass) => {
    setLoading(true);
    // Mock authentication
    setTimeout(() => {
      setAuthState('app');
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setAuthState('login');
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'dashboard':
        return <AnalyticsView />;
      case 'manage':
        return <ManageView />;
      case 'verify':
        return <VerifyIDView />;
      case 'settings':
        return (
          <div className="p-8 text-center text-gray-500">
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <p>Configuration panel will be available in the next version.</p>
          </div>
        );
      default:
        return <HomeView />;
    }
  };

  // Auth Layout (Login / Forgot Password)
  if (authState === 'login' || authState === 'forgot-password') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header userLabel="" />
        <main className="flex-grow flex items-center justify-center p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-[#800000] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#800000] font-black uppercase tracking-widest text-lg">Authenticating</p>
            </div>
          ) : authState === 'forgot-password' ? (
            <ForgotPasswordView onBack={() => setAuthState('login')} />
          ) : (
            <div className="animate-in fade-in zoom-in duration-500">
              <LoginForm 
                onLogin={handleLogin} 
                onForgotPassword={() => setAuthState('forgot-password')} 
              />
            </div>
          )}
        </main>
        <footer className="py-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Barangay Nangka, Marikina City. All Rights Reserved.
        </footer>
      </div>
    );
  }

  // Main Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header userLabel={activeTab === 'home' ? "Person in Charge" : "Admin"} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="animate-in slide-in-from-right-2 duration-300">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <footer className="bg-white py-2 px-8 border-t border-gray-200 text-[10px] text-gray-400 flex justify-between">
        <span>Barangay Nangka PWD Management System v2.0</span>
        <span>&copy; {new Date().getFullYear()} Marikina City Government</span>
      </footer>
    </div>
  );
};

export default App;
