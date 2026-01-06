import React, { useState } from 'react';
import { Megaphone, Calendar, Zap, Info, Plus, X, MessageSquare } from 'lucide-react';

const HomeView = () => {
  // 1. State for the list of announcements
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Barangay Assembly",
      date: "March 20, 2025 | 3:00 PM",
      location: "Barangay Hall",
      desc: "All residents are encouraged to attend the barangay general assembly.",
      icon: <Megaphone className="text-yellow-500" />,
      type: "GENERAL"
    },
    {
      id: 2,
      title: "ID Processing Update",
      date: "March 15, 2025",
      desc: "Senior Citizen ID release is now available at the barangay office.",
      icon: <Info className="text-blue-500" />,
      tag: "NEW",
      type: "UPDATE"
    },
    {
      id: 3,
      title: "Scheduled Power Interruption",
      date: "March 18, 2025 | 9AM-2PM",
      desc: "Parts of Barangay Nangka will experience temporary power outage.",
      icon: <Zap className="text-red-500" />,
      type: "EMERGENCY"
    }
  ]);

  // 2. State for Modal and Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    type: 'GENERAL',
    content: ''
  });

  const handlePost = () => {
    if (!newNotice.title || !newNotice.content) return;

    const entry = {
      id: Date.now(),
      title: newNotice.title,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      desc: newNotice.content,
      type: newNotice.type,
      // Assign icon based on type
      icon: newNotice.type === 'EMERGENCY' ? <Zap className="text-red-500" /> : 
            newNotice.type === 'UPDATE' ? <Info className="text-blue-500" /> : 
            <Megaphone className="text-yellow-500" />
    };

    setAnnouncements([entry, ...announcements]);
    setIsModalOpen(false); // Close modal
    setNewNotice({ title: '', type: 'GENERAL', content: '' }); // Reset form
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-1">
          <Megaphone className="text-red-800" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Announcements & Updates</h2>
        </div>
        <p className="text-sm text-gray-500 mb-8">Latest notices from Barangay Nangka</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((item) => (
            <div key={item.id} className={`${item.id === 1 ? 'md:col-span-2' : ''} bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  {item.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    {item.tag && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{item.tag}</span>}
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={12} />
                    {item.date}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                  <button className="text-blue-600 text-sm font-semibold hover:underline">View Details ›</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-8 flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-800 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
        >
          <Plus size={16} /> Create Announcement
        </button>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#800000] p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <span className="font-bold tracking-wider text-sm">POST NEW NOTICE</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">Announcement Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Community Clean-up Drive"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-red-100"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                />
              </div>

              {/* Type Toggle */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">Notice Type</label>
                <div className="flex gap-2">
                  {['GENERAL', 'UPDATE', 'EMERGENCY'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewNotice({...newNotice, type})}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        newNotice.type === type 
                        ? 'bg-[#800000] border-[#800000] text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">Full Content / Description</label>
                <textarea 
                  rows="4"
                  placeholder="Provide detailed information here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-red-100 resize-none"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handlePost}
                  className="w-full py-4 bg-[#800000] text-white font-bold rounded-xl shadow-lg shadow-red-900/20 hover:bg-red-900 transition-colors uppercase tracking-widest text-xs"
                >
                  Post Announcement
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 text-slate-400 font-bold text-[10px] tracking-widest uppercase hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;