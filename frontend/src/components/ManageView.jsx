
import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Save,
  User,
  HeartPulse,
  Calendar,
  Contact,
  Briefcase,
  MoreHorizontal,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
  Clock,
  MapPin,
  GraduationCap,
  Phone
} from 'lucide-react';
import { pwdAdminAPI, analyticsAPI } from '../api';

// Define constants for missing images
const MARIKINA_SEAL = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png";
const BAGONG_PILIPINAS = "https://upload.wikimedia.org/wikipedia/commons/f/f6/Bagong_Pilipinas_logo.png";

const ManageView = ({ records, setRecords }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Local state fallback when parent doesn't provide records
  const [localRecords, setLocalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const recordsState = records || localRecords;
  const setRecordsFn = setRecords || setLocalRecords;
  
  // Dynamic Stats Summary
  const statsSummary = useMemo(() => {
    const total = recordsState.length;
    const active = recordsState.filter(r => r.status === 'Active').length;
    const pending = recordsState.filter(r => r.status === 'Pending').length;
    return { total, active, pending };
  }, [recordsState]);

  // Cluster groups data for quick view
  const [clusterGroups, setClusterGroups] = useState([]);
  useEffect(() => {
    let mounted = true;
    const fetchClusters = async () => {
      try {
        const res = await analyticsAPI.getOverview();
        if (res && res.success && res.data) {
          if (mounted) setClusterGroups(res.data.clusterGroups || []);
        }
      } catch (err) {
        console.warn('Failed to fetch cluster groups', err?.message || err);
      }
    };

    fetchClusters();
    return () => { mounted = false; };
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modals State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false); 
  
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [viewRecord, setViewRecord] = useState(null); 
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [openMenuRowId, setOpenMenuRowId] = useState(null);
  
  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    sex: '',
    disabilityType: '',
    clusterGroupNo: ''
  });

  const [causeType, setCauseType] = useState('');
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

  const filteredRows = useMemo(() => {
    return recordsState.filter(row => {
      const matchesSearch = 
        String(row.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${String(row.firstName || '')} ${String(row.lastName || '')}`.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterCriteria.status ? row.status === filterCriteria.status : true;
      const matchesSex = filterCriteria.sex ? row.sex === filterCriteria.sex : true;
      const matchesType = filterCriteria.disabilityType ? row.disabilityType === filterCriteria.disabilityType : true;
      const matchesCluster = filterCriteria.clusterGroupNo ? row.clusterGroupNo === filterCriteria.clusterGroupNo : true;

      return matchesSearch && matchesStatus && matchesSex && matchesType && matchesCluster;
    });
  }, [recordsState, searchQuery, filterCriteria]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterCriteria]);

  // Fetch records from backend when component mounts
  useEffect(() => {
    let mounted = true;
    const fetchRegistrants = async () => {
      setLoadingRecords(true);
      try {
        const res = await pwdAdminAPI.getRegistrants(1, 1000);
        if (res && res.success && Array.isArray(res.data)) {
          const mapped = res.data.map(item => ({
            id: item.registry_number || `PWD-${item.pwd_id}`,
            pwdId: item.pwd_id,
            firstName: (item.firstname || item.first_name || '').toUpperCase(),
            lastName: (item.lastname || item.last_name || '').toUpperCase(),
            middleName: (item.middlename || item.middle_name || '').toUpperCase(),
            sex: item.sex || item.gender || 'Male',
            birthdate: item.birthdate || item.date_of_birth || '',
            contactNo: item.contact_no || item.contact_number || '',
            clusterGroupNo: item.cluster_group_no || 1,
            hoa: item.barangay || '',
            address: item.address || '',
            guardian: item.guardian_name || item.emergency_contact || '',
            guardianContact: item.guardian_contact || item.emergency_number || '',
            dateRegistered: item.registration_date || item.created_at || '',
            status: item.is_active ? 'Active' : 'Inactive',
            remarks: item.remarks || ''
          }));
          if (mounted) {
            setLocalRecords(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch registrants', err);
        setFetchError(err?.message || 'Failed to fetch registrants');
      } finally {
        if (mounted) setLoadingRecords(false);
      }
    };

    fetchRegistrants();
    return () => { mounted = false; };
  }, []);

  const handleAddNew = () => {
    setEditingRecord(null);
    setCauseType('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    if (record?.disabilityCause) {
      const parts = record.disabilityCause.split(' - ');
      setCauseType(parts[0] || '');
    } else {
      setCauseType('');
    }
    setShowFormModal(true);
  };

  // Implement missing print functionality
  const handlePrint = () => {
    window.print();
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
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
      contactNo: String(formData.get('contactNo') || ''),
      clusterGroupNo: String(formData.get('clusterGroupNo') || '1'),
      education: String(formData.get('education') || ''),
      occupation: String(formData.get('occupation') || '').toUpperCase(),
      employmentStatus: String(formData.get('employmentStatus') || 'Unemployed'),
      disabilityType: String(formData.get('disabilityType') || ''),
      disabilityCause: finalCause,
      hoa: String(formData.get('hoa') || ''),
      address: String(formData.get('address') || ''),
      guardian: String(formData.get('guardian') || ''),
      guardianContact: String(formData.get('guardianContact') || ''),
      guardianAddress: String(formData.get('guardianAddress') || ''),
      dateRegistered: String(formData.get('dateRegistered') || new Date().toISOString().split('T')[0]),
      status: String(formData.get('status') || 'Active'),
      remarks: String(formData.get('remarks') || 'None')
    };

    // Build backend payloads
    const userId = parseInt(localStorage.getItem('userId')) || undefined;

    const createPayload = {
      userId,
      registryNumber: undefined,
      firstName: recordData.firstName,
      middleName: recordData.middleName,
      lastName: recordData.lastName,
      dateOfBirth: recordData.birthdate,
      gender: recordData.sex,
      civilStatus: 'Single',
      address: recordData.address,
      barangay: recordData.hoa || 'Nangka',
      contactNumber: recordData.contactNo,
      emergencyContact: recordData.guardian,
      emergencyNumber: recordData.guardianContact || '',
      clusterGroupNo: parseInt(recordData.clusterGroupNo) || 1,
    };

    const updatePayload = {
      first_name: recordData.firstName,
      middle_name: recordData.middleName,
      last_name: recordData.lastName,
      date_of_birth: recordData.birthdate,
      gender: recordData.sex,
      contact_number: recordData.contactNo,
      address: recordData.address,
      barangay: recordData.hoa || 'Nangka',
      civil_status: 'Single',
      cluster_group_no: parseInt(recordData.clusterGroupNo) || 1,
    };

    try {
      if (editingRecord && editingRecord.pwdId) {
        await pwdAdminAPI.updateRegistrant(editingRecord.pwdId, updatePayload);
        setRecords(prev => prev.map(row => row.id === editingRecord.id ? { ...row, ...recordData } : row));
      } else {
        const res = await pwdAdminAPI.createRegistrant(createPayload);
        if (res && res.success && res.data) {
          const newItem = res.data;
          const mapped = {
            id: newItem.registry_number || `PWD-${newItem.pwd_id}`,
            pwdId: newItem.pwd_id,
            firstName: (newItem.first_name || '').toUpperCase(),
            lastName: (newItem.last_name || '').toUpperCase(),
            middleName: (newItem.middle_name || '').toUpperCase(),
            sex: newItem.gender || recordData.sex,
            birthdate: newItem.date_of_birth || recordData.birthdate,
            contactNo: newItem.contact_number || recordData.contactNo,
            clusterGroupNo: newItem.cluster_group_no || recordData.clusterGroupNo,
            disabilityType: recordData.disabilityType,
            hoa: newItem.barangay || recordData.hoa,
            address: newItem.address || recordData.address,
            guardian: newItem.emergency_contact || recordData.guardian,
            guardianContact: newItem.emergency_number || recordData.guardianContact,
            dateRegistered: newItem.registration_date || newItem.created_at || recordData.dateRegistered,
            status: newItem.is_active ? 'Active' : 'Inactive',
            remarks: recordData.remarks
          };
          setRecords(prev => [mapped, ...prev]);
        } else {
          throw new Error('Create failed');
        }
      }

      setShowFormModal(false);
      setEditingRecord(null);
    } catch (err) {
      console.error('Save failed', err);
      const message = err?.response?.data?.message || err.message || 'Save failed';
      alert(message);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Stat Bar - Connects to real-time data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 no-print">
        <div className="bg-white px-6 py-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-[#800000]">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Population</p>
              <p className="text-2xl font-black text-[#800000]">{statsSummary.total}</p>
           </div>
           <Users size={24} className="text-gray-200" />
        </div>
        <div className="bg-white px-6 py-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-green-600">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Citizens</p>
              <p className="text-2xl font-black text-green-600">{statsSummary.active}</p>
           </div>
           <Activity size={24} className="text-gray-200" />
        </div>
        <div className="bg-white px-6 py-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-orange-500">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Approval</p>
              <p className="text-2xl font-black text-orange-500">{statsSummary.pending}</p>
           </div>
           <Clock size={24} className="text-gray-200" />
        </div>
      </div>

      {/* Cluster quick view */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Population by Cluster Group</h4>
        <div className="space-y-3">
          {clusterGroups && clusterGroups.length > 0 ? (
            (() => {
              const maxVal = Math.max(...clusterGroups.map(c => c.count), 1);
              return clusterGroups.map(c => (
                <div key={c.cluster} className="flex items-center gap-4">
                  <div className="w-28 text-sm font-bold">Cluster {c.cluster}</div>
                  <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="h-3 bg-[#800000]" style={{ width: `${(c.count / maxVal) * 100}%` }}></div>
                  </div>
                  <div className="w-36 text-xs text-gray-500 text-right">{c.count} Residents ({((c.count / Math.max(1, statsSummary.total)) * 100).toFixed(0)}%)</div>
                </div>
              ));
            })()
          ) : (
            <div className="text-gray-400 italic">No cluster data yet</div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-t border-gray-200 pt-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Citizen Records</h2>
          <p className="text-sm text-gray-500">Add, manage, and verify PWD member profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-[#800000] text-white text-sm font-bold rounded-xl hover:bg-[#600000] shadow-lg shadow-red-900/20 transition-all active:scale-95"
          >
            <Plus size={18} /> New Record
          </button>
        </div>
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
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Citizen ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cluster</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sex</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length > 0 ? currentItems.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-500">{row.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm uppercase">{row.firstName} {row.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Group {row.clusterGroupNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.sex}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {row.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(row)} className="p-2 text-gray-400 hover:text-[#800000] hover:bg-red-50 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { setSelectedRecord(row); }} className="p-2 text-gray-400 hover:text-[#800000] hover:bg-red-50 rounded-lg">
                        <CreditCard size={16} />
                      </button>
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
        
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="text-xs text-gray-500 font-medium italic">
            Displaying {currentItems.length} records.
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevPage} disabled={currentPage === 1} className="p-2 border rounded-lg hover:bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="text-xs font-bold px-3">Page {currentPage} of {totalPages || 1}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="p-2 border rounded-lg hover:bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE REGISTRATION FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 border border-white/20">
            <div className="px-8 py-6 bg-[#800000] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  {editingRecord ? <Edit2 size={24} /> : <Plus size={24} />}
                  {editingRecord ? 'Update PWD Profile' : 'New PWD Member Registration'}
                </h3>
                <p className="text-xs opacity-70 mt-1 uppercase font-bold tracking-widest">Barangay Nangka Official Database</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-10 space-y-12 max-h-[80vh] overflow-y-auto" onSubmit={handleSaveRecord}>
              
              {/* SECTION 1: Personal Data */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-[#800000]">
                    <User size={18} />
                  </div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Personal Identification</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name *</label>
                    <input name="firstName" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#800000]/10 text-black font-bold" defaultValue={editingRecord?.firstName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Middle Name</label>
                    <input name="middleName" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#800000]/10 text-black font-bold" defaultValue={editingRecord?.middleName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name *</label>
                    <input name="lastName" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#800000]/10 text-black font-bold" defaultValue={editingRecord?.lastName} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suffix</label>
                    <input name="suffix" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#800000]/10 text-black font-bold" defaultValue={editingRecord?.suffix} placeholder="Jr, III, etc" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sex</label>
                    <select name="sex" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" defaultValue={editingRecord?.sex || 'Male'}>
                       <option>Male</option>
                       <option>Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Birthdate *</label>
                    <input name="birthdate" type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" defaultValue={editingRecord?.birthdate} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</label>
                    <div className="relative">
                       <Phone className="absolute left-3 top-3 text-gray-300" size={16} />
                       <input name="contactNo" type="tel" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" defaultValue={editingRecord?.contactNo} placeholder="09XX XXX XXXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cluster Group</label>
                    <select name="clusterGroupNo" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" defaultValue={editingRecord?.clusterGroupNo || '1'}>
                       {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Cluster {n}</option>)}
                    </select>
                  </div>
                </div>
              </div>



              {/* SECTION 3: Disability Clinical Data */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-800">
                    <HeartPulse size={18} />
                  </div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Disability Details</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disability Type *</label>
                      <select name="disabilityType" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" defaultValue={editingRecord?.disabilityType} required>
                          <option value="">Select Type</option>
                          {disabilityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Status</label>
                      <select name="status" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" defaultValue={editingRecord?.status || 'Active'}>
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
                              <span className="font-bold text-xs uppercase tracking-tighter">Congenital</span>
                          </label>
                          <div className="pl-7 space-y-2 border-l border-gray-200 ml-2">
                              {['Autism', 'ADHD', 'Cerebral Palsy', 'Down Syndrome'].map(c => (
                                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="cause_specific" value={c} disabled={causeType !== 'Congenital / Inborn'} defaultChecked={editingRecord?.disabilityCause?.includes(c)} />
                                      <span className="text-[10px] text-gray-500 font-bold uppercase">{c}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                              <input type="radio" name="cause_type" value="Acquired" className="w-4 h-4 text-[#800000]" onChange={(e) => setCauseType(e.target.value)} checked={causeType === 'Acquired'} />
                              <span className="font-bold text-xs uppercase tracking-tighter">Acquired</span>
                          </label>
                           <div className="pl-7 space-y-2 border-l border-gray-200 ml-2">
                              {['Chronic Illness', 'Injury', 'Polio'].map(c => (
                                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="cause_specific" value={c} disabled={causeType !== 'Acquired'} defaultChecked={editingRecord?.disabilityCause?.includes(c)} />
                                      <span className="text-[10px] text-gray-500 font-bold uppercase">{c}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Address & Guardian */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-800">
                    <MapPin size={18} />
                  </div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Residential & Support</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Homeowners Association (HOA)</label>
                      <input name="hoa" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold uppercase" defaultValue={editingRecord?.hoa} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address *</label>
                      <textarea name="address" rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold uppercase resize-none" defaultValue={editingRecord?.address} required></textarea>
                    </div>
                  </div>
                  <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guardian Name</label>
                        <input name="guardian" type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold uppercase" defaultValue={editingRecord?.guardian} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guardian Contact</label>
                        <input name="guardianContact" type="tel" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold" defaultValue={editingRecord?.guardianContact} />
                     </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4 justify-end border-t border-gray-100">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-8 py-3 text-sm font-black text-gray-400 hover:text-gray-800 uppercase tracking-widest transition-colors">Discard</button>
                <button type="submit" className="px-12 py-3 bg-[#800000] text-white text-sm font-black rounded-xl hover:bg-[#600000] shadow-xl shadow-red-900/20 flex items-center gap-3 transition-all active:scale-95">
                  <Save size={18} /> {editingRecord ? 'Update Record' : 'Register Citizen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER ID MODAL (The official design implemented previously) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto no-print-bg">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-auto animate-in zoom-in-95 duration-200 flex flex-col no-print-shadow overflow-hidden">
                <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 no-print">
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">ID Preview Station</h3>
                    <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                </div>
                <div className="p-10 flex flex-col items-center">
                    {/* Reuse ID card structure from previous high-fidelity request */}
                    <div className="official-id-card official-id-card-front shadow-2xl border border-gray-400 mb-10">
                        <div className="official-id-header">
                            <img src={MARIKINA_SEAL} className="logo-small" />
                            <div className="header-text-center">
                                <h1>REPUBLIC OF THE PHILIPPINES</h1>
                                <h2>CITY OF MARIKINA</h2>
                                <h3>BARANGAY NANGKA</h3>
                                <p>#9 OLD J.P RIZAL ST. NANGKA, MARIKINA CITY</p>
                            </div>
                            <img src={BAGONG_PILIPINAS} className="logo-small" />
                        </div>
                        <div className="front-main-body">
                            <h1 className="main-card-title text-center">BARANGAY NANGKA PWD MEMBER</h1>
                            <div className="card-content-grid flex p-4 gap-6">
                                <div className="photo-box w-32 h-32 border-2 border-black flex items-center justify-center bg-gray-50">
                                    <User className="opacity-10" size={48} />
                                </div>
                                <div className="data-section flex-1 space-y-2 text-sm">
                                    <p className="font-black">FULL NAME: <span className="font-bold border-b border-gray-200 block">{selectedRecord.firstName} {selectedRecord.lastName}</span></p>
                                    <p className="font-black">ADDRESS: <span className="font-bold border-b border-gray-200 block">{selectedRecord.address}</span></p>
                                    <p className="font-black">PWD ID: <span className="font-mono text-red-800 block">{selectedRecord.id}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={handlePrint} className="px-10 py-4 bg-[#800000] text-white rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all">Print Official ID</button>
                </div>
            </div>
        </div>
      )}

      {/* STYLES FOR ID CARD REPLICATED FROM PREVIOUS REQUEST */}
      <style>{`
        .official-id-card { width: 500px; height: 315px; background: white; border-radius: 4px; overflow: hidden; position: relative; }
        .official-id-card-front { background-color: #FDE4E4; }
        .official-id-header { background-color: #5D0000; color: white; display: flex; align-items: center; justify-content: space-between; padding: 10px; height: 85px; }
        .logo-small { width: 60px; height: 60px; background: white; border-radius: 50%; padding: 2px; }
        .header-text-center h1 { font-size: 10px; }
        .header-text-center h2 { font-size: 14px; }
        .header-text-center h3 { font-size: 16px; font-weight: 900; }
        .header-text-center p { font-size: 6px; }
        .main-card-title { font-size: 20px; font-weight: 900; padding: 5px 0; }
      `}</style>
    </div>
  );
};

export default ManageView;
