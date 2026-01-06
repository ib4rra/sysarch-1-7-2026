
import React from 'react';
import { Search, Plus, Filter, LogOut } from 'lucide-react';

const mockData = [
  { id: 'PWD-001', firstName: 'Juan', lastName: 'Dela Cruz', middleName: '.', age: 30, address: 'Nangka', hoa: 'N/A', guardian: 'N/A', remarks: 'Alive', disabilityType: 'Visual Impairment', status: 'Active', dateRegistered: '2023-01-15' },
  { id: 'PWD-002', firstName: 'Maria', lastName: 'Santos', middleName: '.', age: 25, address: 'Nangka', hoa: 'N/A', guardian: 'N/A', remarks: 'Alive', disabilityType: 'Orthopedic Disability', status: 'Pending', dateRegistered: '2023-11-20' },
  { id: 'PWD-003', firstName: 'Ricardo', lastName: 'Ramos', middleName: '.', age: 40, address: 'Nangka', hoa: 'N/A', guardian: 'N/A', remarks: 'Alive', disabilityType: 'Hearing Impairment', status: 'Active', dateRegistered: '2022-05-10' },
  { id: 'PWD-004', firstName: 'Elena', lastName: 'Gomez', middleName: '.', age: 35, address: 'Nangka', hoa: 'N/A', guardian: 'N/A', remarks: 'Alive', disabilityType: 'Speech Impairment', status: 'Expired', dateRegistered: '2020-08-30' },
];

const Dashboard = ({ onLogout }) => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500">Welcome back, Admin</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Registered PWDs</p>
          <p className="text-3xl font-bold text-[#800000]">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pending Applications</p>
          <p className="text-3xl font-bold text-orange-600">42</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Expiring IDs (30 Days)</p>
          <p className="text-3xl font-bold text-blue-600">18</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
              <Filter size={16} /> Filter
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#800000] rounded-lg hover:bg-[#600000] shadow-md transition-colors">
              <Plus size={16} /> New Record
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">ID Number</th>
                <th className="px-6 py-4 font-semibold">Full Name</th>
                <th className="px-6 py-4 font-semibold">Disability Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Registered Date</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockData.map((pwd) => (
                <tr key={pwd.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{pwd.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{`${pwd.firstName} ${pwd.lastName}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pwd.disabilityType}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pwd.status === 'Active' ? 'bg-green-100 text-green-700' :
                      pwd.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {pwd.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{pwd.dateRegistered}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-[#800000] font-semibold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
