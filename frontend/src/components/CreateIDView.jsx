
import React, { useState, useRef } from 'react';
import { Camera, Upload, ChevronRight, ChevronLeft, Printer } from 'lucide-react';

const CreateIDView = () => {
  const [step, setStep] = useState('photo');
  const [photo, setPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setPhoto(canvasRef.current.toDataURL('image/png'));
        
        // Stop stream
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[500px]">
        {/* Progress Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700 uppercase tracking-widest text-center flex-grow">
            Barangay Nangka PWD Citizen Member
          </h2>
        </div>

        <div className="p-8">
          {step === 'photo' && (
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-xl aspect-video bg-gray-50 border-4 border-gray-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                {!photo ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                    <Camera size={64} className="text-gray-300 relative z-0 opacity-20" />
                  </>
                ) : (
                  <img src={photo} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={!photo ? startCamera : () => setPhoto(null)}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-100 border border-gray-400 rounded-md font-bold text-gray-700 hover:bg-gray-200"
                >
                  <Camera size={20} /> {!photo ? "Open Camera" : "Retake"}
                </button>
                {videoRef.current?.srcObject && !photo && (
                   <button 
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md font-bold hover:bg-red-700"
                  >
                    Capture
                  </button>
                )}
                <button className="flex items-center gap-2 px-6 py-2 bg-gray-100 border border-gray-400 rounded-md font-bold text-gray-700 hover:bg-gray-200">
                  <Upload size={20} /> Browse
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              
              <button 
                onClick={() => setStep('info')}
                className="mt-8 flex items-center gap-2 px-8 py-2 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:bg-blue-600 transition-colors uppercase italic text-sm"
              >
                Next Page <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <div className="aspect-square bg-gray-50 border-2 border-gray-800 rounded flex items-center justify-center overflow-hidden">
                  {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Camera className="text-gray-200" size={64} />}
                </div>
                <div className="flex gap-2">
                   <button className="flex-1 py-2 bg-gray-100 border border-gray-400 rounded font-bold text-xs uppercase">Camera</button>
                   <button className="flex-1 py-2 bg-gray-100 border border-gray-400 rounded font-bold text-xs uppercase">Browse</button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Personal Information</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Fullname" className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                    <input type="text" placeholder="Address" className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                    <input type="text" placeholder="Date of Birth" className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                    <input type="text" placeholder="H.O.A" className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Disability Details</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Types Of Disability" className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                    <input type="text" placeholder="PWD ID Number" className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Cluster Group NO." className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                      <input type="text" placeholder="PWD TAG NO.." className="w-full p-2 border border-gray-300 rounded italic text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button onClick={() => setStep('photo')} className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-full font-bold text-xs uppercase italic">
                    <ChevronLeft size={16} /> Back Page
                  </button>
                  <button onClick={() => setStep('emergency')} className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-full font-bold text-xs uppercase italic">
                    Next Page <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'emergency' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
               <div className="aspect-square bg-gray-50 border-2 border-gray-800 rounded flex items-center justify-center overflow-hidden">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Camera className="text-gray-200" size={64} />}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-black text-gray-800 mb-6 uppercase text-sm italic tracking-tighter">Emergency Contact (Back Part of the Card)</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Fullname" className="w-full p-3 border border-gray-300 rounded italic" />
                    <input type="text" placeholder="Contact NO." className="w-full p-3 border border-gray-300 rounded italic" />
                    <input type="text" placeholder="Address" className="w-full p-3 border border-gray-300 rounded italic" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setStep('preview')}
                    className="w-full py-3 bg-[#10a851] text-white rounded-full font-bold text-lg shadow-lg hover:bg-green-700 transition-colors"
                  >
                    Create ID
                  </button>
                  <button 
                    onClick={() => setStep('info')}
                    className="w-32 py-2 bg-[#3b82f6] text-white rounded-full font-bold text-xs uppercase italic shadow-md"
                  >
                    &lt;&lt; BACK PAGE
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-12">
              <h2 className="text-4xl font-black text-center text-gray-800 italic uppercase">ID Preview</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Front ID Mockup */}
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-xl relative aspect-[1.6/1] overflow-hidden">
                   <div className="bg-[#800000] text-white p-1 flex justify-between items-center rounded-t">
                      <div className="w-7 h-7 bg-white rounded-full p-0.5"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png" /></div>
                      <div className="text-[7px] text-center font-bold">
                        REPUBLIC OF THE PHILIPPINES<br/>CITY OF MARIKINA<br/>BARANGAY NANGKA
                      </div>
                      <div className="w-7 h-7 bg-white rounded-full p-0.5"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png" /></div>
                   </div>
                   <div className="p-2 flex gap-2">
                      <div className="w-24 h-24 bg-gray-100 border border-gray-800">
                        {photo && <img src={photo} className="w-full h-full object-cover" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-[8px] text-gray-800 -mt-1">BARANGAY NANGKA PWD MEMBER</h4>
                        <div className="text-[7.5px] text-gray-600 space-y-0.5 mt-0.5">
                          <p><strong>FULL NAME:</strong> JOSHUA TRAQUENA</p>
                          <p><strong>ADDRESS:</strong> 45 LILAC ST.</p>
                          <p><strong>P.W.D ID NUMBER:</strong> PWD-01-2021</p>
                          <p><strong>TYPE OF DISABILITY:</strong> DEAF</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Back ID Mockup */}
                <div className="bg-[#fadcdc] p-3 rounded-xl border-2 border-gray-200 shadow-xl relative aspect-[1.6/1] overflow-hidden">
                   <div className="bg-[#800000] text-white p-1 flex justify-between items-center rounded-t">
                      <div className="w-7 h-7 bg-white rounded-full p-0.5"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png" /></div>
                      <div className="text-[7px] text-center font-bold">CITY OF MARIKINA</div>
                      <div className="w-7 h-7 bg-white rounded-full p-0.5"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Seal_of_Marikina.svg/1200px-Seal_of_Marikina.svg.png" /></div>
                   </div>
                   <div className="p-3 flex flex-col items-center justify-center h-full gap-2">
                      <h4 className="font-bold text-[10px] text-gray-800">IN CASE OF EMERGENCY, PLS. NOTIFY:</h4>
                      <div className="text-[8px] text-center text-gray-600 space-y-1">
                        <p><strong>NAME:</strong> IVELL JAY</p>
                        <p><strong>CONTACT NO:</strong> 09123456789</p>
                      </div>
                      <div className="mt-4 text-[6px] text-center italic opacity-70">This ID card is issued exclusively to residents of Brgy Nangka...</div>
                   </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setStep('emergency')}
                  className="px-8 py-2 bg-blue-500 text-white rounded-full font-bold text-xs uppercase shadow-lg"
                >
                  &lt;&lt; BACK PAGE
                </button>
                <button className="flex items-center gap-2 px-12 py-3 bg-blue-500 text-white rounded-full font-bold text-lg shadow-xl hover:bg-blue-600 transition-transform active:scale-95">
                  <Printer size={24} /> Print
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateIDView;
