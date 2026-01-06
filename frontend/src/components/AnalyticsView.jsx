
import React from 'react';
import { Calendar, RefreshCw, Users, Clock, FileDown, Printer, ShieldAlert } from 'lucide-react';

const AnalyticsView = () => {
  // Function to handle Excel (CSV) download for analytics summary
  const handleDownloadExcel = () => {
    const reportDate = new Date().toLocaleDateString();
    const fileName = `Barangay_Nangka_PWD_Analytics_${new Date().toISOString().split('T')[0]}.csv`;

    // Structured data for the CSV report
    const data = [
      ["BARANGAY NANKGA PWD SYSTEM - ANALYTICS REPORT"],
      ["Date Generated", reportDate],
      ["Generating Office", "Barangay Nangka PWD Management Office"],
      [],
      ["OVERVIEW STATISTICS"],
      ["Metric", "Value", "Status"],
      ["Total Registered PWD", "1,248", "Active"],
      ["Pending Applications", "42", "Awaiting Review"],
      ["ID Renewals Due", "18", "Urgent"],
      [],
      ["DISABILITY CLASSIFICATIONS"],
      ["Type", "Count", "Percentage"],
      ["Physical", "23", "18.4%"],
      ["Visual", "27", "21.6%"],
      ["Hearing", "12", "9.6%"],
      ["Mental", "20", "16.0%"],
      ["Multiple", "40", "32.0%"],
      [],
      ["GENDER DISTRIBUTION"],
      ["Gender", "Count", "Percentage"],
      ["Male", "695", "55.7%"],
      ["Female", "553", "44.3%"],
      [],
      ["FOOTER INFORMATION"],
      ["System Version", "v2.0"],
      ["Confidentiality", "Official Use Only - Barangay Nangka Records"],
      ["Verified By", "", "__________________________"]
    ];

    // Convert array to CSV string
    const csvContent = data.map(row => 
      row.map(cell => {
        const str = String(cell);
        return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ).join("\n");

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to handle professional printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 print-container" 
      data-date={new Date().toLocaleDateString()}
    >
      {/* Top Banner - The header that appears in the app but is restyled for print */}
      <div className="bg-[#800000] text-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center shadow-lg print:bg-white print:text-black print:shadow-none print:border-b-2 print:border-black print:rounded-none">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-1 font-montserrat tracking-tight uppercase">System Analytical Dashboard</h2>
          <p className="opacity-80 text-xs md:text-sm">Official PWD Statistics - Barangay Nangka, Marikina City</p>
        </div>
        <div className="hidden md:flex gap-2 no-print">
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm border border-white/20 transition-colors">
            <Calendar size={16} /> Last Month
          </button>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm border border-white/20 transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow print:border-black print:shadow-none">
          <div className="p-4 bg-red-50 rounded-lg text-red-800 no-print">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">Total Registered PWD</p>
            <p className="text-3xl md:text-4xl font-black text-red-800 print:text-black">1,248</p>
            <p className="text-[10px] text-gray-500 italic">Active memberships</p>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow print:border-black print:shadow-none">
          <div className="p-4 bg-orange-50 rounded-lg text-orange-600 no-print">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">Pending Applications</p>
            <p className="text-3xl md:text-4xl font-black text-orange-600 print:text-black">42</p>
            <p className="text-[10px] text-gray-500 italic">Review in progress</p>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow print:border-black print:shadow-none">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-600 no-print">
            <ShieldAlert size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">ID Renewals Due</p>
            <p className="text-3xl md:text-4xl font-black text-blue-600 print:text-black">18</p>
            <p className="text-[10px] text-gray-500 italic">Within 30 days</p>
          </div>
        </div>
      </div>

      {/* Charts Section - Using grid for layout and print-optimized colors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        {/* Bar Chart Container */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm print:border-black print:mb-8">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 italic uppercase text-sm tracking-tight print:text-black">
            <span className="text-xl no-print">📊</span> Disability Classifications
          </h3>
          <div className="h-64 flex items-end justify-around border-b border-gray-100 pb-2 gap-2 md:gap-4 print:border-black">
            {[
              { label: 'Physical', val: 23, color: 'bg-cyan-500' },
              { label: 'Visual', val: 27, color: 'bg-blue-500' },
              { label: 'Hearing', val: 12, color: 'bg-indigo-500' },
              { label: 'Mental', val: 20, color: 'bg-purple-500' },
              { label: 'Multiple', val: 40, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center w-full group">
                <div 
                  className={`w-full ${item.color} rounded-t-sm transition-all group-hover:opacity-80 print:bg-gray-300 print:border print:border-black`} 
                  style={{ height: `${(item.val / 40) * 100}%` }}
                ></div>
                <span className="text-[8px] md:text-[10px] mt-2 font-black text-gray-500 uppercase text-center print:text-black">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart Container */}
        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm print:border-black">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 italic uppercase text-sm tracking-tight print:text-black">
            <span className="text-xl no-print">📈</span> Gender Distribution
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 md:gap-8 h-64">
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden flex shadow-inner border border-gray-100 print:border-black">
              <div className="h-full bg-emerald-500 print:bg-gray-400" style={{ width: '55.7%' }}></div>
              <div className="h-full bg-amber-500 print:bg-gray-100" style={{ width: '44.3%' }}></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white font-black text-[9px] md:text-[10px] absolute right-6 md:right-8 text-center drop-shadow-md print:text-black">M: 55.7%</div>
                <div className="text-white font-black text-[9px] md:text-[10px] absolute left-4 md:left-6 text-center drop-shadow-md print:text-black">F: 44.3%</div>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-emerald-500 rounded-sm print:bg-gray-400 print:border print:border-black"></div>
                <span className="text-[10px] font-bold text-gray-600 uppercase">Male Residents</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-500 rounded-sm print:bg-gray-100 print:border print:border-black"></div>
                <span className="text-[10px] font-bold text-gray-600 uppercase">Female Residents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer - Contains the main action buttons */}
      <div className="pt-8 border-t border-gray-200 no-print">
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Reporting Actions</h4>
            <p className="text-[10px] text-gray-500 font-medium">Generate documents for official Barangay use</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDownloadExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 p-3 px-6 rounded-lg font-black text-[#800000] hover:bg-red-50 transition-all text-[10px] uppercase tracking-widest shadow-sm"
            >
              <FileDown size={16} /> Download Excel
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#800000] text-white p-3 px-8 rounded-lg font-black shadow-lg hover:bg-[#600000] transition-all text-[10px] uppercase tracking-widest active:scale-95"
            >
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Embedded CSS for specialized print layouts */}
      <style>{`
        @media print {
          /* Hide non-essential UI elements like the sidebar, header, and buttons */
          .no-print, nav, header, aside, .sidebar-container { display: none !important; }
          
          /* Reset body and container styles for A4 paper */
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .print-container { max-width: 100% !important; margin: 0 !important; padding: 0.75in !important; width: 100% !important; }
          
          /* Remove shadows and simplify borders for cleaner printing */
          .shadow-sm, .shadow-lg, .shadow-md, .shadow-2xl { box-shadow: none !important; }
          .bg-white { background-color: white !important; }
          .bg-[#800000] { background-color: transparent !important; color: black !important; border-bottom: 2pt solid black !important; padding: 0 0 10pt 0 !important; }
          button { display: none !important; }
          
          /* Force page breaks and ensure high-contrast colors for visibility */
          .print-container div { break-inside: avoid; }
          
          /* Automated footer with system details and date */
          .print-container::after {
            content: "Official Barangay Nangka PWD Analytics Report | Generated: " attr(data-date) " | System v2.0";
            display: block;
            margin-top: 4rem;
            font-size: 8pt;
            text-align: center;
            border-top: 1pt solid black;
            padding-top: 1rem;
            color: #444;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsView;
