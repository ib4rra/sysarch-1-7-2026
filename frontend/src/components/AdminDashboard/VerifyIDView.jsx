import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Search, ShieldCheck, CheckCircle, XCircle, Camera, RefreshCcw, UserCheck, MapPin, AlertTriangle, Upload, FileSearch, X } from 'lucide-react';
import { pwdAdminAPI } from '../../api';

const VerifyIDView = () => {
  const [method, setMethod] = useState('qr');
  const [searchId, setSearchId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [scanningError, setScanningError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const requestRef = useRef(null);
  const jsqrRef = useRef(null);

  const loadJsQR = async () => {
    if (jsqrRef.current) return jsqrRef.current;
    try {
      const mod = await import('jsqr');
      const j = mod?.default ?? mod;
      jsqrRef.current = j;
      return j;
    } catch (err) {
      console.error('Failed to load jsQR:', err);
      setScanningError('QR decoding library not found. Please install the `jsqr` package.');
      return null;
    }
  };

  const normalizeResultData = (data) => {
    // Handle nested data structure if backend wraps data
    const d = data.data || data;
    
    return {
      ...d,
      id: d.formattedPwdId || d.pwd_id || d.id || d.pwdId,
      pwd_id: d.pwd_id || d.id || d.pwdId || d.formattedPwdId,
      formattedPwdId: d.formattedPwdId || d.pwd_id || d.id || d.pwdId,
      firstName: d.firstName || d.first_name || d.firstname || '',
      lastName: d.lastName || d.last_name || d.lastname || '',
      middleName: d.middleName || d.middle_name || d.middlename || '',
      sex: d.sex || d.gender || d.Gender || '',
      birthdate: d.birthdate || d.date_of_birth || d.dateOfBirth || d.dob || '',
      age: d.age || d.Age || '',
      contactNumber: d.contactNumber || d.contact_number || d.phone || d.Phone || d.mobileNumber || '',
      contactNo: d.contactNo || d.contact_no || d.contactNumber || d.phone || d.Phone || '',
      disabilityType: d.disabilityType || d.disability_type || d.disabilityClassification || d.Classification || '',
      disabilityCause: d.disabilityCause || d.disability_cause || d.cause || d.causeType || d.cause_specific || d.causeSpecific || '',
      causeType: d.causeType || d.cause_type || d.Cause || '',
      causeSpecific: d.causeSpecific || d.cause_specific || '',
      clusterGroupNo: d.clusterGroupNo || d.cluster_group_no || d.clusterAssignment || d.Cluster || '',
      clusterGroupArea: d.clusterGroupArea || d.cluster_group_area || '',
      area_name: d.area_name || '',
      status: d.status || d.Status || d.registration_status || '',
      hoa: d.hoa || d.HOA || d.homeownersAssociation || '',
      address: d.address || d.full_address || d.Address || d.registeredAddress || '',
      guardian: d.guardian || d.guardian_name || d.guardianName || d.GuardianName || '',
      guardianContact: d.guardianContact || d.guardian_contact || d.GuardianContact || '',
      dateRegistered: d.dateRegistered || d.date_registered || d.DateRegistered || d.registration_date || '',
      registration_date: d.registration_date || d.dateRegistered || d.date_registered || '',
      qrCode: d.qrCode || d.qr_code || d.QRCode || d.qrCodeUrl || '',
      // keep legacy names used by other views
      disabilityCauseLegacy: d.disability_cause || '',
    };
  };

  const handleViewDetails = async () => {
    setShowDetailModal(true);
    
    // Log access to backend in real-time
    if (result && result.id) {
      try {
        await pwdAdminAPI.logAccess({
          pwdId: result.id,
          action: 'VIEW_DETAILS',
          timestamp: new Date().toISOString(),
          module: 'VerifyID'
        });
      } catch (err) {
        console.error('Failed to log access:', err);
      }
    }
  };

  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    setResult(null);
    setHasSearched(false);
    if (!searchId) return;
    try {
      const { success, data } = await pwdAdminAPI.getRegistrantById(searchId);
      if (success && data) {
        setResult(normalizeResultData(data));
      } else {
        setResult(null);
      }
    } catch (err) {
      setResult(null);
    }
    setHasSearched(true);
  };

  const processQRResult = async (data) => {
    setResult(null);
    setHasSearched(false);
    setSearchId(data);
    try {
      const { success, data: userData } = await pwdAdminAPI.getRegistrantById(data);
      if (success && userData) {
        setResult(normalizeResultData(userData));
      } else {
        setResult(null);
      }
    } catch (err) {
      setResult(null);
    }
    setHasSearched(true);
    stopScanner();
  };

  // Debug state for QR box
  const [qrBox, setQrBox] = useState(null);
  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const jsqr = jsqrRef.current;

      if (!jsqr) {
        if (isScanning) requestRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const code = jsqr(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code) {
        setQrBox(code.location);
        processQRResult(code.data);
        return;
      } else {
        setQrBox(null);
      }
    }
    if (isScanning) {
      requestRef.current = requestAnimationFrame(scanFrame);
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setResult(null);
    setHasSearched(false);
    setScanningError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          videoRef.current?.play();
          const jsqr = await loadJsQR();
          if (!jsqr) {
            if (videoRef.current && videoRef.current.srcObject) {
              const st = videoRef.current.srcObject;
              if (st && st.getTracks) st.getTracks().forEach(t => t.stop());
              videoRef.current.srcObject = null;
            }
            setIsScanning(false);
            return;
          }
          requestRef.current = requestAnimationFrame(scanFrame);
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setScanningError("Please allow camera access for the scanner.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      if (stream && stream.getTracks) stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleFileBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const jsqr = await loadJsQR();
        
        if (!jsqr) {
          setScanningError("QR decoding library not available.");
          setHasSearched(true);
          setResult(null);
          return;
        }

        const code = jsqr(imageData.data, imageData.width, imageData.height);
        if (code) {
          processQRResult(code.data);
          setScanningError(null);
        } else {
          setScanningError("No QR code detected in the selected image.");
          setHasSearched(true);
          setResult(null);
        }
      };
      
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        img.src = dataUrl;
      } else {
        console.warn('FileReader result is not a string', dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter flex items-center justify-center gap-3">
          <ShieldCheck className="text-[#800000]" size={32} />
          Official ID Verification
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">Verify the authenticity of Barangay Nangka PWD Membership IDs through our secure system.</p>
      </div>

      <div className="bg-gray-100 p-1 rounded-xl flex max-w-md mx-auto">
        <button onClick={() => { setMethod('qr'); stopScanner(); setHasSearched(false); setScanningError(null); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${method === 'qr' ? 'bg-white text-[#800000] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <QrCode size={18} /> QR Scanner
        </button>
        <button onClick={() => { setMethod('manual'); stopScanner(); setHasSearched(false); setScanningError(null); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${method === 'manual' ? 'bg-white text-[#800000] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Search size={18} /> Manual Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-6">
          {method === 'qr' ? (
            <div className="space-y-6">
              <div className="aspect-square bg-black rounded-xl overflow-hidden relative group">
                {isScanning ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {/* Debug overlay for QR box */}
                    {qrBox && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 10}}>
                        <polygon
                          points={[
                            `${(qrBox.topLeftCorner.x / videoRef.current.videoWidth) * 100}% ${(qrBox.topLeftCorner.y / videoRef.current.videoHeight) * 100}%`,
                            `${(qrBox.topRightCorner.x / videoRef.current.videoWidth) * 100}% ${(qrBox.topRightCorner.y / videoRef.current.videoHeight) * 100}%`,
                            `${(qrBox.bottomRightCorner.x / videoRef.current.videoWidth) * 100}% ${(qrBox.bottomRightCorner.y / videoRef.current.videoHeight) * 100}%`,
                            `${(qrBox.bottomLeftCorner.x / videoRef.current.videoWidth) * 100}% ${(qrBox.bottomLeftCorner.y / videoRef.current.videoHeight) * 100}%`
                          ].join(' ')}
                          fill="none"
                          stroke="#00FF00"
                          strokeWidth="4"
                        />
                      </svg>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-4/5 h-4/5 border-2 border-white/50 rounded-lg relative overflow-hidden">
                        <div className="w-full h-0.5 bg-red-500 absolute top-0 shadow-[0_0_15px_red] animate-[scan_2s_linear_infinite]"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-50">
                    <FileSearch size={48} className="opacity-20 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Ready to Scan or Browse</p>
                  </div>
                )}
                {scanningError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
                    <AlertTriangle className="text-red-500 mb-2" size={32} />
                    <p className="text-red-400 text-sm font-bold">{scanningError}</p>
                    <button onClick={() => setScanningError(null)} className="mt-4 text-[10px] text-white font-black uppercase tracking-widest hover:underline">Dismiss</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={isScanning ? stopScanner : startScanner} className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${isScanning ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[#800000] text-white hover:bg-[#600000] shadow-red-900/20'}`}>
                  {isScanning ? <RefreshCcw className="animate-spin" size={18} /> : <Camera size={18} />}
                  {isScanning ? 'Stop Scan' : 'Live Camera'}
                </button>
                <button onClick={handleFileBrowse} className="py-4 bg-gray-100 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all flex items-center justify-center gap-3 border border-gray-200">
                  <Upload size={18} /> Browse File
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PWD ID Number</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input type="text" placeholder="e.g. PWD-MRK-CL01-2026-0001" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] transition-all text-gray-700" required />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-[#800000] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#600000] shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2">Verify Now</button>
              </form>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-4 text-blue-700">
                <ShieldCheck size={20} className="shrink-0" />
                <p className="text-[10px] font-bold leading-relaxed uppercase">Manual entry requires exact matches including hyphens. Verification checks against the centralized Barangay Nangka database.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-2">System Response</h4>
          {!hasSearched ? (
            <div className="h-64 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
              <ShieldCheck size={48} className="opacity-20 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Waiting for Input...</p>
            </div>
          ) : result ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-green-600 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} />
                  <span className="font-black text-xs uppercase tracking-widest">Verified Record</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <UserCheck size={32} />
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-gray-800 uppercase leading-none">{result.firstName} {result.lastName}</h5>
                    <p className="text-xs text-gray-500 font-mono mt-1">{result.formattedPwdId || result.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Disability Type</label>
                    <p className="text-sm font-bold text-red-700">{result.disabilityType}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Status</label>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-black border border-green-100 uppercase">{result.status}</span>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-1">
                      <MapPin size={10} /> Registered Address
                    </label>
                    <p className="text-sm font-semibold text-gray-600">{result.address}</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button
  onClick={handleViewDetails}
  className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">View Details</button>
    
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-red-600 px-6 py-4 flex items-center gap-3 text-white">
                <XCircle size={24} />
                <span className="font-black text-xs uppercase tracking-widest">Not Found</span>
              </div>
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full mx-auto flex items-center justify-center">
                  <AlertTriangle size={32} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-black text-gray-800 uppercase">Verification Failed</h5>
                  <p className="text-xs text-gray-500">The provided ID Number <span className="font-bold text-red-600">"{searchId}"</span> does not exist in our citizen database.</p>
                </div>
                <button onClick={() => setHasSearched(false)} className="px-6 py-2 border-2 border-gray-100 text-gray-400 rounded-full text-[10px] font-black uppercase hover:border-gray-200 hover:text-gray-600 transition-all">Try Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>

      {/* Detail Modal */}
      {showDetailModal && result && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
            <div className="px-8 py-6 bg-[#800000] text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Citizen Full Profile</h3>
                <p className="text-xs opacity-80 font-bold tracking-widest">PWD DATABASE PREVIEW</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-full transition"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-gray-400 mb-4 tracking-widest">Personal Identification</h4>
                  <div className="space-y-4">
                    <InfoItem label="Full Name" value={`${result.firstName || ''} ${result.middleName || ''} ${result.lastName || ''}`.trim()} />
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Sex" value={result.sex || 'N/A'} />
                      <InfoItem label="Birthdate" value={result.birthdate ? (new Date(result.birthdate).toLocaleDateString('en-CA')) : 'N/A'} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Age" value={result.age || 'N/A'} />
                      <InfoItem label="Contact Number" value={result.contactNumber || result.contactNo || 'N/A'} />
                    </div>
                    <InfoItem label="System ID" value={result.formattedPwdId || result.pwd_id || result.id || 'N/A'} mono />
                    {result && (
                      <div className="mt-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">QR Code</p>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(result.formattedPwdId || result.pwd_id || result.id || '')}`}
                          alt="PWD ID QR"
                          className="w-32 h-32 object-contain border border-gray-200 rounded-md bg-white"
                        />
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-purple-400 mb-4 tracking-widest">Disability Details</h4>
                  <div className="space-y-4">
                    <InfoItem label="Classification" value={result.disabilityType || 'N/A'} />
                    <InfoItem label="Cause" value={result.disabilityCause || (result.causeType ? `${result.causeType} - ${result.causeSpecific || ''}` : 'N/A')} />
                    <InfoItem label="Cluster Assignment" value={result.clusterGroupNo ? (result.clusterGroupArea ? (result.area_name ? `Cluster ${result.clusterGroupNo} - ${result.clusterGroupArea} - ${result.area_name}` : `Cluster ${result.clusterGroupNo} - ${result.clusterGroupArea}`) : `Cluster ${result.clusterGroupNo}`) : 'N/A'} />
                    <InfoItem label="Status" value={result.status || 'Active'} />
                  </div>
                </section>

                <section className="bg-green-50/50 p-6 rounded-2xl border border-green-100 md:col-span-2">
                  <h4 className="flex items-center gap-3 font-black uppercase text-xs text-green-400 mb-4 tracking-widest">Address & Support</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="HOA" value={result.hoa || 'N/A'} />
                    <InfoItem label="Full Address" value={result.address || 'N/A'} />
                    <InfoItem label="Guardian Name" value={result.guardian || 'N/A'} />
                    <InfoItem label="Guardian Contact" value={result.guardianContact || 'N/A'} />
                  </div>
                </section>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">DATE REGISTERED</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{result.dateRegistered ? new Date(result.dateRegistered).toLocaleDateString() : result.registration_date ? new Date(result.registration_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-6 py-2 bg-gray-800 text-white text-xs font-black uppercase rounded-lg">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component used for consistent label/value display
const InfoItem = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className={`mt-1 text-sm font-bold ${mono ? 'font-mono text-[#800000]' : 'text-gray-800'}`}>{value}</p>
  </div>
);

export default VerifyIDView;