import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  X, 
  Eye, 
  Printer, 
  Camera, 
  Save,
  User,
  HeartPulse,
  MoreHorizontal,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Upload,
  FileText,
  Phone
} from 'lucide-react';
import { pwdAdminAPI } from '../api';

// Constants for official logos
const NANGKA_LOGO = "https://i.ibb.co/C3X9jK3f/barangay-nangka-logo.png";
const BAGONG_PILIPINAS = "https://upload.wikimedia.org/wikipedia/commons/f/f6/Bagong_Pilipinas_logo.png";
const MARIKINA_SEAL = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png";

const ManageView = ({ records = [], setRecords = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [viewRecord, setViewRecord] = useState(null);
  const [openMenuRowId, setOpenMenuRowId] = useState(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [causeType, setCauseType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    disabilityType: '',
    clusterGroupNo: ''
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Load records on component mount
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setIsLoading(true);
        const response = await pwdAdminAPI.getRegistrants();
        if (response.data && Array.isArray(response.data)) {
          setRecords(response.data);
        }
      } catch (err) {
        console.error('Error loading records:', err);
        setError(err.message || 'Failed to load records');
      } finally {
        setIsLoading(false);
      }
    };
    loadRecords();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      setCapturedPhoto(selectedRecord.photo || null);
    }
  }, [selectedRecord]);

  const filteredRows = useMemo(() => {
    return (records || []).filter(row => {
      const name = `${row.firstName} ${row.lastName}`.toLowerCase();
      const id = row.id.toLowerCase();
      const search = searchQuery.toLowerCase();
      
      const matchesSearch = name.includes(search) || id.includes(search);
      const matchesStatus = filterCriteria.status ? row.status === filterCriteria.status : true;
      const matchesType = filterCriteria.disabilityType ? row.disabilityType === filterCriteria.disabilityType : true;
      const matchesCluster = filterCriteria.clusterGroupNo ? row.clusterGroupNo === filterCriteria.clusterGroupNo : true;

      return matchesSearch && matchesStatus && matchesType && matchesCluster;
    });
  }, [records, searchQuery, filterCriteria]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const currentItems = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddNew = () => {
    setEditingRecord(null);
    setCauseType('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    if (record?.disabilityCause) {
      setCauseType(record.disabilityCause.split(' - ')[0] || '');
    }
    setShowFormModal(true);
  };

  const handleDelete = async (record) => {
    if (window.confirm(`Are you sure you want to delete ${record.firstName} ${record.lastName}?`)) {
      try {
        setIsLoading(true);
        await pwdAdminAPI.deleteRegistrant(record.id);
        setRecords(prev => prev.filter(r => r.id !== record.id));
        alert('Record deleted successfully!');
      } catch (err) {
        console.error('Error deleting record:', err);
        alert('Error: ' + (err.message || 'Failed to delete record'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      let recordId = editingRecord?.id;
      if (!recordId) {
         const year = new Date().getFullYear();
         const count = records.length + 1;
         recordId = `PWD-${year}-${String(count).padStart(3, '0')}`;
      }

      const cType = String(formData.get('cause_type') || '');
      const cSpecific = String(formData.get('cause_specific') || '');
      const finalCause = cType && cSpecific ? `${cType} - ${cSpecific}` : (cType || cSpecific || '');

      const recordData = {
        id: recordId,
        firstName: String(formData.get('firstName') || '').toUpperCase(),
        lastName: String(formData.get('lastName') || '').toUpperCase(),
        middleName: String(formData.get('middleName') || '').toUpperCase(),
        suffix: String(formData.get('suffix') || '').toUpperCase(),
        sex: String(formData.get('sex') || 'Male'),
        birthdate: String(formData.get('birthdate') || ''),
        age: editingRecord?.age || 0,
        contactNo: String(formData.get('contactNo') || ''),
        clusterGroupNo: String(formData.get('clusterGroupNo') || '1'),
        education: String(formData.get('education') || ''),
        occupation: String(formData.get('occupation') || '').toUpperCase(),
        employmentStatus: String(formData.get('employmentStatus') || 'Unemployed'),
        disabilityType: String(formData.get('disabilityType') || ''),
        disabilityCause: finalCause,
        hoa: String(formData.get('hoa') || '').toUpperCase(),
        address: String(formData.get('address') || '').toUpperCase(),
        guardian: String(formData.get('guardian') || '').toUpperCase(),
        guardianContact: String(formData.get('guardianContact') || ''),
        guardianAddress: String(formData.get('guardianAddress') || '').toUpperCase(),
        dateRegistered: String(formData.get('dateRegistered') || new Date().toISOString().split('T')[0]),
        status: String(formData.get('status') || 'Active'),
        remarks: String(formData.get('remarks') || 'None'),
        photo: editingRecord?.photo
      };

      if (editingRecord) {
        // Update existing record
        await pwdAdminAPI.updateRegistrant(editingRecord.id, recordData);
        setRecords(prev => prev.map(row => row.id === editingRecord.id ? { ...row, ...recordData } : row));
      } else {
        // Create new record
        const response = await pwdAdminAPI.createRegistrant(recordData);
        setRecords(prev => [recordData, ...prev]);
      }

      setShowFormModal(false);
      alert(editingRecord ? 'Record updated successfully!' : 'Record created successfully!');
    } catch (err) {
      console.error('Error saving record:', err);
      setError(err.message || 'Failed to save record');
      alert('Error: ' + (err.message || 'Failed to save record'));
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCapturing(true);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
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
        if (stream) stream.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result);
        if (isCapturing) {
          const stream = videoRef.current?.srcObject;
          if (stream) stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndExit = () => {
    if (selectedRecord) {
      setRecords(prev => prev.map(r => 
        r.id === selectedRecord.id ? { ...r, photo: capturedPhoto || undefined } : r
      ));
    }
    setSelectedRecord(null);
    setCapturedPhoto(null);
    setIsCapturing(false);
  };

  const handlePrint = () => window.print();

  const handleBrowsePhoto = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section (Summary cards removed as requested) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-t border-gray-200 pt-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Citizen Records</h2>
          <p className="text-sm text-gray-500">Manage, verify, and print official PWD identification cards.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-[#800000] text-white text-sm font-bold rounded-xl hover:bg-[#600000] shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} /> New Record
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center no-print">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or PWD ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] transition-all text-black"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters ? 'bg-gray-100 border-[#800000] text-[#800000]' : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <Filter size={18} />
            <span className="text-sm font-bold">Filters</span>
          </button>

          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-5 space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disability Type</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-black"
                    value={filterCriteria.disabilityType}
                    onChange={(e) => setFilterCriteria({...filterCriteria, disabilityType: e.target.value})}
                  >
                    <option value="">All Types</option>
                    {disabilityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-black"
                    value={filterCriteria.status}
                    onChange={(e) => setFilterCriteria({...filterCriteria, status: e.target.value})}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cluster Group</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-black"
                    value={filterCriteria.clusterGroupNo}
                    onChange={(e) => setFilterCriteria({...filterCriteria, clusterGroupNo: e.target.value})}
                  >
                    <option value="">All Clusters</option>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Cluster {n}</option>)}
                  </select>
               </div>
               <button 
                onClick={() => setFilterCriteria({ status:'', disabilityType:'', clusterGroupNo:'' })}
                className="w-full py-2 text-[10px] font-black uppercase text-red-700 hover:bg-red-50 rounded-lg transition-colors"
               >
                 Clear Filters
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Citizen ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Disability Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cluster</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length > 0 ? currentItems.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-500">{row.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {row.photo ? <img src={row.photo} className="w-full h-full object-cover" /> : <User size={14} className="text-gray-400" />}
                      </div>
                      <span className="font-bold text-gray-800 text-sm uppercase">{row.firstName} {row.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.disabilityType || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Group {row.clusterGroupNo}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenEdit(row)} className="p-2 text-gray-400 hover:text-[#800000] hover:bg-red-50 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(row)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                      <div className="relative inline-block text-left">
                        <button onClick={() => setOpenMenuRowId(openMenuRowId === row.id ? null : row.id)} className="p-2 text-gray-400 hover:text-[#800000] hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenuRowId === row.id && (
                          <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <button 
                              onClick={() => { setSelectedRecord(row); setOpenMenuRowId(null); }} 
                              className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-red-50 hover:text-[#800000] flex items-center gap-2 border-b border-gray-50"
                            >
                              <CreditCard size={14} /> ID Preview Station
                            </button>
                            <button 
                              onClick={() => { setViewRecord(row); setShowInfoModal(true); setOpenMenuRowId(null); }} 
                              className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 hover:bg-red-50 hover:text-[#800000] flex items-center gap-2"
                            >
                              <Eye size={14} /> Full Information Preview
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-8 border border-white/20">
            <div className="px-8 py-6 bg-[#800000] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  {editingRecord ? <Edit2 size={24} /> : <Plus size={24} />}
                  {editingRecord ? 'Update PWD Profile' : 'New PWD Member Registration'}
                </h3>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form className="p-10 space-y-10 max-h-[75vh] overflow-y-auto" onSubmit={handleSaveRecord}>
              {/* Personal Identification Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-[#800000]"><User size={18} /></div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Personal Identification</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">First Name *</label>
                    <input name="firstName" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.firstName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Middle Name</label>
                    <input name="middleName" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.middleName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Name *</label>
                    <input name="lastName" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.lastName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Suffix</label>
                    <input name="suffix" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.suffix} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sex</label>
                    <select name="sex" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.sex || 'Male'}>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Birthdate *</label>
                    <input name="birthdate" type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.birthdate} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact Number</label>
                    <input name="contactNo" type="tel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.contactNo} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cluster Group</label>
                    <select name="clusterGroupNo" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.clusterGroupNo || '1'}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Cluster {n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Disability Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-800"><HeartPulse size={18} /></div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Disability Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Disability Type *</label>
                      <select name="disabilityType" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.disabilityType} required>
                        <option value="">Select Type</option>
                        {disabilityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registration Status</label>
                      <select name="status" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.status || 'Active'}>
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                    <p className="text-[10px] font-black text-[#800000] uppercase tracking-widest border-b border-red-100 pb-2">Cause of Disability</p>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="cause_type" value="Congenital / Inborn" className="w-4 h-4 text-[#800000]" onChange={(e) => setCauseType(e.target.value)} checked={causeType === 'Congenital / Inborn'} />
                          <span className="font-bold text-xs uppercase text-black">Congenital</span>
                        </label>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="cause_type" value="Acquired" className="w-4 h-4 text-[#800000]" onChange={(e) => setCauseType(e.target.value)} checked={causeType === 'Acquired'} />
                          <span className="font-bold text-xs uppercase text-black">Acquired</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESIDENTIAL & SUPPORT SECTION (Integrated from requested layout) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-700">
                    <MapPin size={18} />
                  </div>
                  <h4 className="font-black text-[#1F2937] uppercase text-sm tracking-widest">Residential & Support</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Side: Address & HOA */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Homeowners Association (HOA)</label>
                      <input 
                        name="hoa" 
                        type="text" 
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10" 
                        defaultValue={editingRecord?.hoa} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Address *</label>
                      <textarea 
                        name="address" 
                        rows={4}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10 resize-none" 
                        defaultValue={editingRecord?.address}
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Right Side: Guardian Box (F9FAFB background) */}
                  <div className="bg-[#F9FAFB] p-8 rounded-[2rem] border border-gray-100 flex flex-col gap-6 h-full">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guardian Name</label>
                      <input 
                        name="guardian" 
                        type="text" 
                        className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10" 
                        defaultValue={editingRecord?.guardian} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guardian Contact</label>
                      <input 
                        name="guardianContact" 
                        type="tel" 
                        className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10" 
                        defaultValue={editingRecord?.guardianContact} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FORM FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-12 pt-10 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  disabled={isLoading}
                  className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-4 bg-[#800000] text-white text-sm font-black rounded-2xl hover:bg-[#600000] shadow-[0_10px_20px_rgba(128,0,0,0.2)] flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={18} /> {isLoading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Register Citizen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID PREVIEW MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto no-print-overlay">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl my-auto flex flex-col no-print-shadow overflow-hidden no-print-container">
            <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 no-print">
              <div className="flex items-center gap-4">
                 <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Official PWD ID Preview</h3>
              </div>
              <button onClick={() => {setSelectedRecord(null); setCapturedPhoto(null);}} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
            </div>

            <div className="p-10 grid grid-cols-1 xl:grid-cols-2 gap-12 items-start justify-items-center print:p-0 print:block">
              <div className="space-y-12 print:space-y-8 print:w-full print:flex print:flex-col print:items-center">
                {/* ID FRONT REPLICA */}
                <div className="id-card-replica id-card-replica-front shadow-2xl border border-gray-400">
                  <div className="replica-header">
                    <img src={NANGKA_LOGO} className="replica-logo-seal" alt="Nangka Logo" />
                    <div className="replica-header-text">
                      <h1 className="main-title">REPUBLIC OF THE PHILIPPINES</h1>
                      <h2 className="city-title">CITY OF MARIKINA</h2>
                      <h3 className="brgy-title">BARANGAY NANGKA</h3>
                      <p className="contact-info">#9 OLD J.P RIZAL ST. NANGKA, MARIKINA CITY</p>
                    </div>
                    <div className="replica-logo-right">
                       <img src={BAGONG_PILIPINAS} className="replica-logo-bagong" />
                    </div>
                  </div>
                  <div className="replica-body">
                    <h2 className="replica-title">BARANGAY NANGKA PWD MEMBER</h2>
                    <div className="replica-top-fields">
                       <p>CLUSTER: <span className="underline-field">{selectedRecord.clusterGroupNo || '______'}</span></p>
                       <p>TAG NO: <span className="underline-field">{selectedRecord.id.split('-').pop()}</span></p>
                    </div>
                    <div className="replica-main-content">
                       <div className="replica-left-col">
                          <div className="replica-photo-box">
                             {capturedPhoto ? <img src={capturedPhoto} /> : <div className="replica-photo-placeholder"><User size={48} className="opacity-10" /></div>}
                          </div>
                          <div className="replica-signature-block">
                             <div className="replica-sig-line"></div>
                             <p>Signature Over Printed Name</p>
                          </div>
                       </div>
                       <div className="replica-right-col">
                          <DataRow label="FULL NAME:" value={`${selectedRecord.firstName} ${selectedRecord.middleName} ${selectedRecord.lastName}`} />
                          <DataRow label="ADDRESS:" value={selectedRecord.address} />
                          <DataRow label="P.W.D ID NUMBER:" value={selectedRecord.id} />
                          <DataRow label="TYPE OF DISABILITY:" value={selectedRecord.disabilityType} />
                       </div>
                    </div>
                  </div>
                  <div className="replica-footer"><p>"Ang ID na ito ay para lamang sa mga benepisyo sa Barangay Nangka"</p></div>
                </div>

                {/* ID BACK REPLICA */}
                <div className="id-card-replica id-card-replica-back shadow-2xl border border-gray-400">
                  <div className="replica-header">
                    <img src={NANGKA_LOGO} className="replica-logo-seal" alt="Nangka Logo" />
                    <div className="replica-header-text">
                       <h1 className="main-title">REPUBLIC OF THE PHILIPPINES</h1>
                       <h2 className="city-title">CITY OF MARIKINA</h2>
                       <h3 className="brgy-title">BARANGAY NANGKA</h3>
                       <p className="contact-info">#9 OLD J.P RIZAL ST. NANGKA, MARIKINA CITY</p>
                       <p className="contact-info">TEL NOS. 934-8625- BRGY TANOD</p>
                       <p className="contact-info">934-8626 - BRGY OFFICE</p>
                       <p className="contact-info">0998-2706-879 - BARANGAY ACTION CENTER</p>
                    </div>
                    <div className="replica-logo-right">
                       <img src={BAGONG_PILIPINAS} className="replica-logo-bagong" />
                    </div>
                  </div>
                  <div className="replica-body-back">
                    <div className="back-watermark">BARANGAY NANGKA</div>
                    <div className="back-content-z">
                      <h4 className="emergency-notify-label">IN CASE OF EMERGENCY, PLS, NOTIFY:</h4>
                      <div className="emergency-fields-group">
                        <FieldRow label="NAME:" value={selectedRecord.guardian} />
                        <FieldRow label="CONTACT NO.:" value={selectedRecord.guardianContact} />
                        <FieldRow label="ADDRESS:" value={selectedRecord.guardianAddress} />
                      </div>
                      <div className="administration-section">
                         <p className="admin-label">UNDER THE ADMINISTRATION OF</p>
                         <div className="admin-signature-line"></div>
                         <p className="admin-name">HON. CELSO R. DELAS ARMAS JR.</p>
                      </div>
                    </div>
                  </div>
                  <div className="replica-footer-back">
                    <p>This PWD Card is issued exclusively to residents of Barangay Nangka, Marikina City. It is valid only within the barangay and may not be used for benefits or services in other areas. Misuse or transfer of this card is strictly prohibited.</p>
                  </div>
                </div>
              </div>

              {/* LIVE PHOTO STUDIO CONTROLS */}
              <div className="w-full max-w-sm space-y-6 no-print">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Live Photo Studio</h4>
                    <div className="aspect-square bg-black rounded-2xl overflow-hidden relative shadow-inner mb-6">
                      {isCapturing ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" /> : capturedPhoto ? <img src={capturedPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><Camera size={48} className="opacity-20" /></div>}
                    </div>
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-3">
                          <button onClick={isCapturing ? capturePhoto : startCamera} className="w-full py-4 bg-[#1E293B] text-white rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2">
                             {isCapturing ? "Capture" : <><Camera size={14} /> Camera</>}
                          </button>
                          <button onClick={handleBrowsePhoto} className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2">
                             <Upload size={14} /> Browse
                          </button>
                       </div>
                       <button onClick={handlePrint} className="w-full px-4 py-4 bg-[#800000] text-white rounded-xl font-bold uppercase flex items-center justify-center gap-2"><Printer size={18} /> Print ID</button>
                       <button onClick={handleSaveAndExit} className="w-full px-4 py-4 bg-green-700 text-white rounded-xl font-bold uppercase flex items-center justify-center gap-2"><Save size={18} /> Save & Exit</button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* FULL INFORMATION PREVIEW MODAL */}
      {showInfoModal && viewRecord && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
            <div className="px-8 py-6 bg-[#800000] text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Citizen Full Profile</h3>
                <p className="text-xs opacity-80 font-bold tracking-widest">PWD DATABASE PREVIEW</p>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="p-2 hover:bg-white/20 rounded-full transition"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-gray-400 mb-4 tracking-widest">Personal Identification</h4>
                  <div className="space-y-4">
                    <InfoItem label="Full Name" value={`${viewRecord.firstName} ${viewRecord.middleName} ${viewRecord.lastName}`} />
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Sex" value={viewRecord.sex || 'Male'} />
                      <InfoItem label="Birthdate" value={viewRecord.birthdate || 'N/A'} />
                    </div>
                    <InfoItem label="Contact Number" value={viewRecord.contactNo || 'N/A'} />
                    <InfoItem label="System ID" value={viewRecord.id} mono />
                  </div>
                </section>
                <section className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-purple-400 mb-4 tracking-widest">Disability Details</h4>
                  <div className="space-y-4">
                    <InfoItem label="Classification" value={viewRecord.disabilityType} />
                    <InfoItem label="Cause" value={viewRecord.disabilityCause || 'N/A'} />
                    <InfoItem label="Cluster Assignment" value={`Cluster ${viewRecord.clusterGroupNo}`} />
                    <InfoItem label="Status" value={viewRecord.status || 'Active'} />
                  </div>
                </section>
                <section className="bg-green-50/50 p-6 rounded-2xl border border-green-100 md:col-span-2">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-green-400 mb-4 tracking-widest">Address & Support</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="HOA" value={viewRecord.hoa || 'N/A'} />
                    <InfoItem label="Full Address" value={viewRecord.address} />
                    <InfoItem label="Guardian Name" value={viewRecord.guardian || 'N/A'} />
                    <InfoItem label="Guardian Contact" value={viewRecord.guardianContact || 'N/A'} />
                  </div>
                </section>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setShowInfoModal(false)} className="px-6 py-2 bg-gray-800 text-white text-xs font-black uppercase rounded-lg">Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM REPLICA STYLES */}
      <style>{`
        .id-card-replica { width: 500px; height: 315px; background: white; display: flex; flex-direction: column; overflow: hidden; font-family: 'Inter', sans-serif; position: relative; }
        .id-card-replica-front, .id-card-replica-back { background-color: #FDE4E4; }
        .replica-header { background: linear-gradient(to right, #4A0000 0%, #800000 50%, #4A0000 100%); color: white; display: flex; align-items: center; justify-content: space-between; padding: 4px 15px; height: 85px; position: relative; }
        .replica-logo-seal { width: 50px; height: 50px; object-fit: contain; }
        .replica-header-text { text-align: center; flex: 1; }
        .main-title { font-size: 11px; font-weight: 800; margin: 0; line-height: 1.1; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .city-title { font-size: 13px; font-weight: 900; margin: 1px 0; line-height: 1.1; }
        .brgy-title { font-size: 13px; font-weight: 900; margin: 0; line-height: 1.1; }
        .contact-info { font-size: 6px; font-weight: 700; margin: 0; opacity: 1; line-height: 1.2; text-transform: uppercase; }
        .replica-logo-right { display: flex; flex-direction: column; align-items: center; }
        .replica-logo-bagong { width: 45px; height: 45px; object-fit: contain; }
        
        .replica-body { padding: 8px 0; flex: 1; display: flex; flex-direction: column; }
        .replica-title { text-align: center; font-size: 18px; font-weight: 900; color: #000; margin-bottom: 2px; }
        .replica-top-fields { display: flex; justify-content: center; gap: 20px; margin-bottom: 4px; }
        .replica-top-fields p { font-size: 11px; font-weight: 800; color: #000; }
        .replica-top-fields .underline-field { border-bottom: 1.5px solid #000; padding: 0 4px; font-weight: 900; color: #000; }
        
        .replica-main-content { display: flex; padding: 0 20px; gap: 15px; flex: 1; }
        .replica-left-col { width: 110px; display: flex; flex-direction: column; align-items: center; }
        .replica-photo-box { width: 105px; height: 105px; background: white; border: 2px solid #000; overflow: hidden; margin-bottom: 6px; }
        .replica-photo-box img { width: 100%; height: 100%; object-fit: cover; }
        
        .replica-signature-block { width: 100%; text-align: center; margin-top: auto; padding-bottom: 15px; }
        .replica-sig-line { height: 1.5px; background: #000; width: 100%; margin-bottom: 2px; }
        .replica-signature-block p { font-size: 7px; font-weight: 900; color: #000; text-transform: uppercase; }
        
        .replica-right-col { flex: 1; display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
        .replica-data-row { display: flex; flex-direction: column; gap: 1px; }
        .replica-data-row label { font-size: 7px; font-weight: 900; color: #000; text-transform: uppercase; }
        .replica-value { font-size: 12px; font-weight: 800; color: #000 !important; text-transform: uppercase; border-bottom: 1.5px dotted rgba(0,0,0,0.5); padding-bottom: 1px; }

        .replica-footer { background-color: #4A0000; color: white; text-align: center; padding: 6px 10px; position: absolute; bottom: 0; width: 100%; }
        .replica-footer p { font-size: 7px; font-weight: 700; margin: 0; text-transform: uppercase; }

        .replica-body-back { flex: 1; position: relative; padding: 25px 30px; display: flex; flex-direction: column; overflow: hidden; }
        .back-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); font-size: 55px; font-weight: 900; color: rgba(0,0,0,0.05); white-space: nowrap; pointer-events: none; width: 100%; text-align: center; }
        .back-content-z { position: relative; z-index: 5; display: flex; flex-direction: column; height: 100%; }
        .emergency-notify-label { font-size: 14px; font-weight: 900; color: #000; margin-bottom: 15px; text-transform: uppercase; }
        .emergency-fields-group { display: flex; flex-direction: column; gap: 12px; }
        .field-row { display: flex; align-items: center; gap: 8px; }
        .field-row label { font-size: 14px; font-weight: 900; color: #000; min-width: 90px; }
        .field-row span { font-size: 14px; font-weight: 900; color: #000 !important; border-bottom: 2px solid #000; flex: 1; min-height: 18px; line-height: 1; text-transform: uppercase; }
        
        .administration-section { margin-top: auto; display: flex; flex-direction: column; align-items: center; padding-bottom: 10px; }
        .admin-label { font-size: 8px; font-weight: 900; color: #000; margin-bottom: 15px; }
        .admin-signature-line { width: 220px; height: 1.5px; background: #000; margin-bottom: 2px; }
        .admin-name { font-size: 14px; font-weight: 900; color: #000; }
        
        .replica-footer-back { background-color: #330000; color: white; text-align: center; padding: 6px 30px; position: absolute; bottom: 0; width: 100%; }
        .replica-footer-back p { font-size: 7px; font-weight: 400; margin: 0; line-height: 1.3; }

        @media print {
          body * { visibility: hidden !important; }
          .no-print, .no-print-overlay, .no-print-container, .no-print-shadow { display: none !important; visibility: hidden !important; }
          .id-card-replica, .id-card-replica * { visibility: visible !important; display: flex !important; }
          .fixed.inset-0.z-\\[130\\] { visibility: visible !important; display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; background: white !important; }
          .no-print-container { visibility: visible !important; display: block !important; background: white !important; box-shadow: none !important; border: none !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; }
          .id-card-replica { margin: 0 auto 50px auto !important; page-break-inside: avoid !important; -webkit-print-color-adjust: exact !important; border: 1px solid #ccc !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

// Helper Components
const DataRow = ({ label, value }) => (
  <div className="replica-data-row">
    <label>{label}</label>
    <span className="replica-value">{value}</span>
  </div>
);

const FieldRow = ({ label, value }) => (
  <div className="field-row">
    <label>{label}</label>
    <span>{value || ''}</span>
  </div>
);

const InfoItem = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className={`mt-1 text-sm font-bold ${mono ? 'font-mono text-[#800000]' : 'text-gray-800'}`}>{value}</p>
  </div>
);

export default ManageView;