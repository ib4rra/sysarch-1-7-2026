
import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Camera, 
  RefreshCcw,
  UserCheck,
  MapPin,
  AlertTriangle,
  Upload,
  FileSearch
} from 'lucide-react';


const VerifyIDView = () => {
  const [method, setMethod] = useState('qr');
  const [searchId, setSearchId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [scanningError, setScanningError] = useState(null);
  
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

  const mockDatabase = [
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
  ];

  const handleManualSearch = (e) => {
    if (e) e.preventDefault();
    const found = mockDatabase.find(r => r.id.toUpperCase() === searchId.toUpperCase());
    setResult(found || null);
    setHasSearched(true);
  };

  const processQRResult = (data) => {
    const found = mockDatabase.find(r => r.id.toUpperCase() === data.toUpperCase());
    setResult(found || null);
    setSearchId(data);
    setHasSearched(true);
    stopScanner();
  };

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
        // If the decoder isn't loaded yet, try again next frame
        if (isScanning) requestRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const code = jsqr(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        processQRResult(code.data);
        return;
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
            // stop camera if decoder didn't load
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
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
      }
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
        // If result isn't a string, skip setting the src to avoid errors
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
        <p className="text-gray-500 max-w-lg mx-auto">
          Verify the authenticity of Barangay Nangka PWD Membership IDs through our secure system.
        </p>
      </div>

      <div className="bg-gray-100 p-1 rounded-xl flex max-w-md mx-auto">
        <button 
          onClick={() => { setMethod('qr'); stopScanner(); setHasSearched(false); setScanningError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
            method === 'qr' ? 'bg-white text-[#800000] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <QrCode size={18} /> QR Scanner
        </button>
        <button 
          onClick={() => { setMethod('manual'); stopScanner(); setHasSearched(false); setScanningError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
            method === 'manual' ? 'bg-white text-[#800000] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
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
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover" 
                    />
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
                    <button 
                      onClick={() => setScanningError(null)}
                      className="mt-4 text-[10px] text-white font-black uppercase tracking-widest hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={isScanning ? stopScanner : startScanner}
                  className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                    isScanning 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-[#800000] text-white hover:bg-[#600000] shadow-red-900/20'
                  }`}
                >
                  {isScanning ? <RefreshCcw className="animate-spin" size={18} /> : <Camera size={18} />}
                  {isScanning ? 'Stop Scan' : 'Live Camera'}
                </button>
                
                <button 
                  onClick={handleFileBrowse}
                  className="py-4 bg-gray-100 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all flex items-center justify-center gap-3 border border-gray-200"
                >
                  <Upload size={18} /> Browse File
                </button>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PWD ID Number</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="text" 
                      placeholder="e.g. PWD-2024-001"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] transition-all"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-[#800000] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#600000] shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                >
                  Verify Now
                </button>
              </form>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-4 text-blue-700">
                <ShieldCheck size={20} className="shrink-0" />
                <p className="text-[10px] font-bold leading-relaxed uppercase">
                  Manual entry requires exact matches including hyphens. Verification checks against the centralized Barangay Nangka database.
                </p>
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
                    <p className="text-xs text-gray-500 font-mono mt-1">{result.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Disability Type</label>
                    <p className="text-sm font-bold text-red-700">{result.disabilityType}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Status</label>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-black border border-green-100 uppercase">
                      {result.status}
                    </span>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block flex items-center gap-1">
                      <MapPin size={10} /> Registered Address
                    </label>
                    <p className="text-sm font-semibold text-gray-600">{result.address}</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
                     View Details
                   </button>
                   <button className="flex-1 py-3 bg-[#800000] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#600000] transition-colors shadow-md">
                     Log Access
                   </button>
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
                <button 
                  onClick={() => setHasSearched(false)}
                  className="px-6 py-2 border-2 border-gray-100 text-gray-400 rounded-full text-[10px] font-black uppercase hover:border-gray-200 hover:text-gray-600 transition-all"
                >
                  Try Again
                </button>
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
    </div>
  );
};

export default VerifyIDView;
