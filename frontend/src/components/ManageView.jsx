
import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileDown, 
  Edit2, 
  Trash2, 
  Filter, 
  X, 
  Eye, 
  Printer, 
  Camera, 
  RefreshCcw,
  Save
} from 'lucide-react';

const ManageView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const disabilityTypes = [
    "Deaf / Hard of Hearing",
    "Visual Disability",
    "Orthopedic Disability",
    "Intellectual Disability",
    "Learning Disability",
    "Mental Disability",
    "Psychosocial Disability",
    "Speech and Language Impairment",
    "Cancer (Rare Disease)"
  ];

  const [mockRows, setMockRows] = useState([
    { 
      id: 'PWD-2024-001', 
      firstName: 'JEROME', 
      lastName: 'SANTOS', 
      middleName: 'M.', 
      disabilityType: 'Deaf / Hard of Hearing', 
      hoa: 'Nangka Hills', 
      dateRegistered: '2024-01-15',
      age: 24, 
      address: '45 Lilac St., Brgy. Nangka, Marikina', 
      guardian: 'Maria Santos', 
      status: 'Active',
      remarks: 'None'
    },
    { 
      id: 'PWD-2024-002', 
      firstName: 'ANTON', 
      lastName: 'DELA CRUZ', 
      middleName: 'R.', 
      disabilityType: 'Visual Disability', 
      hoa: 'Twinville', 
      dateRegistered: '2024-02-10',
      age: 30, 
      address: '12 Sumulong Hwy, Marikina', 
      guardian: 'Roberto Dela Cruz', 
      status: 'Active',
      remarks: 'None'
    },
    { 
      id: 'PWD-2024-003', 
      firstName: 'KAIRA', 
      lastName: 'VILLANUEVA', 
      middleName: 'G.', 
      disabilityType: 'Learning Disability', 
      hoa: 'Riverside', 
      dateRegistered: '2023-11-22',
      age: 19, 
      address: '98 J.P. Rizal St., Marikina', 
      guardian: 'Gloria Villanueva', 
      status: 'Inactive',
      remarks: 'Relocated'
    }
  ]);

  const filteredRows = useMemo(() => {
    return mockRows.filter(row => 
      row.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${row.firstName} ${row.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mockRows, searchQuery]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setMockRows(prev => prev.filter(row => row.id !== id));
    }
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setShowFormModal(true);
  };

  // Fixed TypeScript errors by ensuring FormDataEntryValue is converted to string
  const handleSaveRecord = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Use String() to cast FormDataEntryValue to string safely
    const firstName = String(formData.get('firstName') || '').toUpperCase();
    const lastName = String(formData.get('lastName') || '').toUpperCase();
    const middleName = String(formData.get('middleName') || '').toUpperCase();
    const disabilityType = String(formData.get('disabilityType') || '');
    const hoa = String(formData.get('hoa') || '');
    const ageValue = String(formData.get('age') || '0');
    const age = parseInt(ageValue) || 0;
    const address = String(formData.get('address') || '');
    const guardian = String(formData.get('guardian') || '');
    const status = String(formData.get('status') || 'Active');
    const remarks = String(formData.get('remarks') || 'None');

    const recordData = {
      id: (editingRecord?.id || `PWD-${new Date().getFullYear()}-${String(mockRows.length + 1).padStart(3, '0')}`),
      firstName,
      lastName,
      middleName,
      disabilityType,
      hoa,
      age,
      address,
      guardian,
      status,
      dateRegistered: (editingRecord?.dateRegistered || new Date().toISOString().split('T')[0]),
      remarks
    };

    if (editingRecord) {
      setMockRows(prev => prev.map(row => row.id === editingRecord.id ? recordData : row));
    } else {
      setMockRows(prev => [recordData, ...prev]);
    }

    setShowFormModal(false);
    setEditingRecord(null);
  };

  const handleExportCSV = () => {
    // 1. Define the headers for the CSV
    const headers = [
      "ID Number", 
      "First Name", 
      "Last Name", 
      "Middle Name", 
      "Disability Type", 
      "HOA", 
      "Date Registered", 
      "Age", 
      "Address", 
      "Guardian", 
      "Status", 
      "Remarks"
    ];

    // 2. Map the data into rows, ensuring commas in fields like Address are handled
    const rows = mockRows.map(row => [
      row.id,
      row.firstName,
      row.lastName,
      row.middleName,
      row.disabilityType,
      row.hoa,
      row.dateRegistered,
      row.age,
      `"${row.address.replace(/"/g, '""')}"`, // Handle quotes and commas in addresses
      row.guardian,
      row.status,
      `"${row.remarks.replace(/"/g, '""')}"`
    ]);

    // 3. Combine headers and rows into a single string
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // 4. Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Barangay_Nangka_PWD_Records_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startCamera = async () => {
    setIsCapturing(true);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access.");
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setCapturedPhoto(canvasRef.current.toDataURL('image/png'));
        
        const stream = videoRef.current.srcObject;
        if (stream && stream.getTracks) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
        setIsCapturing(false);
      }
    }
  };

  const handlePrint = () => window.print();

  const closeViewModal = () => {
    setSelectedRecord(null);
    setCapturedPhoto(null);
    setIsCapturing(false);
  };

  const MARIKINA_SEAL = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png";
  const BAGONG_PILIPINAS = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8S5k9_hM5o5ZpX_C0F8pE7V7q9e7_p7Xq_A&s";

  const getQRCodeUrl = (id) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(id)}`;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Citizen Records</h2>
          <p className="text-sm text-gray-500">Manage and update PWD profiles for Barangay Nangka.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 shadow-sm transition-all"
          >
            <FileDown size={18} /> Export CSV
          </button>
          <button 
            onClick={() => { setEditingRecord(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#800000] text-white text-sm font-semibold rounded-lg hover:bg-[#600000] shadow-md transition-all"
          >
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center no-print">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID Number</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Disability</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">HOA</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRows.length > 0 ? filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-500">{row.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{row.firstName} {row.lastName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-100 uppercase">{row.disabilityType}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      row.status === 'Active' 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {row.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.hoa}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedRecord(row)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="View Full Info & ID"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 text-gray-400 hover:text-[#800000] hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#800000] text-white flex items-center justify-between">
              <h3 className="text-lg font-bold uppercase tracking-tight">
                {editingRecord ? 'Edit PWD Record' : 'New PWD Registration'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveRecord}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                  <input name="firstName" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" placeholder="e.g. Jerome" defaultValue={editingRecord?.firstName} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                  <input name="lastName" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" placeholder="e.g. Santos" defaultValue={editingRecord?.lastName} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Middle Name</label>
                  <input name="middleName" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" placeholder="e.g. M." defaultValue={editingRecord?.middleName} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Age</label>
                  <input name="age" type="number" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" placeholder="e.g. 24" defaultValue={editingRecord?.age} required />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specific Disability Type</label>
                  <select name="disabilityType" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" defaultValue={editingRecord?.disabilityType} required>
                    <option value="">Select Type</option>
                    {disabilityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HOA / Village</label>
                  <input name="hoa" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" placeholder="e.g. Nangka Hills" defaultValue={editingRecord?.hoa} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guardian</label>
                  <input name="guardian" type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" placeholder="e.g. Maria Santos" defaultValue={editingRecord?.guardian} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</label>
                  <select name="status" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" defaultValue={editingRecord?.status || 'Active'}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residential Address</label>
                <textarea name="address" rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10" placeholder="e.g. 45 Lilac St., Brgy. Nangka, Marikina" defaultValue={editingRecord?.address} required></textarea>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-[#800000] text-white text-sm font-bold rounded-lg hover:bg-[#600000] shadow-lg flex items-center gap-2 transition-all">
                  <Save size={16} /> {editingRecord ? 'Update Record' : 'Register Citizen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRecord && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto no-print-bg">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl my-auto animate-in zoom-in-95 duration-200 flex flex-col no-print-shadow">
            
            <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 no-print">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#800000] rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Citizen ID Preview</h3>
                  <p className="text-sm text-gray-400 font-mono tracking-widest uppercase">{selectedRecord.id}</p>
                </div>
              </div>
              <button onClick={closeViewModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
            </div>

            <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-12">
              <div className="space-y-8 print-section">
                <div className="id-card-wrapper">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-3 no-print">Front Design</h4>
                  <div className="id-card-main id-front-design bg-[#fdf2f2] shadow-2xl relative overflow-hidden font-sans border border-gray-300">
                    <div className="bg-[#7c0000] h-[90px] w-full flex items-center px-4 relative z-0">
                       <img src={MARIKINA_SEAL} className="w-[70px] h-[70px] bg-white rounded-full p-1 shadow-md shrink-0 border border-gray-200" alt="Marikina Seal" />
                       <div className="flex-grow text-center text-white px-2">
                         <h4 className="text-[10px] font-bold leading-none tracking-tight">REPUBLIC OF THE PHILIPPINES</h4>
                         <h4 className="text-[14px] font-black leading-none my-1 tracking-tight">CITY OF MARIKINA</h4>
                         <h4 className="text-[16px] font-black leading-none tracking-tight">BARANGAY NANGKA</h4>
                         <div className="mt-1 text-[7px] font-bold leading-tight uppercase opacity-90">
                           #9 OLD J.P. RIZAL ST. NANGKA, MARIKINA CITY<br/>
                           TEL NOS. 934-8625 - BRGY TANOD / 934-8628 - BRGY OFFICE
                         </div>
                       </div>
                       <img src={BAGONG_PILIPINAS} className="w-[70px] h-[70px] bg-white rounded-full p-1 shadow-md shrink-0 border border-gray-200" alt="Bagong Pilipinas" />
                    </div>

                    <div className="px-6 py-5">
                      <h2 className="text-center text-[22px] font-black text-black tracking-tight mb-2 uppercase italic">BARANGAY NANGKA PWD MEMBER</h2>
                      <div className="flex justify-center gap-10 mb-4 px-8">
                        <p className="text-[11px] font-bold">CLUSTER GROUP NO: <span className="border-b-2 border-black inline-block w-16 text-center font-black">---</span></p>
                        <p className="text-[11px] font-bold">PWD TAG NO: <span className="border-b-2 border-black inline-block w-16 text-center font-black">---</span></p>
                      </div>
                      <div className="flex gap-5 mt-2">
                        <div className="flex flex-col items-center gap-2 w-[140px] shrink-0">
                          <div className="w-[140px] h-[140px] bg-white border-2 border-gray-400 shadow-inner overflow-hidden flex items-center justify-center">
                            {capturedPhoto ? <img src={capturedPhoto} className="w-full h-full object-cover" /> : <div className="text-gray-200 flex flex-col items-center"><Camera size={48} className="opacity-20" /><span className="text-[10px] font-bold uppercase mt-2">No Photo</span></div>}
                          </div>
                          <div className="w-full mt-2 flex flex-col items-center">
                            <div className="w-full h-[1.5px] bg-black mb-1"></div>
                            <p className="text-[9px] font-black uppercase text-black text-center leading-none">Signature Over Printed Name</p>
                          </div>
                        </div>

                        <div className="flex-grow relative">
                           <div className="absolute -top-1 right-0 w-[52px] h-[52px] bg-white border border-gray-200 p-0.5">
                              <img src={getQRCodeUrl(selectedRecord.id)} className="w-full h-full object-contain" alt="QR" />
                           </div>

                           <div className="space-y-2 pr-14">
                              <div className="flex flex-col border-b border-black/10 pb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-0.5">FULL NAME:</span>
                                <span className="text-[15px] font-black text-black uppercase leading-tight truncate">{selectedRecord.firstName} {selectedRecord.lastName}</span>
                              </div>
                              <div className="flex flex-col border-b border-black/10 pb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-0.5">ADDRESS:</span>
                                <span className="text-[11px] font-bold text-black uppercase leading-tight line-clamp-2">{selectedRecord.address}</span>
                              </div>
                              <div className="flex flex-col border-b border-black/10 pb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-0.5">HOA:</span>
                                <span className="text-[12px] font-black text-black uppercase leading-tight">{selectedRecord.hoa}</span>
                              </div>
                              <div className="flex flex-col border-b border-black/10 pb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-0.5">P.W.D ID NUMBER:</span>
                                <span className="text-[14px] font-black text-[#800000] font-mono leading-tight">{selectedRecord.id}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-0.5">TYPE OF DISABILITY:</span>
                                <span className="text-[12px] font-black text-black uppercase leading-tight">{selectedRecord.disabilityType}</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#7c0000] absolute bottom-0 w-full py-1.5 flex items-center justify-center px-6">
                      <p className="text-white text-[8px] italic font-bold text-center leading-tight">"Ang ID na ito ay para lamang sa mga benepisyo at programa para sa mga taong may kapansanan sa Barangay Nangka"</p>
                    </div>
                  </div>
                </div>

                <div className="id-card-wrapper">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-3 no-print">Back Design</h4>
                  <div className="id-card-main id-back-design bg-[#fdf2f2] shadow-2xl relative overflow-hidden font-sans border border-gray-300">
                    <div className="bg-[#7c0000] h-[80px] w-full flex items-center px-6 relative">
                       <img src={MARIKINA_SEAL} className="w-[60px] h-[60px] bg-white rounded-full p-1 shadow-sm" alt="Marikina Seal" />
                       <div className="flex-grow text-center text-white px-2">
                         <h4 className="text-[10px] font-bold leading-none">REPUBLIC OF THE PHILIPPINES</h4>
                         <h4 className="text-[14px] font-black leading-none my-1">CITY OF MARIKINA</h4>
                         <h4 className="text-[16px] font-black leading-none">BARANGAY NANGKA</h4>
                       </div>
                       <img src={BAGONG_PILIPINAS} className="w-[60px] h-[60px] bg-white rounded-full p-1 shadow-sm" alt="Bagong Pilipinas" />
                    </div>

                    <div className="px-10 py-8 relative h-full">
                      <div className="absolute top-10 right-10 w-[100px] h-[100px] bg-white border-2 border-gray-200 p-1 shadow-sm">
                         <img src={getQRCodeUrl(selectedRecord.id)} className="w-full h-full object-contain" alt="Verification QR" />
                         <div className="absolute -bottom-5 w-full text-center text-[7px] font-black text-gray-400 uppercase">Scan to Verify</div>
                      </div>

                      <div className="space-y-6 w-[65%]">
                        <div className="space-y-3">
                          <h5 className="text-[14px] font-black uppercase text-black italic tracking-tight">IN CASE OF EMERGENCY, PLS. NOTIFY:</h5>
                          <div className="space-y-2 pl-2">
                             <div className="flex items-end border-b border-black pb-0.5">
                               <span className="text-[10px] font-bold text-gray-500 w-20">NAME:</span>
                               <span className="text-[12px] font-bold text-black uppercase flex-grow">{selectedRecord.guardian || '---'}</span>
                             </div>
                             <div className="flex items-end border-b border-black pb-0.5">
                               <span className="text-[10px] font-bold text-gray-500 w-20">CONTACT:</span>
                               <span className="text-[12px] font-bold text-black uppercase flex-grow">09XX-XXX-XXXX</span>
                             </div>
                             <div className="flex items-end border-b border-black pb-0.5">
                               <span className="text-[10px] font-bold text-gray-500 w-20">ADDRESS:</span>
                               <span className="text-[11px] font-bold text-black uppercase flex-grow truncate">{selectedRecord.address}</span>
                             </div>
                          </div>
                        </div>

                        <div className="text-center pt-2">
                          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">UNDER THE ADMINISTRATION OF</p>
                          <p className="text-[18px] font-black text-black uppercase leading-tight">HON. CELSO R. DELAS ARMAS JR.</p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider italic">BARANGAY CAPTAIN</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#7c0000] absolute bottom-0 w-full py-2 px-10">
                      <p className="text-white text-[8px] text-center leading-tight font-medium opacity-90 italic">This PWD Card is issued exclusively to residents of Barangay Nangka, Marikina City. Valid only within the barangay. Misuse is prohibited.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 no-print">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3 mb-6">Capture Station</h4>
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-inner mb-6">
                      {isCapturing ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-500"><Camera size={48} className="mb-2 opacity-20" /><p className="text-[10px] font-bold uppercase tracking-widest">Camera Offline</p></div>}
                      {isCapturing && <div className="absolute inset-x-0 bottom-6 flex justify-center"><button onClick={capturePhoto} className="px-8 py-3 bg-red-600 text-white font-black rounded-full shadow-2xl hover:bg-red-700 active:scale-95 transition-all uppercase tracking-tighter flex items-center gap-2"><Camera size={18} /> Take Photo</button></div>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={startCamera} className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg">{isCapturing ? <RefreshCcw size={18} /> : <Camera size={18} />} {isCapturing ? "Reset" : "Camera"}</button>
                       <button onClick={handlePrint} className="flex items-center justify-center gap-3 px-6 py-4 bg-[#800000] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#600000] transition-all shadow-lg"><Printer size={18} /> Print ID</button>
                    </div>
                 </div>
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-3">Digital Verification</h4>
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-center">
                         <img src={getQRCodeUrl(selectedRecord.id)} className="w-full h-full object-contain" alt="QR Link" />
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital ID Token</p>
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-slate-600 border border-slate-100 inline-block">
                             {selectedRecord.id}
                          </div>
                          <p className="text-[9px] text-slate-400 italic leading-tight">QR codes on both sides ensure this ID is verifiable via the system scanner.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 sticky bottom-0 z-10 no-print">
              <button onClick={closeViewModal} className="px-8 py-3 font-black text-slate-500 hover:text-slate-800 transition-colors uppercase text-xs tracking-widest">Close Preview</button>
              <button onClick={() => { closeViewModal(); handleOpenEdit(selectedRecord); }} className="px-12 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all uppercase text-xs tracking-widest">Update Info</button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <style>{`
        .id-card-wrapper { width: fit-content; margin: 0 auto; }
        .id-card-main { width: 500px; height: 315px; border-radius: 16px; }
        @media print {
          .no-print { display: none !important; }
          .no-print-bg { background: transparent !important; backdrop-filter: none !important; position: static !important; display: block !important; padding: 0 !important; }
          .no-print-shadow { box-shadow: none !important; border: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .id-card-main {
            width: 3.375in !important; height: 2.125in !important; margin: 0.5in auto !important; border: 0.5pt solid #ddd !important;
            border-radius: 0.125in !important; page-break-after: always !important; box-shadow: none !important; display: block !important; position: relative !important;
          }
          .bg-[#7c0000] { background-color: #7c0000 !important; -webkit-print-color-adjust: exact !important; }
          .bg-[#fdf2f2] { background-color: #fdf2f2 !important; -webkit-print-color-adjust: exact !important; }
          .text-white { color: white !important; }
          .id-card-main h4 { font-size: 7pt !important; }
          .id-card-main h2 { font-size: 14pt !important; }
          .id-card-main span { font-size: 8pt !important; }
          .id-card-main p { font-size: 6pt !important; }
          img { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default ManageView;
