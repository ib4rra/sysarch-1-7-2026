import React, { useState, useEffect } from 'react';
import { 
  Save, Database, Users, Layout, Activity, Download, Plus, 
  Trash2, Edit2, Upload, FileText, CheckCircle, AlertCircle, 
  ChevronLeft, ChevronRight, Loader
} from 'lucide-react';
// Import the API
import { settingsAPI } from '../../api'; // Adjust path based on your folder structure

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('database');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // For success/error messages

  // State
  const [backupFrequency, setBackupFrequency] = useState('weekly');
  const [interfaceConfig, setInterfaceConfig] = useState({
    headerTitle: '', subHeader: '', footerText: '', primaryColor: '#800000', accentColor: '#eab308'
  });
  const [users, setUsers] = useState([]); 
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);

  // ==========================================
  // API FETCHING
  // ==========================================
  
  // Fetch Interface Settings
  useEffect(() => {
    if (activeTab === 'interface') {
      setLoading(true);
      settingsAPI.getInterface()
        .then(res => {
          if(res.success && res.data) setInterfaceConfig(prev => ({...prev, ...res.data}));
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch Users
  useEffect(() => {
    if (activeTab === 'users') {
      setLoading(true);
      settingsAPI.getStaff()
        .then(res => {
          if(res.success) setUsers(res.data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch Logs
  useEffect(() => {
    if (activeTab === 'logs') {
      setLoading(true);
      settingsAPI.getLogs(logsPage)
        .then(res => {
          if(res.success) setAuditLogs(res.data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeTab, logsPage]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleBackup = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const result = await settingsAPI.downloadBackup();
      if (result.success) {
        setMsg({ type: 'success', text: 'Database backup downloaded successfully!' });
      } else {
        setMsg({ type: 'error', text: result.message || 'Failed to download backup' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Backup download failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInterface = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.saveInterface(interfaceConfig);
      if(res.success) alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleInterfaceChange = (e) => {
    const { name, value } = e.target;
    setInterfaceConfig(prev => ({ ...prev, [name]: value }));
  };

  const nextLogPage = () => setLogsPage(prev => prev + 1);
  const prevLogPage = () => setLogsPage(prev => Math.max(1, prev - 1));

  // ==========================================
  // RENDER HELPERS (Updated with Loading States)
  // ==========================================

  const renderContent = () => {
    if (loading && auditLogs.length === 0 && users.length === 0 && activeTab !== 'database') {
      return (
        <div className="flex justify-center items-center h-64 text-gray-400 gap-2">
           <Loader className="animate-spin" /> Loading data...
        </div>
      );
    }

    switch (activeTab) {
      case 'database':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Database className="text-[#800000]" /> Database Management
              </h3>
              <p className="text-sm text-gray-500 mt-1">Manage system data backups and retention policies.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-700 mb-4">Manual Backup</h4>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-800">Export to Local Disk</p>
                  <p className="text-xs text-gray-500">Download a full SQL dump of the current database.</p>
                </div>
                <button 
                  onClick={handleBackup}
                  className="px-4 py-2 bg-[#800000] text-white text-sm font-bold rounded-lg hover:bg-[#600000] flex items-center gap-2"
                >
                  <Download size={16} /> Download Backup
                </button>
              </div>
            </div>
            {/* ... Keep Scheduled Backups UI Static for now ... */}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="text-[#800000]" /> Officials & Staff
                </h3>
                <p className="text-sm text-gray-500 mt-1">Manage system access for Barangay officials.</p>
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black flex items-center gap-2">
                <Plus size={14} /> Add New User
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">No users found.</td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-bold border bg-blue-50 text-blue-700 border-blue-100">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`flex items-center gap-1 text-xs font-bold ${
                              user.status === 'Active' ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {user.status === 'Active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                              {user.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'interface':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Layout className="text-[#800000]" /> Interface Customization
              </h3>
              <p className="text-sm text-gray-500 mt-1">Customize the look and feel of the management portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ... Branding Section (Same as before) ... */}
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-700 mb-4">Theme Colors</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" name="primaryColor" className="h-8 w-12 rounded cursor-pointer" 
                            value={interfaceConfig.primaryColor} onChange={handleInterfaceChange} />
                          <span className="text-sm font-mono text-gray-600">{interfaceConfig.primaryColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" name="accentColor" className="h-8 w-12 rounded cursor-pointer" 
                            value={interfaceConfig.accentColor} onChange={handleInterfaceChange} />
                          <span className="text-sm font-mono text-gray-600">{interfaceConfig.accentColor}</span>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                <h4 className="font-bold text-gray-700 mb-4">Text Configuration</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Header Title</label>
                    <input type="text" name="headerTitle" value={interfaceConfig.headerTitle} onChange={handleInterfaceChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sub-header</label>
                    <input type="text" name="subHeader" value={interfaceConfig.subHeader} onChange={handleInterfaceChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Footer Text</label>
                    <input type="text" name="footerText" value={interfaceConfig.footerText} onChange={handleInterfaceChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white" />
                  </div>
                </div>
                <button onClick={handleSaveInterface} disabled={loading}
                  className="w-full mt-6 px-4 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-black text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save Interface Changes
                </button>
              </div>
            </div>
          </div>
        );

     case 'logs':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="text-[#800000]" /> Audit Logs
                </h3>
                <p className="text-sm text-gray-500 mt-1">Track user actions.</p>
              </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
               <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!Array.isArray(auditLogs) || auditLogs.length === 0) ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No logs found.<br/>
                        {/* Debug info for developers */}
                        {typeof auditLogs === 'object' && auditLogs !== null && (
                          <pre className="text-xs text-red-400 mt-2 bg-gray-50 p-2 rounded border border-gray-100 overflow-x-auto">{JSON.stringify(auditLogs, null, 2)}</pre>
                        )}
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        {/* 1. Timestamp */}
                        <td className="px-6 py-4 text-sm font-mono text-gray-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        {/* 2. User (Full Name) */}
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                          {log.user || 'Unknown User'}
                        </td>
                        {/* 3. Action Type */}
                        <td className="px-6 py-4">
                          {(() => {
                            const action = log.action?.toUpperCase() || '';
                            let color = 'bg-gray-100 text-gray-700';
                            let label = action;
                            if (action.includes('DELETE')) {
                              color = 'bg-red-100 text-red-700';
                              label = 'DELETE';
                            } else if (action.includes('CREATE')) {
                              color = 'bg-green-100 text-green-700';
                              label = 'CREATE';
                            } else if (action.includes('EDIT') || action.includes('UPDATE')) {
                              color = 'bg-blue-100 text-blue-700';
                              label = 'EDIT';
                            } else if (action.includes('SETTINGS')) {
                              color = 'bg-yellow-100 text-yellow-700';
                              label = 'SETTINGS';
                            } else if (action.includes('LOGIN')) {
                              color = 'bg-purple-100 text-purple-700';
                              label = 'LOGIN';
                            } else if (action.includes('EXPORT')) {
                              color = 'bg-cyan-100 text-cyan-700';
                              label = 'EXPORT';
                            }
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${color}`}>
                                {label}
                              </span>
                            );
                          })()}
                        </td>
                        {/* 4. Target/Details */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.details || log.target || log.info || ''}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                  <button 
                    onClick={prevLogPage} 
                    disabled={logsPage === 1} 
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16}/>
                  </button>
                  <span className="text-xs font-bold text-gray-600">Page {logsPage}</span>
                  <button 
                    onClick={nextLogPage} 
                    // Disable next if we have fewer items than the limit (meaning end of list)
                    disabled={auditLogs.length < 10} 
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16}/>
                  </button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 overflow-hidden">
      {/* Sidebar Nav */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
        <h2 className="text-lg font-bold text-gray-800 mb-6 px-8 pt-8">System Settings</h2>
        <nav className="space-y-1 px-4 pb-4">
          <button onClick={() => setActiveTab('database')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'database' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Database size={18} /> Database & Backup
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'users' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Users size={18} /> Officials & Staff
          </button>
          <button onClick={() => setActiveTab('interface')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'interface' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Layout size={18} /> Interface
          </button>
           <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'logs' ? 'bg-[#800000] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Activity size={18} /> Audit Logs
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Message Display */}
          {msg && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              msg.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {msg.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{msg.text}</span>
              <button
                onClick={() => setMsg(null)}
                className="ml-auto text-lg hover:opacity-70"
              >
                ×
              </button>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;