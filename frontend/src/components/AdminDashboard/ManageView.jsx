import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, X, Eye, Printer, Camera, Save,User,HeartPulse,MoreHorizontal,CreditCard,ChevronLeft,ChevronRight,MapPin,Upload,FileText,Phone, Download, CheckCircle, AlertTriangle, AlignCenter, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
    }
  };

  const currentStyle = styles[type] || styles.info;

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
          <div className="flex gap-3 w-full pt-4">
            <button 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-3 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm flex items-center justify-center gap-2 ${currentStyle.btn} disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
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
  const itemsPerPage = 10;
  
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
  const [selectedCondition, setSelectedCondition] = useState('');
  const [isCustomCondition, setIsCustomCondition] = useState(false);
  const [selectedDisabilityType, setSelectedDisabilityType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contactNumberError, setContactNumberError] = useState('');
  const [tagNumberError, setTagNumberError] = useState('');

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Create confirmation state
  const [createConfirmOpen, setCreateConfirmOpen] = useState(false);
  const [pendingCreatePayload, setPendingCreatePayload] = useState(null);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    disabilityType: '',
    clusterGroupNo: '',
    hoa: ''
  });

  const [disabilityConditions, setDisabilityConditions] = useState({});  // Store conditions by disability ID

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const disabilityTypes = [
    { id: 1, name: "Visual Impairment", emoji: "👁️", description: "Blindness or low vision", examples: [] },
    { id: 2, name: "Hearing Impairment", emoji: "👂", description: "Deafness or hard of hearing", examples: [] },
    { id: 3, name: "Physical Disability", emoji: "🦽", description: "Mobility or physical limitations", examples: [] },
    { id: 4, name: "Intellectual Disability", emoji: "🧠", description: "Cognitive or developmental disability", examples: [] },
    { id: 5, name: "Psychosocial Disability", emoji: "💭", description: "Mental health conditions", examples: [] },
    { id: 6, name: "Speech Disability", emoji: "🗣️", description: "Speech or language impairment", examples: [] },
    { id: 7, name: "Multiple Disabilities", emoji: "⚡", description: "More than one type of disability", examples: [] }
  ];

  // Cluster information with sub-areas
  const clusterData = {
    1: [
      { letter: 'A', name: 'Nangka Centro' },
      { letter: 'B', name: 'Old J.P. Rizal & J.P. Rizal' },
      { letter: 'C', name: 'Marikit' },
      { letter: 'D', name: 'Permaline' }
    ],
    2: [
      { letter: 'A', name: 'Twin River Subdivision & Bayabas Extension' },
      { letter: 'B', name: 'Camacho Phase 1 & 2' }
    ],
    3: [
      { letter: 'A', name: 'Balubad Settlement Phase 1 & 2' },
      { letter: 'B', name: 'PIDAMANA' }
    ],
    4: [
      { letter: 'A', name: 'Area 1, 2, 3, & 4' },
      { letter: 'B', name: 'Twinville Subdivision part of Nangka' }
    ],
    5: [
      { letter: 'A', name: 'Greenland Phase 1 & 2' },
      { letter: 'B', name: 'Ateneo Ville' },
      { letter: 'C', name: 'Greenheights Phase 3 & 4' },
      { letter: 'D', name: 'St. Benedict & Jaybee Subdivision' }
    ],
    6: [
      { letter: 'A', name: 'Libya Extension' },
      { letter: 'B', name: 'Bagong Silang' },
      { letter: 'C', name: 'St. Mary' },
      { letter: 'D', name: 'Hampstead' }
    ],
    7: [
      { letter: 'A', name: 'Marikina Village' },
      { letter: 'B', name: 'Tierra Vista' },
      { letter: 'C', name: 'Anastacia' },
      { letter: 'D', name: 'Mira Verde' }
    ]
  };

  const [showClusterModal, setShowClusterModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [clusterGroupArea, setClusterGroupArea] = useState('');

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

  // 3b. Get Disability Examples from loaded conditions
  const getDisabilityExamples = (disabilityId) => {
    if (!disabilityId) return [];
    const idNum = parseInt(disabilityId);
    return disabilityConditions[idNum] || [];
  };

  // 4. Format Cluster Display with Area (e.g., "2 - A - Twin River Subdivision & Bayabas Extension")
  const formatClusterDisplay = (clusterNo, areaLetter, areaName) => {
    if (!clusterNo) return 'N/A';
    if (!areaLetter) return `${clusterNo}`;
    if (!areaName) return `${clusterNo} - ${areaLetter}`;
    return `${clusterNo} - ${areaLetter} - ${areaName}`;
  };

  // 5. Get Cluster Area Display (e.g., "Cluster 2 - A - Twin River Subdivision & Bayabas Extension")
  const getClusterAreaDisplay = (clusterNo, areaLetter, areaName) => {
    if (!clusterNo) return 'N/A';
    if (!areaLetter) return `Cluster ${clusterNo}`;
    if (!areaName) return `Cluster ${clusterNo} - ${areaLetter}`;
    return `Cluster ${clusterNo} - ${areaLetter} - ${areaName}`;
  };

  // 4. FIX FOR BIRTHDATE: Convert ISO timestamp to YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; 
    return date.toISOString().split('T')[0];
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
      // contact
      contactNo: r.contactNo || r.contact_no || r.contact || 'N/A',
      // id
      pwd_id: r.pwd_id || r.pwdId || r.id || r.PWD_ID || null,
      formattedPwdId: r.formattedPwdId || r.pwd_id || r.id || r.pwdId || null,
      // disability
      disabilityType: r.disabilityType || r.disability_type || r.disability || null,
      disabilityCause: r.disabilityCause || r.disability_cause || r.disability_cause_detail || null,
      // guardian
      guardian: r.guardian || r.guardian_name || r.guardianName || null,
      guardianContact: r.guardianContact || r.guardian_contact || r.guardian_contact_no || null,
      // cluster and status
      clusterGroupNo: r.clusterGroupNo || r.cluster_group_no || r.cluster || null,
      clusterGroupArea: r.clusterGroupArea || r.cluster_group_area || null,
      area_name: r.area_name || null,
      status: r.status || r.registration_status || r.registrationStatus || null,
      // address and hoa
      address: r.address || r.full_address || r.ADDRESS || '',
      hoa: r.hoa || r.hoa_name || r.homeowners || null,
      barangay: r.barangay || r.barangay_name || null,
      // birthdate
      birthdate: r.birthdate || r.birth_date || r.dateOfBirth || null,
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
    
    // Load disability conditions from database
    const loadDisabilityConditions = async () => {
      try {
        const { disabilityAPI } = await import('../../api');
        const conditionsResponse = await disabilityAPI.getAllDisabilityConditions();
        const conditions = conditionsResponse.data || [];
        
        // Group conditions by disability_id
        const conditionsByDisability = {};
        conditions.forEach(cond => {
          if (!conditionsByDisability[cond.disability_id]) {
            conditionsByDisability[cond.disability_id] = [];
          }
          conditionsByDisability[cond.disability_id].push(cond.condition_name);
        });
        
        setDisabilityConditions(conditionsByDisability);
      } catch (err) {
        console.error('Error loading disability conditions:', err);
      }
    };
    
    loadRecords();
    loadDisabilityConditions();
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
      
      // Cluster filtering
      let matchesCluster = true;
      if (filterCriteria.clusterGroupNo) {
        const rowCluster = String(row.cluster_group_no || row.clusterGroupNo || '').trim();
        const filterCluster = String(filterCriteria.clusterGroupNo).trim();
        matchesCluster = rowCluster === filterCluster;
      }
      
      // HOA filtering
      let matchesHOA = true;
      if (filterCriteria.hoa) {
        const rowHOA = String(row.hoa || row.hoa_name || row.homeowners || '').toLowerCase().trim();
        const filterHOA = String(filterCriteria.hoa).toLowerCase().trim();
        matchesHOA = rowHOA === filterHOA;
      }

      return matchesSearch && matchesStatus && matchesType && matchesCluster && matchesHOA;
    });
  }, [localRecords, searchQuery, filterCriteria]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const currentItems = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Check for duplicate contact number or tag number
  const checkForDuplicates = async (contactNo, tagNo) => {
    if (!contactNo && !tagNo) return;
    
    try {
      const dupCheck = await pwdAdminAPI.checkDuplicate(contactNo, tagNo);
      setContactNumberError(dupCheck.data.contactNumberExists ? dupCheck.data.contactNumberMessage : '');
      setTagNumberError(dupCheck.data.tagNoExists ? dupCheck.data.tagNoMessage : '');
    } catch (err) {
      console.warn('Duplicate check warning:', err);
    }
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setCauseType('');
    setCauseSpecific('');
    setSelectedCondition('');
    setIsCustomCondition(false);
    setSelectedDisabilityType('');
    setContactNumberError('');
    setTagNumberError('');
    setClusterGroupArea('');
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
          const specificPart = parts[1] || '';
          const disabilityType = disabilityTypes.find(d => d.name === parts[0]);
          // Check if specific part is in the predefined examples
          if (disabilityType && disabilityType.examples.includes(specificPart)) {
            setSelectedCondition(specificPart);
            setIsCustomCondition(false);
          } else {
            // It's a custom condition
            setSelectedCondition(specificPart);
            setIsCustomCondition(true);
          }
          setCauseSpecific(specificPart);
      } else {
          setCauseType(cause);
          setCauseSpecific('');
          setSelectedCondition('');
          setIsCustomCondition(false);
      }
    } else {
      setCauseType('');
      setCauseSpecific('');
      setSelectedCondition('');
      setIsCustomCondition(false);
    }
    const disabilityValue = getDisabilityValueForForm(record);
    setSelectedDisabilityType(disabilityValue);
    setClusterGroupArea(record.clusterGroupArea || record.cluster_group_area || '');
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
    } catch (err) {
      console.error('Error creating record:', err);
      alert('Error: ' + (err.response?.data?.message || err.message || 'Failed to create record'));
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
    
    // Check if area is selected
    if (!clusterGroupArea) {
      alert('Please select an area for the cluster');
      return;
    }

    // Check if Contact Number is filled
    const contactNo = formEl.querySelector('[name="contactNo"]').value.trim();
    if (!contactNo) {
      alert('Contact Number is required');
      return;
    }

    // Check if Tag No. is filled
    const tagNo = formEl.querySelector('[name="tagNo"]').value.trim();
    if (!tagNo) {
      alert('Tag No. is required');
      return;
    }

    // Check if PWD ID is filled
    const pwdId = formEl.querySelector('[name="pwdId"]').value.trim();
    if (!pwdId) {
      alert('PWD ID is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Get userId from localStorage (admin who created the record)
      const adminId = localStorage.getItem('userId');

      const cType = String(causeType || '');
      const cSpecific = String(selectedCondition || causeSpecific || '');
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
        tagNo: String(formData.get('tagNo') || ''),  // Manual tag number input
        pwdId: String(formData.get('pwdId') || ''),  // PWD ID field
        emergencyContact: String(formData.get('guardian') || '').toUpperCase(),  // Maps to 'emergencyContact'
        emergencyNumber: String(formData.get('guardianContact') || ''),  // Maps to 'emergencyNumber'
        disabilityType: getDisabilityId(String(formData.get('disabilityType') || '')),  // Convert name to ID
        disabilityCause: finalCause,
        registrationStatus: String(formData.get('status') || 'Active'),
        clusterGroupNo: String(formData.get('clusterGroupNo') || '1'),
        clusterGroupArea: String(clusterGroupArea || ''),
      };

      if (editingRecord) {
        // Update existing record - no need to check duplicates for existing records
        const recordId = editingRecord.pwd_id || editingRecord.id;
        try {
          const response = await pwdAdminAPI.updateRegistrant(recordId, recordData);
          
          // Update local state immediately with new data, merging with existing fields
          setLocalRecords(prev => prev.map(row => {
            const rowId = row.pwd_id || row.id;
            if (rowId === recordId) {
              // Merge the updated data with existing row data to preserve all fields
              return {
                ...row,
                ...recordData,
                firstName: recordData.firstName,
                lastName: recordData.lastName,
                middleName: recordData.middleName,
                suffix: recordData.suffix,
                gender: recordData.gender,
                birthdate: recordData.dateOfBirth,
                birth_date: recordData.dateOfBirth,
                dateOfBirth: recordData.dateOfBirth,
                hoa: recordData.hoa,
                address: recordData.address,
                contactNo: recordData.contactNumber,
                contact_no: recordData.contactNumber,
                tagNo: recordData.tagNo,
                tag_no: recordData.tagNo,
                pwdId: recordData.pwdId,
                pwd_id: recordData.pwdId,
                guardian: recordData.emergencyContact,
                guardianContact: recordData.emergencyNumber,
                guardian_contact: recordData.emergencyNumber,
                disabilityType: recordData.disabilityType,
                disability_type: recordData.disabilityType,
                disabilityCause: recordData.disabilityCause,
                disability_cause: recordData.disabilityCause,
                registrationStatus: recordData.registrationStatus,
                registration_status: recordData.registrationStatus,
                status: recordData.registrationStatus,
                clusterGroupNo: recordData.clusterGroupNo,
                cluster_group_no: recordData.clusterGroupNo,
                clusterGroupArea: recordData.clusterGroupArea,
                cluster_group_area: recordData.clusterGroupArea,
                age: recordData.dateOfBirth ? calculateAge(recordData.dateOfBirth) : row.age,
              };
            }
            return row;
          }));
          
          setShowFormModal(false);
          setEditingRecord(null);
          // Silently update without alert, refresh the full list after a short delay to sync with server
          setTimeout(() => {
            refreshRecords();
          }, 500);
        } catch (err) {
          console.error('Error updating record:', err);
          setError(err.message || 'Failed to update record');
          alert('Error: ' + (err.message || 'Failed to update record'));
          setIsLoading(false);
        }
        return;
      } else {
        // Check for duplicates before creating new record
        try {
          const dupCheck = await pwdAdminAPI.checkDuplicate(recordData.contactNumber, recordData.tagNo);
          if (dupCheck.data.contactNumberExists) {
            alert('❌ ' + dupCheck.data.contactNumberMessage);
            setIsLoading(false);
            return;
          }
          if (dupCheck.data.tagNoExists) {
            alert('❌ ' + dupCheck.data.tagNoMessage);
            setIsLoading(false);
            return;
          }
        } catch (dupErr) {
          console.warn('Duplicate check warning:', dupErr);
          // Continue anyway if check fails
        }

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print mb-6">
        <div className="flex-1">
          <h2 className="text-4xl font-black text-gray-900 mb-2">PWD Records</h2>
          <p className="text-sm text-gray-600 font-medium">Manage, verify, and print official PWD identification cards.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl shadow-md text-sm font-bold hover:bg-gray-50 hover:text-[#800000] hover:shadow-lg hover:border-[#800000] transition-all active:scale-95 duration-200"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-[#800000] text-white text-sm font-bold rounded-xl hover:bg-[#600000] shadow-lg hover:shadow-xl transition-all active:scale-95 duration-200"
          >
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-300 shadow-md p-5 flex flex-col md:flex-row gap-4 items-center no-print mb-6">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or PWD ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all text-black placeholder-gray-500 shadow-sm"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-bold transition-all duration-200 shadow-sm ${
              showFilters ? 'bg-[#800000]/10 border-[#800000] text-[#800000] shadow-md' : 'bg-white border-gray-300 text-gray-700 hover:border-[#800000]/50'
            }`}
          >
            <Filter size={18} />
            <span className="text-sm">Filters</span>
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
                    {disabilityTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
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
                    <option value="Inactive">Inactive</option>
                    <option value="Deceased">Deceased</option>
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
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HOA</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-black"
                    value={filterCriteria.hoa}
                    onChange={(e) => setFilterCriteria({...filterCriteria, hoa: e.target.value})}
                  >
                    <option value="">All HOA</option>
                    {Array.from(new Set(localRecords.map(r => r.hoa || r.hoa_name || r.homeowners).filter(Boolean))).sort().map((hoaName, idx) => <option key={idx} value={hoaName}>{hoaName}</option>)}
                  </select>
               </div>
               <button 
                onClick={() => setFilterCriteria({ status:'', disabilityType:'', clusterGroupNo:'', hoa: '' })}
                className="w-full py-2 text-[10px] font-black uppercase text-red-700 hover:bg-red-50 rounded-lg transition-colors"
               >
                 Clear Filters
               </button>
            </div>
          )}
        </div>
      </div>

     
           <div className="bg-white rounded-3xl border border-gray-300 shadow-lg no-print overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-[#800000] to-[#600000] border-b-3 border-[#800000]/30 sticky top-0 z-10">
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px]">Tag No</th>
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px]">PWD ID</th>
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px]">Full Name</th>
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px]">Disability</th>
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px]">Cluster</th>
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px]">HOA</th>
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px]">Status</th>
                <th className="px-4 py-4 font-black text-white uppercase tracking-wide text-[9px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
  {currentItems.length > 0 ? currentItems.map((row, idx) => {
    // 1. DEFINE A UNIQUE ID (Safety check for pwd_id vs id)
    const uniqueId = row.pwd_id || row.id;

    return (
      <tr key={uniqueId} className={`transition-all duration-200 hover:bg-[#800000]/3 hover:shadow-sm group border-l-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:border-l-[#800000]`}>
        <td className="px-4 py-3 text-gray-900 font-bold text-xs truncate">{row.tagNo || row.tag_no || row.tag_number || <span className="text-gray-400">—</span>}</td>
        <td className="px-4 py-3 text-gray-900 font-medium text-xs truncate">{row.formattedPwdId || row.pwd_id || row.pwdId || row.id || <span className="text-gray-400">—</span>}</td>
        <td className="px-4 py-3 text-gray-900 font-semibold text-xs truncate">
          {(() => {
            const firstName = row.firstName || row.firstname || row.first_name || '';
            const middleName = row.middleName || row.middlename || row.middle_name || '';
            const lastName = row.lastName || row.lastname || row.last_name || '';
            const fullName = `${firstName} ${middleName} ${lastName}`.trim();
            return fullName || <span className="text-gray-400">—</span>;
          })()}
        </td>
        <td className="px-4 py-3 text-gray-900 font-medium text-xs truncate">
          {(() => {
            const disabilityId = row.disability_type || row.disabilityType;
            const disabilityName = getDisabilityName(disabilityId);
            let cause = row.disability_cause || row.disabilityCause;
            
            if (!disabilityName) return <span className="text-gray-400">—</span>;
            
            // If cause is "Congenital" or "Inborn", get the specific condition instead
            if (cause && (cause.toLowerCase() === 'congenital' || cause.toLowerCase() === 'inborn')) {
              const conditions = getDisabilityExamples(disabilityId);
              if (conditions && conditions.length > 0) {
                cause = conditions[0].condition_name || conditions[0].name || cause;
              }
            }
            
            // Get short disability name (first word only)
            const shortName = disabilityName.split(' ')[0];
            
            return cause ? `${shortName} - ${cause}` : shortName;
          })()}
        </td>
        <td className="px-4 py-3 text-gray-900 font-medium text-xs truncate">{formatClusterDisplay(row.cluster_group_no || row.clusterGroupNo || row.cluster, row.cluster_group_area || row.clusterGroupArea, row.area_name) || 'N/A'}</td>
        <td className="px-4 py-3 text-gray-700 text-xs font-medium truncate">{row.hoa || row.hoa_name || row.homeowners || <span className="text-gray-400">—</span>}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex justify-center items-center px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
            (row.registration_status || row.status) === 'Active' 
              ? 'bg-emerald-100 text-emerald-700' 
              : (row.registration_status || row.status) === 'Deceased'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {row.registration_status || row.status || '—'}
          </span>
        </td>

        {/* --- ACTION COLUMN (3 DOTS) --- */}
        <td className="px-3 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-gray-500 hover:text-[#800000] hover:bg-red-100 rounded-lg transition-all duration-150" title="Edit">
              <Edit2 size={14} />
            </button>
            <button onClick={() => handleDelete(row)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-150" title="Delete">
              <Trash2 size={14} />
            </button>
            
            <div className="relative inline-block text-left z-10">
              {/* 2. TOGGLE USING UNIQUE ID */}
              <button 
                onClick={() => setOpenMenuRowId(openMenuRowId === uniqueId ? null : uniqueId)} 
                className={`p-1.5 rounded-lg transition-all duration-150 ${openMenuRowId === uniqueId ? 'text-[#800000] bg-red-50' : 'text-gray-500 hover:text-[#800000] hover:bg-gray-100'}`}
                title="More"
              >
                <MoreHorizontal size={14} />
              </button>
              
              {/* 3. SHOW ONLY IF IDs MATCH */}
              {openMenuRowId === uniqueId && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
      <td colSpan={8} className="px-5 py-20 text-center">
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

      {/* PAGINATION CONTROLS */}
      {filteredRows.length > itemsPerPage && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-300 shadow-sm p-3 no-print">
          <div className="text-xs font-semibold text-gray-600">
            Showing <span className="text-[#800000]">{(currentPage - 1) * itemsPerPage + 1}</span>-<span className="text-[#800000]">{Math.min(currentPage * itemsPerPage, filteredRows.length)}</span> of <span className="text-[#800000]">{filteredRows.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-[#800000] hover:bg-red-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-[#800000] hover:bg-red-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded-md font-bold text-xs transition-all ${
                    currentPage === page
                      ? 'bg-[#800000] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-500 hover:text-[#800000] hover:bg-red-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-500 hover:text-[#800000] hover:bg-red-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-8 border border-gray-200">
            <div className="px-8 py-6 bg-gradient-to-r from-[#800000] to-[#600000] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  {editingRecord ? <Edit2 size={24} /> : <Plus size={24} />}
                  {editingRecord ? 'Update PWD Profile' : 'New PWD Member Registration'}
                </h3>
                <p className="text-xs opacity-90 font-semibold tracking-wider mt-1">Fill in all required fields marked with *</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form className="p-10 space-y-8 max-h-[75vh] overflow-y-auto bg-gray-50" onSubmit={handleSaveRecord}>
              {/* Personal Identification Section */}
              <div className="space-y-5 bg-white p-8 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 border-b-3 border-[#800000] pb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-[#800000]"><User size={20} /></div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Personal Identification</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">First Name *</label>
                    <input name="firstName" type="text" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" defaultValue={editingRecord?.firstName || editingRecord?.firstname || ''} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Middle Name</label>
                    <input name="middleName" type="text" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" defaultValue={editingRecord?.middleName || editingRecord?.middlename || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Last Name *</label>
                    <input name="lastName" type="text" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" defaultValue={editingRecord?.lastName || editingRecord?.lastname || ''} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Suffix</label>
                    <input name="suffix" type="text" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" defaultValue={editingRecord?.suffix || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sex</label>
                    <select name="sex" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" defaultValue={editingRecord?.sex || 'Male'}>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Birthdate *</label>
                    <input name="birthdate" type="date" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" defaultValue={formatDateForInput(editingRecord?.birthdate)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Contact Number: <span className="text-gray-600">*</span></label>
                    <input 
                      name="contactNo" 
                      type="tel" 
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:border-[#800000] transition-all ${
                        contactNumberError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-[#800000]/20'
                      }`}
                      defaultValue={editingRecord?.contactNo || editingRecord?.contact_no || ''} 
                      onBlur={(e) => !editingRecord && checkForDuplicates(e.target.value, '')}
                    />
                    {contactNumberError && <p className="text-xs text-red-600 font-semibold">⚠️ {contactNumberError}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Tag No. <span className="text-gray-600">*</span></label>
                    <input 
                      name="tagNo" 
                      type="text" 
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:border-[#800000] transition-all ${
                        tagNumberError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-[#800000]/20'
                      }`}
                      defaultValue={editingRecord?.tagNo || editingRecord?.tag_no || ''} 
                      placeholder="e.g., 001, 002, 051"
                      onBlur={(e) => !editingRecord && checkForDuplicates('', e.target.value)}
                    />
                    {tagNumberError && <p className="text-xs text-red-600 font-semibold">⚠️ {tagNumberError}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">PWD ID <span className="text-gray-600">*</span></label>
                    <input 
                      name="pwdId" 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" 
                      defaultValue={editingRecord?.pwdId || editingRecord?.pwd_id || editingRecord?.formattedPwdId || ''} 
                      placeholder="e.g., PWD-MRK-CL01-2026-0001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Cluster Group</label>
                    <select name="clusterGroupNo" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-all" defaultValue={editingRecord?.clusterGroupNo || editingRecord?.cluster_group_no || '1'}>
                      {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>Cluster {n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Area <span className="text-gray-600">*</span></label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={clusterGroupArea}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none cursor-not-allowed transition-all"
                        placeholder="Select from areas"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const clusterValue = document.querySelector('select[name="clusterGroupNo"]').value;
                          setSelectedCluster(parseInt(clusterValue));
                          setShowClusterModal(true);
                        }}
                        className="px-5 py-3 bg-[#800000] text-white rounded-lg font-bold text-sm hover:bg-[#600000] transition-colors shadow-md"
                      >
                        View Areas
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disability Information Section */}
              <div className="space-y-5 bg-white p-8 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 border-b-3 border-purple-500 pb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-800"><HeartPulse size={20} /></div>
                  <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Disability Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                   {/* DISABILITY TYPE FIX */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Disability Type *</label>
                      <select name="disabilityType" className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                        value={selectedDisabilityType}
                        onChange={(e) => setSelectedDisabilityType(e.target.value)}
                        required
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
                        <option value="Inactive">Inactive</option>
                        <option>Deceased</option>
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
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Specific Condition *</label>
                      {(() => {
                        const selectedDisability = disabilityTypes.find(d => d.name === selectedDisabilityType);
                        const disabilityId = selectedDisability?.id;
                        const examples = getDisabilityExamples(disabilityId);
                        
                        return selectedDisability ? (
                          <div className="flex gap-2">
                            <select className="flex-1 px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  setIsCustomCondition(true);
                                  setSelectedCondition('');
                                } else {
                                  setIsCustomCondition(false);
                                  setSelectedCondition(e.target.value);
                                }
                              }}
                              value={isCustomCondition ? 'custom' : selectedCondition}
                            >
                              <option value="">Select or enter custom condition</option>
                              {examples.map((example, idx) => (
                                <option key={idx} value={example}>{example}</option>
                              ))}
                              <option value="custom">+ Enter Condition (Not in the choices)</option>
                            </select>
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                            placeholder="Select a disability type first"
                            disabled
                          />
                        );
                      })()}
                      
                      {isCustomCondition && (
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-xl text-sm font-bold text-black" 
                          placeholder="Type your specific condition here..."
                          value={selectedCondition}
                          onChange={(e) => setSelectedCondition(e.target.value)}
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RESIDENTIAL & SUPPORT SECTION */}
            <div className="space-y-5 bg-white p-8 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3 border-b-3 border-green-500 pb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                  <MapPin size={20} />
                </div>
                <h4 className="font-black text-gray-800 uppercase text-sm tracking-widest">Residential & Support</h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Address Fields */}
                <div className="space-y-5">
                  
                  {/* HOA Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Homeowners Association</label>
                    <input 
                      name="hoa" 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                      defaultValue={editingRecord?.hoa || ''} 
                      placeholder="HOA Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Full Address *</label>
                    <textarea 
                      name="address" 
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none" 
                      defaultValue={editingRecord?.address || ''}
                      placeholder="# House No., Street Name"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Right Side: Guardian Box */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200 flex flex-col gap-5">
                  <h5 className="font-black text-gray-800 uppercase text-xs tracking-widest text-green-700 border-b border-green-200 pb-2">Emergency Contact</h5>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Contact Name:</label>
                    <input 
                      name="guardian" 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-green-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                      defaultValue={editingRecord?.guardian || editingRecord?.guardian_name || ''} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Contact:</label>
                    <input 
                      name="guardianContact" 
                      type="tel" 
                      className="w-full px-4 py-3 bg-white border border-green-300 rounded-lg text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
                      defaultValue={editingRecord?.guardianContact || editingRecord?.guardian_contact || ''} 
                    />
                  </div>
                </div>
              </div>
            </div>

              {/* FORM FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-6 pt-6 border-t-2 border-gray-200 bg-white p-8 rounded-2xl">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-gray-600 font-bold text-sm uppercase tracking-widest hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-[#800000] to-[#600000] text-white text-sm font-bold rounded-lg hover:shadow-lg shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
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
                       <p>CLUSTER: <span className="underline-field">{formatClusterDisplay(selectedRecord.clusterGroupNo || selectedRecord.cluster_group_no, selectedRecord.clusterGroupArea || selectedRecord.cluster_group_area) || '______'}</span></p>
                       <p>TAG NO: <span className="underline-field">{selectedRecord.tagNo || selectedRecord.tag_no || '______'}</span></p>
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
                       <p className="contact-info">09286278131 - BARANGAY ACTION CENTER</p>
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
                      <h4 className="emergency-notify-label">Emergency Contact</h4>
                      <div className="emergency-fields-group grid grid-cols-1 gap-3">
                        <FieldRow label="HOA:" value={selectedRecord.hoa || selectedRecord.hoa_name || selectedRecord.homeowners || ''} />
                        <FieldRow label="FULL ADDRESS:" value={selectedRecord.address || selectedRecord.full_address || selectedRecord.ADDRESS || ''} />
                        <FieldRow label="CONTACT NAME:" value={selectedRecord.guardian || selectedRecord.guardian_name || selectedRecord.emergencyContact || selectedRecord.guardianName || ''} />
                        <FieldRow label="CONTACT :" value={selectedRecord.guardianContact || selectedRecord.guardian_contact || selectedRecord.emergencyNumber || selectedRecord.guardian_contact_no || ''} />
                      </div>

                      <div className="administration-section">
                        
                         <div className="admin-signature-line"></div>
                         <p className="admin-name">CELSO R. DELAS ARMAS JR.</p>
                         <p className="admin-label" style={{marginTop: '0px', marginBottom: '0px'}}>Punong Barangay</p>
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
                       <button onClick={handleGenerateQr} disabled={!selectedRecord || isLoading} className="w-full px-4 py-4 bg-blue-700 text-white rounded-xl font-bold uppercase flex items-center justify-center gap-2">Generate QR</button>
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
                      <InfoItem label="Contact Number" value={viewRecord.contactNo || 'N/A'} />
                    </div>
                    <InfoItem label="System ID" value={viewRecord.formattedPwdId || viewRecord.pwd_id || viewRecord.id || 'N/A'} mono />
                    {viewRecord && (
                      <div className="mt-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">QR Code</p>
                        <img
                          src={`http://localhost:5000/pwd/${encodeURIComponent(viewRecord.formattedPwdId || viewRecord.pwd_id || viewRecord.id || '')}/qr`}
                          alt="PWD ID QR"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(viewRecord.formattedPwdId || viewRecord.pwd_id || viewRecord.id || '')}`; }}
                          className="w-32 h-32 object-contain border border-gray-200 rounded-md bg-white"
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
                    <InfoItem label="Cluster Assignment" value={getClusterAreaDisplay(viewRecord.clusterGroupNo, viewRecord.clusterGroupArea, viewRecord.area_name) || 'N/A'} />
                    <InfoItem label="Status" value={viewRecord.status || 'Active'} />
                  </div>
                </section>
                <section className="bg-green-50/50 p-6 rounded-2xl border border-green-100 md:col-span-2">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-green-400 mb-4 tracking-widest">Address & Support</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="HOA" value={viewRecord.hoa || 'N/A'} />
                    <InfoItem label="Full Address" value={viewRecord.address || 'N/A'} />
                    <InfoItem label="Contact Name" value={viewRecord.guardian || 'N/A'} />
                    <InfoItem label="Contact" value={viewRecord.guardianContact || 'N/A'} />
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

      {/* Cluster Modal */}
      {showClusterModal && selectedCluster && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-8 py-6 bg-[#800000] text-white flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight">Select Area - Cluster {selectedCluster}</h3>
              <button onClick={() => setShowClusterModal(false)} className="p-2 hover:bg-white/20 rounded-full transition"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {clusterData[selectedCluster] && clusterData[selectedCluster].length > 0 ? (
                <div className="space-y-4">
                  {clusterData[selectedCluster].map((area, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setClusterGroupArea(area.letter);
                        setShowClusterModal(false);
                      }}
                      className="w-full flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-[#800000] hover:text-white hover:border-[#800000] transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 group-hover:bg-white group-hover:text-[#800000]">
                        {area.letter}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-black group-hover:text-white">{area.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No areas defined for this cluster</p>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setShowClusterModal(false)} className="px-6 py-2 bg-[#800000] text-white text-xs font-black uppercase rounded-lg hover:bg-[#600000] transition-colors">Close</button>
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
        .emergency-notify-label { font-size: 12px; font-weight: 700; color: #000; margin-bottom: 6px; text-transform: uppercase; }
        .emergency-fields-group { display: flex; flex-direction: column; gap: 6px; }
        .field-row { display: flex; align-items: flex-start; gap: 12px; }
        .field-row label { font-size: 10px; font-weight: 700; color: #000; min-width: 110px; flex-shrink: 0; }
        .field-row span { font-size: 11px; font-weight: 400; color: #000 !important; border-bottom: none; flex: 1; min-height: 16px; line-height: 1.2; text-transform: uppercase; word-break: break-word; white-space: normal; }
        
        .administration-section { margin-top: 45px; display: flex; flex-direction: column; align-items: center; padding-bottom: 6px; position: relative; width: 100%; }
        .admin-label { font-size: 8px; font-weight: 700; color: #000; margin-bottom: 2px; }
        .admin-signature-line { width: 240px; height: 2px; background: #000; margin-bottom: 4px; }
        .admin-name { font-size: 12px; font-weight: 900; color: #000; margin-top: 2px; }

        /* QR code on back side */
        .back-qr { position: absolute; right: -20px; top: -20%; transform: translateY(-50%); width: 92px; height: 92px; background: white; padding: 6px; border: 2px solid #000; box-sizing: border-box; display:flex; align-items:center; justify-content:center; z-index:6; }
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