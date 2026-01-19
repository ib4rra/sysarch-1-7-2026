import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, X, Eye, Printer, Camera, Save,User,HeartPulse,MoreHorizontal,CreditCard,ChevronLeft,ChevronRight,MapPin,Upload,FileText,Phone, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { pwdAdminAPI } from '../../api';


// Constants for official logos
const BAGONG_PILIPINAS = "https://upload.wikimedia.org/wikipedia/commons/f/f6/Bagong_Pilipinas_logo.png";
const MARIKINA_SEAL = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png";

// --- CONFIRMATION MODAL COMPONENT ---
const ConfirmationModal = ({ isOpen, title, message, type = 'info', onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  const styles = {
    danger: {
      bg: 'bg-red-50', icon: <Trash2 size={32} className="text-red-600" />, btn: 'bg-red-600 hover:bg-red-700 text-white'
    },
    info: {
      bg: 'bg-blue-50', icon: <CheckCircle size={32} className="text-blue-600" />, btn: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    warning: {
      bg: 'bg-amber-50', icon: <AlertTriangle size={32} className="text-amber-600" />, btn: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    success: {
      bg: 'bg-green-50', icon: <CheckCircle size={32} className="text-green-600" />, btn: 'bg-green-600 hover:bg-green-700 text-white'
    },
    error: {
      bg: 'bg-red-50', icon: <AlertTriangle size={32} className="text-red-600" />, btn: 'bg-red-600 hover:bg-red-700 text-white'
    }
  };

  const currentStyle = styles[type] || styles.info;
  const isSingleButton = type === 'success' || type === 'error';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 transition-all">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentStyle.bg} mb-2`}>
            {currentStyle.icon}
          </div>
          <h3 className="text-xl font-black text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {message}
          </p>
          <div className={`flex ${isSingleButton ? 'w-full' : 'gap-3 w-full'} pt-4`}>
            {!isSingleButton && (
              <button 
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={isSingleButton ? onCancel : onConfirm}
              disabled={isLoading}
              className={`${isSingleButton ? 'w-full' : 'flex-1'} py-3 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm flex items-center justify-center gap-2 ${currentStyle.btn} disabled:opacity-50`}
            >
              {isSingleButton ? 'Close' : (isLoading ? 'Processing...' : 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageView = () => {
    // Export CSV handler
    const handleExportCSV = () => {
      if (!localRecords || localRecords.length === 0) return;
      const replacer = (key, value) => value === null || value === undefined ? '' : value;
      const header = Object.keys(localRecords[0]);
      const csv = [
        header.join(','),
        ...localRecords.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
      ].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pwd_users.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };
  const [localRecords, setLocalRecords] = useState([]); // Local state for records
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
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
  const [causeSpecific, setCauseSpecific] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Create confirmation state
  const [createConfirmOpen, setCreateConfirmOpen] = useState(false);
  const [pendingCreatePayload, setPendingCreatePayload] = useState(null);
  const [creatingLoading, setCreatingLoading] = useState(false);

  // Success modal state
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showSuccessModal = (title, message, type = 'success') => {
    setSuccessModal({ isOpen: true, title, message, type });
    if (type === 'success') {
      setTimeout(() => setSuccessModal(prev => ({ ...prev, isOpen: false })), 3000);
    }
  };

  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    disabilityType: '',
    clusterGroupNo: ''
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const disabilityTypes = [
    { id: 1, name: "Visual Impairment" },
    { id: 2, name: "Hearing Impairment" },
    { id: 3, name: "Physical Disability" },
    { id: 4, name: "Intellectual Disability" },
    { id: 5, name: "Psychosocial Disability" },
    { id: 6, name: "Speech Disability" },
    { id: 7, name: "Multiple Disabilities" }
  ];

 // --- HELPER FUNCTIONS FOR DATA NORMALIZATION ---

  // 1. Get Disability Name from ID (for Table Display)
  const getDisabilityName = (disabilityId) => {
    if (!disabilityId) return 'N/A';
    const idNum = parseInt(disabilityId);
    const disability = disabilityTypes.find(d => d.id === idNum);
    return disability ? disability.name : 'N/A';
  };

  // 2. Get Disability ID from Name (for Saving to DB)
  const getDisabilityId = (disabilityName) => {
    const disability = disabilityTypes.find(d => d.name === disabilityName);
    return disability ? disability.id : null;
  };

  // 3. FIX FOR EDIT FORM: Convert ID to Name so the Dropdown selects it correctly
  const getDisabilityValueForForm = (record) => {
    if (!record) return '';
    // Check both snake_case and camelCase
    const val = record.disabilityType || record.disability_type; 
    
    // If it is a number (ID), find the name
    if (!isNaN(val)) {
      const found = disabilityTypes.find(t => t.id === parseInt(val));
      return found ? found.name : '';
    }
    // If it is already a string (Name), return it
    return val || '';
  };

  // 4. FIX FOR BIRTHDATE: Convert ISO timestamp to YYYY-MM-DD (without timezone conversion)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // If it's already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    // Parse ISO date string directly without timezone conversion
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    // Get year, month, day in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 5. Calculate Age dynamically
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const dob = new Date(birthdate);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  // Normalize record fields to a consistent shape for the UI
  const normalizeRecord = (r) => {
    if (!r) return r;
    return {
      // identity preserved
      ...r,
      // names
      firstName: r.firstName || r.firstname || r.FIRSTNAME || '',
      middleName: r.middleName || r.middlename || r.MIDDLENAME || '',
      lastName: r.lastName || r.lastname || r.LASTNAME || '',
      // contact - handle both camelCase and snake_case from backend
      contactNo: r.contactNo || r.contact_no || r.contact || r.contactNumber || 'N/A',
      // id
      pwd_id: r.pwd_id || r.pwdId || r.id || r.PWD_ID || null,
      formattedPwdId: r.formattedPwdId || r.pwd_id || r.id || r.pwdId || null,
      // disability
      disabilityType: r.disabilityType || r.disability_type || r.disability || null,
      disabilityCause: r.disabilityCause || r.disability_cause || r.disability_cause_detail || null,
      // guardian - handle both camelCase and snake_case from backend
      guardian: r.guardian || r.guardian_name || r.guardianName || r.emergencyContact || null,
      guardianContact: r.guardianContact || r.guardian_contact || r.guardian_contact_no || r.emergencyNumber || null,
      // cluster and status
      clusterGroupNo: r.clusterGroupNo || r.cluster_group_no || r.cluster || null,
      status: r.status || r.registration_status || r.registrationStatus || null,
      // address and hoa
      address: r.address || r.full_address || r.ADDRESS || '',
      hoa: r.hoa || r.hoa_name || r.homeowners || null,
      barangay: r.barangay || r.barangay_name || null,
      // birthdate - handle dateOfBirth from backend
      birthdate: r.birthdate || r.birth_date || r.dateOfBirth || null,
      // sex/gender
      sex: r.sex || r.gender || 'Male',
    };
  };

  // Load records on component mount - only once
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setIsLoading(true);
        const response = await pwdAdminAPI.getRegistrants();
        
        // The API returns response.data which contains the actual records array
        const records = Array.isArray(response) ? response : (response.data || response.registrants || []);
        
        if (Array.isArray(records) && records.length > 0) {
          setLocalRecords(records);
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

  // Helper function to refresh records from the server
  const refreshRecords = async () => {
    try {
      const response = await pwdAdminAPI.getRegistrants();
      const records = Array.isArray(response) ? response : (response.data || response.registrants || []);
      
      if (Array.isArray(records) && records.length > 0) {
        setLocalRecords(records);
      }
    } catch (err) {
      console.error('Error refreshing records:', err);
    }
  };

  useEffect(() => {
    if (selectedRecord) {
      setCapturedPhoto(selectedRecord.photo || null);
    }
  }, [selectedRecord]);

  // Auto-generate QR asset on the server when opening preview if missing
  useEffect(() => {
    let mounted = true;
    const autoGen = async () => {
      if (!selectedRecord) return;
      if (selectedRecord.qr_image_path) return; // already has stored image
      const id = selectedRecord.formattedPwdId || selectedRecord.pwd_id || selectedRecord.id;
      if (!id) return;
      setIsLoading(true);
      try {
        await pwdAdminAPI.generateRegistrantQr(id);
        // refresh details
        const resp = await pwdAdminAPI.getRegistrantDetails(id);
        const payload = resp?.data || resp;
        if (mounted && payload) {
          setSelectedRecord(prev => prev ? ({ ...prev, ...payload }) : payload);
          setLocalRecords(prev => prev.map(r => ((r.pwd_id || r.id || '') === (payload.pwd_id || payload.id || id) || (r.formattedPwdId || '') === (payload.formattedPwdId || id)) ? { ...r, ...payload } : r));
        }
      } catch (err) {
        console.warn('Auto QR generation failed:', err?.message || err);
      } finally {
        setIsLoading(false);
      }
    };
    autoGen();
    return () => { mounted = false; };
  }, [selectedRecord]);

  const filteredRows = useMemo(() => {
    return (localRecords || []).filter(row => {
      // Handle both database field names (firstname, lastname) and frontend format (firstName, lastName)
      const firstName = row.firstName || row.firstname || '';
      const lastName = row.lastName || row.lastname || '';
      const name = `${firstName} ${lastName}`.toLowerCase();

      const pwdID = (row.pwd_id || row.id || '').toString().toLowerCase();
      
      const id = (row.id || row.pwd_id || '').toString().toLowerCase();
      const search = searchQuery.toLowerCase();
      
      const matchesSearch = name.includes(search) || id.includes(search);
      const matchesStatus = filterCriteria.status ? String(row.registration_status || row.status || '').toLowerCase() === String(filterCriteria.status).toLowerCase() : true;
      const matchesType = filterCriteria.disabilityType ? String(getDisabilityName(row.disabilityType || row.disability_type) || '').toLowerCase() === String(filterCriteria.disabilityType).toLowerCase() : true;
      
      // Debug cluster filtering
      let matchesCluster = true;
      if (filterCriteria.clusterGroupNo) {
        const rowCluster = String(row.cluster_group_no || row.clusterGroupNo || '').trim();
        const filterCluster = String(filterCriteria.clusterGroupNo).trim();
        matchesCluster = rowCluster === filterCluster;
        if (row.firstname === 'IVELL') { // Debug log for one record
          console.log(`Cluster filter debug: row=${rowCluster} vs filter=${filterCluster}, match=${matchesCluster}`);
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesCluster;
    });
  }, [localRecords, searchQuery, filterCriteria]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const currentItems = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddNew = () => {
    setEditingRecord(null);
    setCauseType('');
    setCauseSpecific('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (record) => {
    // Normalize record for editing modal
    setEditingRecord({
      ...record,
      birthdate: record.birthdate || record.birth_date || '',
      disabilityType: getDisabilityValueForForm(record),
      suffix: record.suffix || '',
    });
    // Check both snake_case and camelCase for cause
    const cause = record.disabilityCause || record.disability_cause;
    if (cause) {
      const parts = cause.split(' - ');
      if(parts.length > 1) {
          setCauseType(parts[0] || '');
          setCauseSpecific(parts[1] || '');
      } else {
          setCauseType(cause);
          setCauseSpecific('');
      }
    } else {
      setCauseType('');
      setCauseSpecific('');
    }
    setShowFormModal(true);
  };

  const handleDelete = async (record) => {
    // Open confirmation modal
    setDeletingRecord(record);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRecord) return;
    setDeletingLoading(true);
    try {
      const pwdId = deletingRecord.pwd_id || deletingRecord.id;
      await pwdAdminAPI.deleteRegistrant(pwdId);
      setLocalRecords(prev => prev.filter(r => (r.pwd_id || r.id) !== pwdId));
      setDeleteConfirmOpen(false);
      setDeletingRecord(null);
      // Deleted successfully; UI updated without an alert.
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Error: ' + (err.response?.data?.message || err.message || 'Failed to delete record'));
    } finally {
      setDeletingLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingRecord(null);
  };

  // Confirm and perform create after user confirmation
  const confirmCreate = async () => {
    if (!pendingCreatePayload) return;
    setCreatingLoading(true);
    try {
      await pwdAdminAPI.createRegistrant(pendingCreatePayload);
      await refreshRecords();
      setCreateConfirmOpen(false);
      setPendingCreatePayload(null);
      setShowFormModal(false);
      showSuccessModal('Citizen Registered', 'New PWD member has been successfully registered!', 'success');
    } catch (err) {
      console.error('Error creating record:', err);
      showSuccessModal('Registration Failed', err.response?.data?.message || err.message || 'Failed to create record', 'error');
    } finally {
      setCreatingLoading(false);
      setIsLoading(false);
    }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    // Use browser validation (reportValidity) to enforce required fields
    if (typeof formEl.reportValidity === 'function' && !formEl.reportValidity()) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Get userId from localStorage (admin who created the record)
      const adminId = localStorage.getItem('userId');

      const cType = String(causeType || '');
      const cSpecific = String(causeSpecific || '');
      const finalCause = cType && cSpecific ? `${cType} - ${cSpecific}` : (cType || cSpecific || '');

      // Map frontend fields to backend expectations
      const recordData = {
        userId: adminId || null,
        registryNumber: editingRecord?.id || null,
        firstName: String(formData.get('firstName') || '').toUpperCase(),
        lastName: String(formData.get('lastName') || '').toUpperCase(),
        middleName: String(formData.get('middleName') || '').toUpperCase(),
        suffix: String(formData.get('suffix') || '').toUpperCase(),
        gender: String(formData.get('sex') || 'Male'),  // Backend expects 'gender', not 'sex'
        dateOfBirth: String(formData.get('birthdate') || ''),  // Backend expects 'dateOfBirth'
        civilStatus: 'Single',  // Default value - can be extended if needed
        hoa: String(formData.get('hoa') || ''),
        address: String(formData.get('address') || '').toUpperCase(),
        contactNumber: String(formData.get('contactNo') || ''),  // Backend expects 'contactNumber'
        emergencyContact: String(formData.get('guardian') || '').toUpperCase(),  // Maps to 'emergencyContact'
        emergencyNumber: String(formData.get('guardianContact') || ''),  // Maps to 'emergencyNumber'
        disabilityType: getDisabilityId(String(formData.get('disabilityType') || '')),  // Convert name to ID
        disabilityCause: finalCause,
        registrationStatus: String(formData.get('status') || 'Active'),
        clusterGroupNo: String(formData.get('clusterGroupNo') || '1'),
      };

      if (editingRecord) {
        // Update existing record
        const recordId = editingRecord.pwd_id || editingRecord.id;
        try {
          const response = await pwdAdminAPI.updateRegistrant(recordId, recordData);
          
          // Refetch the updated record to verify it persisted in the database
          const updatedResponse = await pwdAdminAPI.getRegistrantById(recordId);
          const persistedRecord = updatedResponse?.data || updatedResponse;
          
          // Update local state with the database response to ensure it matches
          if (persistedRecord) {
            setLocalRecords(prev => prev.map(row => (row.pwd_id || row.id) === recordId ? persistedRecord : row));
            setShowFormModal(false);
            showSuccessModal('Record Updated', 'PWD profile has been successfully updated!', 'success');
          } else {
            throw new Error('Failed to verify update');
          }
        } catch (err) {
          console.error('Error updating record:', err);
          setError(err.message || 'Failed to update record');
          showSuccessModal('Update Failed', err.message || 'Failed to update record', 'error');
        } finally {
          setIsLoading(false);
        }
        return;
      } else {
        // Queue create payload and show confirmation modal instead of immediate create
        setPendingCreatePayload(recordData);
        setCreateConfirmOpen(true);
        setIsLoading(false);
        return;
      }

      setShowFormModal(false);
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
      const updatedRecord = { ...selectedRecord, photo: capturedPhoto || undefined };
      setLocalRecords(prev => prev.map(r => 
        r.id === selectedRecord.id ? updatedRecord : r
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

  // Generate QR on server and refresh selected record data
  const handleGenerateQr = async () => {
    if (!selectedRecord) return;
    setIsLoading(true);
    try {
      const id = selectedRecord.formattedPwdId || selectedRecord.pwd_id || selectedRecord.id;
      if (!id) return;
      await pwdAdminAPI.generateRegistrantQr(id);
      // Refresh detailed record from server
      try {
        const resp = await pwdAdminAPI.getRegistrantDetails(id);
        const payload = resp?.data || resp;
        if (payload) {
          // Update selected record and localRecords
          setSelectedRecord(prev => ({ ...prev, ...payload }));
          setLocalRecords(prev => prev.map(r => ((r.pwd_id || r.id || '') === (payload.pwd_id || payload.id || id) || (r.formattedPwdId || '') === (payload.formattedPwdId || id)) ? { ...r, ...payload } : r));
        }
      } catch (err) {
        // ignore details fetch error; QR was generated
        console.warn('Failed to refresh registrant details:', err.message || err);
      }
    } catch (err) {
      console.error('Error generating QR:', err);
      alert('Failed to generate QR image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {successModal.isOpen && (
        <ConfirmationModal
          isOpen={successModal.isOpen}
          title={successModal.title}
          message={successModal.message}
          type={successModal.type}
          onConfirm={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
          onCancel={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
          isLoading={false}
        />
      )}
      {deleteConfirmOpen && (
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title={"Delete Record?"}

          message={
            deletingRecord
              ? `Are you sure you want to delete ${deletingRecord.firstName || deletingRecord.firstname || ''} ${deletingRecord.lastName || deletingRecord.lastname || ''}? This action cannot be undone.`
              : 'Are you sure you want to delete this record?'
          }
          type="danger"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={deletingLoading}
        />
      )}
      {createConfirmOpen && (
        <ConfirmationModal
          isOpen={createConfirmOpen}
          title={"Confirm Add User?"}
          message={'Are you sure you want to add this user and info?'}
          type="info"
          onConfirm={confirmCreate}
          onCancel={() => { setCreateConfirmOpen(false); setPendingCreatePayload(null); }}
          isLoading={creatingLoading}
        />
      )}
      <style>{`
        input[type="text"],
        input[type="tel"],
        input[type="date"],
        input[type="email"],
        select,
        textarea {
          color: #000 !important;
        }
        input[type="date"] {
          padding-right: 40px !important;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          border-radius: 4px;
          margin-right: 8px;
          opacity: 1;
          display: block;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') no-repeat center;
          background-size: contain;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af !important;
          opacity: 1;
        }
        input::-webkit-input-placeholder,
        textarea::-webkit-input-placeholder {
          color: #9ca3af !important;
        }
        input:-moz-placeholder,
        textarea:-moz-placeholder {
          color: #9ca3af !important;
        }
        input::-moz-placeholder,
        textarea::-moz-placeholder {
          color: #9ca3af !important;
        }
        /* --- NEW CUSTOM SCROLLBAR STYLES --- */
  
        /* Width for vertical scrollbar, Height for horizontal */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        /* The background of the scrollbar (transparent looks cleaner) */
        ::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px;
        }

        /* The moving part of the scrollbar */
        ::-webkit-scrollbar-thumb {
          background: #d1d5db; /* Light Gray */
          border-radius: 20px;
          border: 2px solid transparent; /* Creates padding effect */
          background-clip: content-box;
        }

        /* Hover effect - turns to your theme color */
        ::-webkit-scrollbar-thumb:hover {
          background: #800000; /* Marikina Red */
          border: 0;
          border-radius: 20px;
        }

        /* Firefox Support */
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
      `}</style>
      {/* Header section (Summary cards removed as requested) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-t">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Citizen Records</h2>
          <p className="text-sm text-gray-500">Manage, verify, and print official PWD identification cards.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl shadow-sm text-sm font-bold hover:bg-gray-50 hover:text-[#800000] transition-all active:scale-95"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-[#800000] text-white text-sm font-bold rounded-xl hover:bg-[#600000] shadow-lg transition-all active:scale-95"
          >
            <Plus size={18} /> New Record
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center no-print">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or PWD ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] transition-all text-black placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters ? 'bg-gray-100 border-[#800000] text-[#800000]' : 'bg-gray-50 border-gray-300 text-gray-600'
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black"
                    value={filterCriteria.disabilityType}
                    onChange={(e) => setFilterCriteria({...filterCriteria, disabilityType: e.target.value})}
                  >
                    <option value="">All Types</option>
                    {disabilityTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black"
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-black"
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

     
      <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <div className="overflow-x-auto rounded-2xl border border-gray-300 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#800000]/10 to-red-50 border-b-2 border-[#800000]/20 sticky top-0 z-10">
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">PWD ID</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">First Name</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Middle Name</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Last Name</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Suffix</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Sex</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Birthdate</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Age</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Contact No</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Address</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">HOA</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Disability Type</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Disability Cause</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Guardian Name</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Guardian Contact</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Reg Date</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Cluster</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] whitespace-nowrap">Status</th>
                  <th className="px-5 py-4 font-bold text-[#800000] uppercase tracking-wide text-[10px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
  {currentItems.length > 0 ? currentItems.map((row, idx) => {
    // 1. DEFINE A UNIQUE ID (Safety check for pwd_id vs id)
    const uniqueId = row.pwd_id || row.id;

    return (
      <tr key={uniqueId} className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-[#800000]/5 hover:to-red-50/50 group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
        {/* ... (Your existing columns: PWD ID, Name, etc.) ... */}
        
        <td className="px-5 py-4 text-gray-900 whitespace-nowrap font-medium text-xs">{row.formattedPwdId || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-900 whitespace-nowrap">{row.firstname || row.firstName || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{row.middlename || row.middleName || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-900 whitespace-nowrap">{row.lastname || row.lastName || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-900 whitespace-nowrap font-medium">{(row.suffix || row.Suffix) ? (row.suffix || row.Suffix) : <span className="text-gray-400">N/A</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{row.sex || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap text-xs">{row.birthdate ? new Date(row.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-900 whitespace-nowrap text-sm">{row.age || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap text-xs">{row.contact_no || row.contactNo || row.contactNumber || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap max-w-xs truncate text-xs">{row.address || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap text-xs font-medium">{row.hoa || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-900 whitespace-nowrap font-medium text-xs">{getDisabilityName(row.disability_type || row.disabilityType) || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap max-w-xs truncate text-xs">{row.disability_cause || row.disabilityCause || <span className="text-gray-400">—</span>}</td>
        
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap text-xs">{row.guardian_name || row.guardianName || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap text-xs">{row.guardian_contact || row.guardianContact || row.emergencyNumber || <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-700 whitespace-nowrap text-xs">{row.registration_date ? new Date(row.registration_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : <span className="text-gray-400">—</span>}</td>
        <td className="px-5 py-4 text-gray-900 whitespace-nowrap font-medium text-xs">Group {row.cluster_group_no || row.clusterGroupNo || 'N/A'}</td>
        
        <td className="px-5 py-4 whitespace-nowrap">
  <span className={`w-16 inline-flex justify-center items-center py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
    (row.registration_status || row.status) === 'Active' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm' 
      : 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
  }`}>
    {row.registration_status || row.status || '—'}
  </span>
</td>

        {/* --- FIXED ACTION COLUMN (3 DOTS) --- */}
        <td className="px-5 py-4 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button onClick={() => handleOpenEdit(row)} className="p-2 text-gray-500 hover:text-[#800000] hover:bg-red-100 rounded-lg transition-all duration-150" title="Edit">
              <Edit2 size={16} />
            </button>
            <button onClick={() => handleDelete(row)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-150" title="Delete">
              <Trash2 size={16} />
            </button>
            
            <div className="relative inline-block text-left z-10">
              {/* 2. TOGGLE USING UNIQUE ID */}
              <button 
                onClick={() => setOpenMenuRowId(openMenuRowId === uniqueId ? null : uniqueId)} 
                className={`p-2 rounded-lg transition-all duration-150 ${openMenuRowId === uniqueId ? 'text-[#800000] bg-red-50' : 'text-gray-500 hover:text-[#800000] hover:bg-gray-100'}`}
                title="More"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {/* 3. SHOW ONLY IF IDs MATCH */}
              {openMenuRowId === uniqueId && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => { setSelectedRecord(row); setOpenMenuRowId(null); }} 
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-[#800000] flex items-center gap-3 border-b border-gray-100 transition-colors"
                  >
                    <CreditCard size={16} /> ID Preview
                  </button>
                  <button 
                    onClick={() => { setViewRecord(normalizeRecord(row)); setShowInfoModal(true); setOpenMenuRowId(null); }} 
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-[#800000] flex items-center gap-3 transition-colors"
                  >
                    <Eye size={16} /> View Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }) : (
    <tr>
      <td colSpan={20} className="px-5 py-20 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <p className="text-gray-500 font-semibold">No records found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or search</p>
        </div>
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm p-4 flex items-center justify-between no-print">
          <div className="text-sm text-gray-600 font-semibold">
            Showing <span className="text-[#800000] font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[#800000] font-bold">{Math.min(currentPage * itemsPerPage, filteredRows.length)}</span> of <span className="text-[#800000] font-bold">{filteredRows.length}</span> records
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    currentPage === page 
                      ? 'bg-[#800000] text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#EBEBEB] rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-8 border border-gray-700">
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
                <div className="flex items-center gap-3 border-b-3 border-gray-500 pb-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-[#800000]"><User size={18} /></div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Personal Identification</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">First Name *</label>
                    <input name="firstName" type="text" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.firstName || editingRecord?.firstname || ''} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Middle Name</label>
                    <input name="middleName" type="text" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.middleName || editingRecord?.middlename || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Name *</label>
                    <input name="lastName" type="text" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.lastName || editingRecord?.lastname || ''} required />
                  </div>
                                  {/* SUFFIX FIX */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Suffix</label>
                    <input name="suffix" type="text" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                      defaultValue={editingRecord?.suffix || ''} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sex</label>
                    <select name="sex" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                      defaultValue={editingRecord?.sex || 'Male'}
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  {/* BIRTHDATE FIX */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Birthdate *</label>
                    <input name="birthdate" type="date" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                      defaultValue={formatDateForInput(editingRecord?.birthdate)} required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact Number</label>
                    <input name="contactNo" type="text" inputMode="numeric" maxLength="11" pattern="[0-9]{11}" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.contactNo || editingRecord?.contact_no || editingRecord?.contactNumber || ''} placeholder="09xxxxxxxxx" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cluster Group</label>
                    <select name="clusterGroupNo" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" defaultValue={editingRecord?.clusterGroupNo || editingRecord?.cluster_group_no || '1'}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Cluster {n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Disability Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-3 border-gray-500 pb-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-800"><HeartPulse size={18} /></div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Disability Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                   {/* DISABILITY TYPE FIX */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Disability Type *</label>
                      <select name="disabilityType" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                        defaultValue={getDisabilityValueForForm(editingRecord)} required
                      >
                        <option value="">Select Type</option>
                        {disabilityTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registration Status</label>
                      <select name="status" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                        defaultValue={editingRecord?.status || editingRecord?.registration_status || 'Active'}
                      >
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 p-6 rounded-2xl border-2 border-gray-400 space-y-6">
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Specific Cause Details</label>
                      <input 
                        name="cause_specific" 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                        placeholder="e.g., Accident, Disease, Birth Defect"
                        required={causeType !== ''}
                        value={causeSpecific}
                        onChange={(e) => setCauseSpecific(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RESIDENTIAL & SUPPORT SECTION (Integrated from requested layout) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b-3 border-gray-500 pb-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-700">
                  <MapPin size={18} />
                </div>
                <h4 className="font-black text-[#1F2937] uppercase text-sm tracking-widest">Residential & Support</h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Side: Address Fields */}
                <div className="space-y-6">
                  
                  {/* NEW: Split HOA and Barangay into two columns */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Homeowners Association</label>
                      <input 
                        name="hoa" 
                        type="text" 
                        className="w-full px-4 py-4 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10" 
                        defaultValue={editingRecord?.hoa || ''} 
                        placeholder="HOA Name"
                      />
                    </div>
        
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Address *</label>
                    <textarea 
                      name="address" 
                      rows={4}
                      className="w-full px-4 py-4 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10 resize-none" 
                      defaultValue={editingRecord?.address || ''}
                      placeholder="# House No., Street Name"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Right Side: Guardian Box (F9FAFB background) */}
                <div className="bg-[#F9FAFB] p-8 rounded-[2rem] border-2 border-gray-400 flex flex-col gap-6 h-full">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guardian Name</label>
                    <input 
                      name="guardian" 
                      type="text" 
                      className="w-full px-4 py-4 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10" 
                      defaultValue={editingRecord?.guardian || editingRecord?.guardian_name || ''} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guardian Contact</label>
                    <input 
                      name="guardianContact" 
                      type="text" 
                      inputMode="numeric"
                      maxLength="11"
                      pattern="[0-9]{11}"
                      className="w-full px-4 py-4 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-green-500/10" 
                      defaultValue={editingRecord?.guardianContact || editingRecord?.guardian_contact || editingRecord?.emergencyNumber || ''}
                      placeholder="09xxxxxxxxx"
                    />
                  </div>
                </div>
              </div>
            </div>

              {/* FORM FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-12 pt-10 border-t-3 border-gray-500">
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

            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start justify-items-center print:p-0 print:block">
              <div className="space-y-12 print:space-y-8 print:w-full print:flex print:flex-col print:items-center">
                {/* ID FRONT REPLICA */}
                <div className="id-card-replica id-card-replica-front shadow-2xl border border-gray-400">
                  <div className="replica-header">
                    <img  src="./src/assets/logo.png" 
                    alt="Barangay Logo" 
                    className="replica-logo-seal" 
                    />
                    <div className="replica-header-text">
                      <h1 className="main-title">REPUBLIC OF THE PHILIPPINES</h1>
                      <h2 className="city-title">CITY OF MARIKINA</h2>
                      <h3 className="brgy-title">BARANGAY NANGKA</h3>
                      <p className="contact-info">#9 OLD J.P RIZAL ST. NANGKA, MARIKINA CITY</p>
                    </div>
                    <div className="replica-logo-right">
                      <img  src="./src/assets/bagongpinas.png" 
                      alt="Bpinas Logo" 
                      className="replica-logo-bagong" 
                      />
                    </div>
                  </div>
                  <div className="replica-body">
                    <h2 className="replica-title">BARANGAY NANGKA PWD MEMBER</h2>
                    <div className="replica-top-fields">
                       <p>CLUSTER: <span className="underline-field">{selectedRecord.clusterGroupNo || selectedRecord.cluster_group_no || '______'}</span></p>
                       <p>TAG NO: <span className="underline-field">{(selectedRecord.id || selectedRecord.pwd_id || '').toString().split('-').pop() || '______'}</span></p>
                    </div>
                    <div className="replica-main-content">
                       <div className="replica-left-col">
                          <div className="replica-photo-box">
                             {capturedPhoto ? <img src={capturedPhoto} /> : <div className="replica-photo-placeholder"><User size={48} className="opacity-10" /></div>}
                          </div>
                          <div className="replica-signature-line">
                             <div className="replica-sig-line"><br/></div>
                          </div>

                          <div className="replica-signature-block">
                             <p>Signature Over Printed Name</p>
                          </div>
                       </div>
                       <div className="replica-right-col">
                          <DataRow label="FULL NAME:" value={`${selectedRecord.firstname || selectedRecord.firstName || ''} ${selectedRecord.middlename || selectedRecord.middleName || ''} ${selectedRecord.lastname || selectedRecord.lastName || ''}`} />
                          <DataRow label="ADDRESS:" value={selectedRecord.address || ''} />
                          <DataRow label="P.W.D ID NUMBER:" value={selectedRecord.formattedPwdId || selectedRecord.id || selectedRecord.pwd_id || ''} />
                          <DataRow label="TYPE OF DISABILITY:" value={getDisabilityName(selectedRecord.disability_type || selectedRecord.disabilityType) || 'N/A'} />
                       </div>
                    </div>
                  </div>
                  <div className="replica-footer"><p>"Ang ID na ito ay para lamang sa mga benepisyo at programa para sa mga taong may kapansanan sa Barangay Nangka"</p></div>
                </div>

                {/* ID BACK REPLICA */}
                <div className="id-card-replica id-card-replica-back shadow-2xl border border-gray-400">
                  <div className="replica-header">
                    <img  src="./src/assets/logo.png" 
                    alt="Barangay Logo" 
                    className="replica-logo-seal" 
                    />
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
                       <img  src="./src/assets/bagongpinas.png" 
                        alt="Bpinas Logo" 
                        className="replica-logo-bagong" 
                        />
                    </div>
                  </div>
                  <div className="replica-body-back">
                    <div className="back-watermark">BARANGAY NANGKA</div>
                    <div className="back-content-z">
                      <h4 className="emergency-notify-label">ADDRESS &amp; SUPPORT</h4>
                      <div className="emergency-fields-group grid grid-cols-1 gap-3">
                        <FieldRow label="HOA:" value={selectedRecord.hoa || selectedRecord.hoa_name || selectedRecord.homeowners || ''} />
                        <FieldRow label="FULL ADDRESS:" value={selectedRecord.address || selectedRecord.full_address || selectedRecord.ADDRESS || ''} />
                        <FieldRow label="GUARDIAN NAME:" value={selectedRecord.guardian || selectedRecord.guardian_name || selectedRecord.emergencyContact || selectedRecord.guardianName || ''} />
                        <FieldRow label="GUARDIAN CONTACT:" value={selectedRecord.guardianContact || selectedRecord.guardian_contact || selectedRecord.emergencyNumber || selectedRecord.guardian_contact_no || ''} />
                      </div>

                      <div className="administration-section">
                         <p className="admin-label">UNDER THE ADMINISTRATION OF</p>
                         <div className="admin-signature-line"></div>
                         <p className="admin-name">HON. CELSO R. DELAS ARMAS JR.</p>
                         <div className="back-qr" title="PWD QR Code">
                           <img
                             src={`http://localhost:5000/pwd/${encodeURIComponent(selectedRecord.formattedPwdId || selectedRecord.pwd_id || selectedRecord.id || '')}/qr`}
                             alt="PWD QR"
                             onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(selectedRecord.formattedPwdId || selectedRecord.pwd_id || selectedRecord.id || '')}`; }}
                           />
                         </div>
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
                      {/* <button onClick={handleGenerateQr} disabled={!selectedRecord || isLoading} className="w-full px-4 py-4 bg-blue-700 text-white rounded-xl font-bold uppercase flex items-center justify-center gap-2">Generate QR</button>*/}
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
                    <InfoItem label="Full Name" value={`${viewRecord.firstName || ''} ${viewRecord.middleName || ''} ${viewRecord.lastName || ''}`.trim()} />
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Sex" value={viewRecord.sex || 'Male'} />
                      <InfoItem label="Birthdate" value={viewRecord.birthdate ? (new Date(viewRecord.birthdate).toLocaleDateString('en-CA')) : 'N/A'} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Age" value={viewRecord.age || 'N/A'} />
                      <InfoItem label="Contact Number" value={viewRecord.contactNo || viewRecord.contactNumber || 'N/A'} />
                    </div>
                    <InfoItem label="System ID" value={viewRecord.formattedPwdId || viewRecord.pwd_id || viewRecord.id || 'N/A'} mono />
                    {viewRecord && (
                      <div className="mt-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">QR Code</p>
                        <img
                          src={`http://localhost:5000/pwd/${encodeURIComponent(viewRecord.formattedPwdId || viewRecord.pwd_id || viewRecord.id || '')}/qr`}
                          alt="PWD ID QR"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(viewRecord.formattedPwdId || viewRecord.pwd_id || viewRecord.id || '')}`; }}
                          className="w-32 h-32 object-contain border border-gray-300 rounded-md bg-white"
                        />
                      </div>
                    )}
                  </div>
                </section>
                <section className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-purple-400 mb-4 tracking-widest">Disability Details</h4>
                  <div className="space-y-4">
                    <InfoItem label="Classification" value={getDisabilityName(viewRecord.disabilityType) || 'N/A'} />
                    <InfoItem label="Cause" value={viewRecord.disabilityCause || 'N/A'} />
                    <InfoItem label="Cluster Assignment" value={viewRecord.clusterGroupNo ? `Cluster ${viewRecord.clusterGroupNo}` : 'N/A'} />
                    <InfoItem label="Status" value={viewRecord.status || 'Active'} />
                  </div>
                </section>
                <section className="bg-green-50/50 p-6 rounded-2xl border border-green-100 md:col-span-2">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-green-400 mb-4 tracking-widest">Address & Support</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="HOA" value={viewRecord.hoa || 'N/A'} />
                    <InfoItem label="Full Address" value={viewRecord.address || 'N/A'} />
                    <InfoItem label="Guardian Name" value={viewRecord.guardian || viewRecord.emergencyContact || 'N/A'} />
                    <InfoItem label="Guardian Contact" value={viewRecord.guardianContact || viewRecord.emergencyNumber || 'N/A'} />
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
        .id-card-replica { width: 500px; height: 320px; background: #FBECEC; display: flex; flex-direction: column; overflow: hidden; font-family: 'Inter', sans-serif; position: relative; border-radius: 4px; }
        .id-card-replica-front, .id-card-replica-back { background-color: #F8DCDC; }
        .replica-header { background: linear-gradient(90deg, #5b0000 0%, #800000 50%, #5b0000 100%); color: white; display: flex; align-items: center; justify-content: space-between; padding: 4px 14px; height: 70px; position: relative; }
        .replica-logo-seal { width: 44px; height: 44px; object-fit: contain; align-self: center; }
        .replica-header-text { text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 6px; }
        .main-title { font-size: 11px; font-weight: 900; margin: 0; line-height: 1.02; text-shadow: none; }
        .city-title { font-size: 12px; font-weight: 900; margin: 0; line-height: 1.02; }
        .brgy-title { font-size: 12px; font-weight: 900; margin: 0; line-height: 1.02; }
        .contact-info { font-size: 6px; font-weight: 700; margin: 0; opacity: 1; line-height: 1.1; text-transform: uppercase; }
        .replica-logo-right { display: flex; flex-direction: column; align-items: center; }
        .replica-logo-bagong { width: 44px; height: 44px; object-fit: contain; align-self: center; }
        
        .replica-body { padding: 0 0 10px 0; flex: 1; display: flex; flex-direction: column; }
        .replica-title { display: flex; justify-content: center; font-size: 11px; font-weight: 900; color: #000; margin-top: 10px; letter-spacing: -0.3px; }
        .replica-top-fields { display: flex; justify-content: center; gap: 14px;}
        .replica-top-fields p { font-size: 10px; font-weight: 900; color: #000; }
        .replica-top-fields .underline-field { border-bottom: 1.5px solid #000; padding: 0 4px; color: #000; }
        
        .replica-main-content { display: flex; padding: 0 10px; gap: 12px; flex: 1; margin-top: 2px; }
        .replica-left-col { width: 120px; display: flex; flex-direction: column; align-items: center; }
        .replica-photo-box { width: 100px; height: 100px; background: white; border: 2px solid #000; overflow: hidden; margin-bottom: 6px; }
        .replica-photo-box img { width: 100%; height: 100%; object-fit: cover; }
        
        /* Signature adjusted to not be bold and to fit under the photo */
        .replica-signature-line { width: 100%; text-align: center; padding-top: 25px; }
        .replica-sig-line {width:100%; height: 1px; background: #000; }

        .replica-signature-block { width: 100%; text-align: center; }
        .replica-signature-block p { font-size: 7px; font-weight: 800; color: #000; text-transform: uppercase; }
        
        .replica-right-col { flex: 1; display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
        .replica-data-row { display: flex; flex-direction: column; gap: 1px; }
        .replica-data-row label { font-size: 8px; font-weight: 900; color: #000; text-transform: uppercase; }
        .replica-value { font-size: 11px; font-weight: 400 !important; font-weight: normal !important; color: #000 !important; text-transform: uppercase; border-bottom: 1.5px dotted rgba(0,0,0,0.45); padding-bottom: 1px; }

        .replica-footer { background-color: #800000; color: white; text-align: center; padding: 8px 10px; position: absolute; bottom: 0; width: 100%; }
        .replica-footer p { font-size: 7px; font-weight: 800; margin: 0; text-transform: uppercase; }

        .replica-body-back { flex: 1; position: relative; padding: 20px 28px; display: flex; flex-direction: column; overflow: hidden; font-size: 12px; }
        .back-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-12deg); font-size: 65px; font-weight: 900; color: rgba(0,0,0,0.04); white-space: nowrap; pointer-events: none; width: 100%; text-align: center; }
        .back-content-z { position: relative; z-index: 5; display: flex; flex-direction: column; height: 100%; }
        .emergency-notify-label { font-size: 13px; font-weight: 700; color: #000; margin-bottom: 8px; text-transform: uppercase; }
        .emergency-fields-group { display: flex; flex-direction: column; gap: 8px; }
        .field-row { display: flex; align-items: center; gap: 8px; }
        .field-row label { font-size: 11px; font-weight: 700; color: #000; min-width: 90px; }
        .field-row span { font-size: 12px; font-weight: 400; color: #000 !important; border-bottom: none; flex: 1; min-height: 18px; line-height: 1.1; text-transform: uppercase; word-break: break-word; white-space: pre-line; }
        
        .administration-section { margin-top: 8px; display: flex; flex-direction: column; align-items: center; padding-bottom: 6px; position: relative; width: 100%; }
        .admin-label { font-size: 9px; font-weight: 900; color: #000; margin-bottom: 6px; }
        .admin-signature-line { width: 240px; height: 2px; background: #000; margin-bottom: 4px; }
        .admin-name { font-size: 14px; font-weight: 900; color: #000; margin-top: 4px; }

        /* QR code on back side */
        .back-qr { position: absolute; right: -20px; top: 15%; transform: translateY(-50%); width: 92px; height: 92px; background: white; padding: 6px; border: 2px solid #000; box-sizing: border-box; display:flex; align-items:center; justify-content:center; z-index:6; }
        .back-qr img { width: 100%; height: 100%; object-fit: contain; display:block; }

        @media print {
          .back-qr { box-shadow: none !important; border: 1px solid #000 !important; }
        }
        
        .replica-footer-back { background-color: #4A0000; color: white; text-align: center; padding: 8px 30px; position: absolute; bottom: 0; width: 100%; }
        .replica-footer-back p { font-size: 8px; font-weight: 400; margin: 0; line-height: 1.25; }

        @media print {
          body * { visibility: hidden !important; }
          .no-print, .no-print-overlay, .no-print-container, .no-print-shadow { display: none !important; visibility: hidden !important; }
          .id-card-replica, .id-card-replica * { visibility: visible !important; display: flex !important; }
          .fixed.inset-0.z-\\[130\\] { visibility: visible !important; display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; background: white !important; }
          .no-print-container { visibility: visible !important; display: block !important; background: white !important; box-shadow: none !important; border: none !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; }
          .id-card-replica { margin: 0 auto 40px auto !important; page-break-inside: avoid !important; -webkit-print-color-adjust: exact !important; border: 1px solid #ccc !important; box-shadow: none !important; }
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
    <span>{(value || '').toString().toUpperCase()}</span>
  </div>
);

const InfoItem = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className={`mt-1 text-sm font-bold ${mono ? 'font-mono text-[#800000]' : 'text-gray-800'}`}>{value}</p>
  </div>
);

export default ManageView;