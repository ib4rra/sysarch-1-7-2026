import React, { useEffect, useState, useCallback } from 'react';
import { 
  Calendar, RefreshCw, Users, FileDown, 
  Printer, Activity, UserPlus,
  UserCheck, HeartHandshake, MapPin
} from 'lucide-react';
// IMPORTS UPDATED: Added pwdAdminAPI to fetch raw records for calculation
import { analyticsAPI, pwdAdminAPI } from '../../api';

// --- Constants & Config ---
const THEME_COLOR = '#800000';

// --- Reusable Components ---

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, color, label, value, subtext, loading }) => {
  if (loading) return <SkeletonCard />;
  
  const colorClasses = {
    red: 'bg-red-50 text-red-800',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600', 
    amber: 'bg-amber-50 text-amber-600', 
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300 print:border-black print:shadow-none h-full">
      <div className={`p-4 rounded-xl ${colorClasses[color] || 'bg-gray-50 text-gray-600'} no-print`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black">{label}</p>
        <h3 className="text-3xl font-black text-gray-800 print:text-black tracking-tight">{value}</h3>
        <p className="text-[11px] text-gray-500 font-medium mt-1">{subtext}</p>
      </div>
    </div>
  );
};

// --- Custom CSS Charts ---

const SimpleBarChart = ({ data, maxVal }) => {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
  
  return (
    <div className="space-y-4 w-full">
      {data.map((item, idx) => {
        const percentage = Math.max((item.count / maxVal) * 100, 1); 
        return (
          <div key={idx} className="w-full group">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-gray-700">{item.label}</span>
              <span className="text-gray-500 font-mono">{item.count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden print:border print:border-gray-300">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]} print:bg-gray-600`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AgeDistributionChart = ({ seniors, total }) => {
  const nonSeniors = Math.max(0, total - seniors);
  const seniorPct = total > 0 ? ((seniors / total) * 100).toFixed(1) : 0;
  const nonSeniorPct = total > 0 ? ((nonSeniors / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 pt-2 h-full flex flex-col justify-center">
      {/* Visual Bar */}
      <div>
        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
           <span>Distribution Split</span>
           <span>Total: {total}</span>
        </div>
        <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden flex shadow-inner print:border print:border-black">
            <div 
            className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000" 
            style={{ width: `${seniorPct}%` }}
            >
            {parseFloat(seniorPct) > 10 && `${seniorPct}%`}
            </div>
            <div 
            className="bg-blue-400 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000" 
            style={{ width: `${nonSeniorPct}%` }}
            >
            {parseFloat(nonSeniorPct) > 10 && `${nonSeniorPct}%`}
            </div>
        </div>
      </div>

      {/* Legend / Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Senior Citizens</p>
          <p className="text-2xl font-black text-emerald-800">{seniors}</p>
          <p className="text-[9px] text-emerald-600/70 font-medium">60 Years & Above</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Adults / Minors</p>
          <p className="text-2xl font-black text-blue-800">{nonSeniors}</p>
          <p className="text-[9px] text-blue-600/70 font-medium">59 Years & Below</p>
        </div>
      </div>
    </div>
  );
};

const VerticalBarChart = ({ data, maxVal }) => {
  return (
    <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-2">
      {data.map((item, idx) => {
        const heightPct = Math.max((item.count / maxVal) * 100, 5);
        return (
          <div key={idx} className="flex flex-col items-center justify-end w-full group h-full relative">
            {/* Tooltip-like label on hover */}
            <div className="absolute -top-8 text-sm font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 bg-white px-2 py-1 rounded shadow border border-gray-100 z-10">
              {item.count} Residents
            </div>
            
            {/* The Bar */}
            <div className="w-full bg-gray-100 rounded-t-lg h-full flex items-end overflow-hidden relative">
                 <div 
                    className="w-full bg-[#800000] opacity-90 group-hover:opacity-100 transition-all duration-500 rounded-t-lg print:bg-gray-400 print:border print:border-black"
                    style={{ height: `${heightPct}%` }}
                ></div>
            </div>
            
            {/* X-Axis Label */}
            <div className="mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#800000] transition-colors">Cluster {item.cluster}</div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Component ---

const AnalyticsView = () => {
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [overview, setOverview] = useState({
    totalRegistered: 0,
    seniors: 0,
    newRegistrants: 0, 
    genderDistribution: [],
    disabilities: [],
    clusterGroups: [],
  });

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch Analytics Summary AND All Registrants to calculate new entries manually
      const [analyticsRes, registrantsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        pwdAdminAPI.getRegistrants()
      ]);

      let newRegistrantsCount = 0;

      // Logic to calculate NEW Registrants for the current month
      if (registrantsRes) {
        const records = Array.isArray(registrantsRes) ? registrantsRes : (registrantsRes.data || []);
        
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentYear = now.getFullYear();

        newRegistrantsCount = records.filter(record => {
            // Check both registration_date formats
            const dateStr = record.registration_date || record.registrationDate;
            if (!dateStr) return false;
            
            const regDate = new Date(dateStr);
            return regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear;
        }).length;
      }

      if (analyticsRes && analyticsRes.success) {
        setOverview({
            ...analyticsRes.data,
            newRegistrants: newRegistrantsCount // Override with actual calculated value
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics overview', err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDownloadExcel = () => {
    const reportDate = new Date().toLocaleDateString();
    const fileName = `Barangay_Nangka_PWD_Analytics_${new Date().toISOString().split('T')[0]}.csv`;

    const disabilityData = (overview.disabilities || []).map(d => [d.label, d.count]);
    const clusterData = (overview.clusterGroups || []).map(c => [`Cluster ${c.cluster}`, c.count]);

    const data = [
      ["BARANGAY NANKGA PWD SYSTEM - ANALYTICS REPORT"],
      ["Date Generated", reportDate],
      ["Status", "Official Record"],
      [],
      ["OVERVIEW STATISTICS"],
      ["Metric", "Value", "Notes"],
      ["Total Registered PWD", overview.totalRegistered, "Active Database"],
      ["Senior Citizens", overview.seniors, "Age 60+"],
      ["New Registrants", overview.newRegistrants, "Current Month"],
      [],
      ["DISABILITY BREAKDOWN"],
      ["Type", "Count"],
      ...disabilityData,
      [],
      ["CLUSTER DISTRIBUTION"],
      ["Cluster", "Count"],
      ...clusterData,
    ];

    const csvContent = data.map(row => 
      row.map(cell => {
        const str = String(cell || '');
        return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  // Data helpers for charts
  const maxDisabilityVal = overview.disabilities ? Math.max(...overview.disabilities.map(d => d.count), 1) : 1;
  const maxClusterVal = overview.clusterGroups ? Math.max(...overview.clusterGroups.map(c => c.count), 1) : 1;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 print-container font-sans" data-date={new Date().toLocaleDateString()}>
      
      {/* Header */}
      <div className="bg-[#800000] text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center shadow-xl shadow-red-900/10 print:bg-transparent print:text-black print:shadow-none print:border-b-2 print:border-black print:rounded-none">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">PWD Analytics Dashboard</h2>
          <p className="opacity-90 text-sm font-medium">Barangay Nangka, Marikina City • Official Registry</p>
        </div>
        <div className="hidden md:flex gap-3 no-print mt-4 md:mt-0">
          <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium border border-white/10 flex items-center gap-2">
            <Calendar size={16} /> {new Date().toLocaleDateString()}
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white text-[#800000] hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - 3 Columns as Requested */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          loading={loading}
          icon={Users} 
          color="red" 
          label="Total Registered" 
          value={overview.totalRegistered} 
          subtext="Active PWD Members" 
        />
        <StatCard 
          loading={loading}
          icon={HeartHandshake} 
          color="emerald" 
          label="Senior Citizens" 
          value={overview.seniors || 0} 
          subtext="Age 60 and above" 
        />
        <StatCard 
          loading={loading}
          icon={UserPlus} 
          color="blue" 
          label="New Registrants" 
          value={overview.newRegistrants || 0} 
          subtext="This Month (Workload)" 
        />
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        
        {/* Horizontal Bar Chart: Disabilities */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:border-black print:shadow-none print:mb-8 break-inside-avoid flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Activity size={18} className="text-[#800000]" /> Disability Classification
            </h3>
          </div>
          
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-100 rounded-full w-full"></div>)}
            </div>
          ) : (
            <div className="flex-1">
                <SimpleBarChart data={overview.disabilities || []} maxVal={maxDisabilityVal} />
            </div>
          )}
        </div>

        {/* Right Column: Age Demographics */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:border-black print:shadow-none break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                <UserCheck size={18} className="text-[#800000]" /> Age Demographics
            </h3>
            </div>
            {loading ? (
                <div className="h-24 w-full bg-gray-100 rounded-lg animate-pulse" />
            ) : (
                <AgeDistributionChart seniors={overview.seniors || 0} total={overview.totalRegistered || 1} />
            )}
        </div>
      </div>

      {/* Charts Grid - Row 3 (Full Width) */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm print:border-black print:shadow-none break-inside-avoid">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 uppercase text-xs tracking-widest">
            <MapPin size={18} className="text-[#800000]" /> Population by Cluster
          </h3>
          <p className="text-xs text-gray-400 mb-6">Distribution of PWD members across geographic clusters</p>
          
          {loading ? (
             <div className="h-48 flex items-end gap-4 animate-pulse">
                {[1,2,3,4,5,6].map(i => <div key={i} className="w-full bg-gray-100 rounded-t-lg" style={{height: `${i * 15}%`}}></div>)}
             </div>
          ) : (
             <VerticalBarChart data={overview.clusterGroups || []} maxVal={maxClusterVal} />
          )}
      </div>

      {/* Action Footer */}
      <div className="pt-8 border-t border-gray-200 no-print">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Report Actions</h4>
            <p className="text-xs text-gray-500 mt-1">Generate official documents for internal use</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDownloadExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 p-3 px-6 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all text-xs uppercase tracking-wider shadow-sm"
            >
              <FileDown size={16} /> Export CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#800000] text-white p-3 px-8 rounded-lg font-bold shadow-lg shadow-red-900/20 hover:bg-[#600000] transition-all text-xs uppercase tracking-wider active:scale-95"
            >
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Print Specific Styles */}
      <style>{`
        @media print {
          @page { margin: 0.5in; size: auto; }
          .no-print, nav, header, aside { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-container { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .bg-white { background-color: white !important; }
          /* Ensure charts render in print */
          .print\\:bg-gray-600 { background-color: #4b5563 !important; }
          .print\\:bg-gray-400 { background-color: #9ca3af !important; }
          
          .print-container::after {
            content: "Official Barangay Nangka PWD Analytics | Generated: " attr(data-date);
            display: block;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #ccc;
            font-size: 10px;
            text-align: center;
            color: #666;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsView;