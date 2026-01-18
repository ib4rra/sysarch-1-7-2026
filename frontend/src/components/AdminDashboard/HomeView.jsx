import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  Calendar,
  Clock,
  Zap,
  Info,
  Plus,
  X,
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react';
import { announcementsAPI, pwdUserAPI, pwdAdminAPI } from '../../api';

const HomeView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [posting, setPosting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Refs for native pickers
  const dateRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  const [newNotice, setNewNotice] = useState({
    title: '',
    notice_type: 'General',
    content: '',
    event_date: '',
    start_time: '',
    end_time: ''
  });

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // PWD personal info (for PWD users) — fetch + poll + retry with cached fallback
  const [pwdInfo, setPwdInfo] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const pollRef = useRef(null);

  const fetchPwdInfo = async () => {
    const roleId = Number(localStorage.getItem('userRoleId')) || 0;
    setPwdError(null);
    if (roleId < 3) return; // only for PWD users

    setPwdLoading(true);
    try {
      const resp = await pwdUserAPI.getOwnRecord();
      const info = resp?.data?.personal_info || resp?.personal_info || resp?.data || null;
      if (info) {
        let first = (info.firstname || info.firstName || '').trim();
        let last = (info.lastname || info.lastName || '').trim();
        const formattedId = info.formattedPwdId || info.pwd_id || localStorage.getItem('username') || null;

        // fallback to public verify endpoint if names missing
        if ((first === '' || last === '') && formattedId) {
          try {
            const verifyResp = await pwdAdminAPI.getRegistrantById(encodeURIComponent(formattedId));
            const verified = verifyResp?.data || verifyResp;
            if (verified) {
              first = (verified.firstName || verified.firstname || '').trim();
              last = (verified.lastName || verified.lastname || '').trim();
            }
          } catch (err) {
            console.warn('PWD verify fallback failed:', err?.response?.data || err?.message || err);
          }
        }

        const fullName = `${first} ${last}`.replace(/\s+/g, ' ').trim().toUpperCase();
        const newInfo = {
          formattedId,
          fullName,
          firstName: first || null,
          lastName: last || null,
          isActive: info.isActive !== undefined ? !!info.isActive : (info.login_active ? !!info.login_active : true)
        };

        setPwdInfo(newInfo);
        try { localStorage.setItem('displayName', fullName); localStorage.setItem('pwdIsActive', newInfo.isActive ? '1' : '0'); } catch (e) {}
        window.dispatchEvent(new CustomEvent('pwdInfoUpdated', { detail: newInfo }));
      } else {
        setPwdInfo(null);
      }
    } catch (err) {
      console.warn('Failed to fetch PWD own record:', err?.response?.data || err?.message || err);
      const cachedActive = localStorage.getItem('pwdIsActive');
      const cachedName = localStorage.getItem('displayName');
      if (cachedActive !== null || cachedName) {
        setPwdInfo({
          formattedId: localStorage.getItem('username'),
          fullName: cachedName || null,
          isActive: cachedActive === '1'
        });
        // Keep silently showing cached info — do not set a visible banner message
        setPwdError(null);
      } else {
        setPwdError(err?.response?.data?.message || err?.message || 'Could not fetch personal information');
      }
    } finally {
      setPwdLoading(false);
    }
  };

  useEffect(() => {
    fetchPwdInfo();
    pollRef.current = setInterval(fetchPwdInfo, 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchPwdInfo(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(pollRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getAll();
      
      if (response.success && response.data) {
        // Transform database announcements to match UI format
        const formattedAnnouncements = response.data.map((announcement) => {
          let dateTimeString = '';

          // Prioritize event_date with time if available
          if (announcement.event_date) {
            const eventDate = new Date(announcement.event_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            dateTimeString = eventDate;

            if (announcement.start_time && announcement.end_time) {
              const startTime12 = formatTime12Hour(announcement.start_time);
              const endTime12 = formatTime12Hour(announcement.end_time);
              dateTimeString += ` ${startTime12} - ${endTime12}`;
            } else if (announcement.start_time) {
              const startTime12 = formatTime12Hour(announcement.start_time);
              dateTimeString += ` ${startTime12}`;
            }
          } else {
            // Fallback to created_at only if no event_date
            dateTimeString = new Date(announcement.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
          }

          return {
            announcement_id: announcement.announcement_id,
            id: announcement.announcement_id,
            title: announcement.title,
            date: dateTimeString,
            desc: announcement.content,
            type: announcement.notice_type,
            icon: getIconForType(announcement.notice_type),
            posted_by_name: announcement.posted_by_name,
            event_date: announcement.event_date,
            start_time: announcement.start_time,
            end_time: announcement.end_time
          };
        });
        
        setAnnouncements(formattedAnnouncements);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Emergency':
        return <Zap className="text-red-500" />;
      case 'Update':
        return <Info className="text-blue-500" />;
      default:
        return <Megaphone className="text-yellow-500" />;
    }
  };

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    
    // timeString format: "HH:MM:SS" or "HH:MM"
    const [hours, minutes] = timeString.split(':').slice(0, 2);
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12; // Convert 0 to 12
    
    return `${displayHour}:${minutes}${ampm}`;
  };

  const handlePost = async () => {
    if (!newNotice.title || !newNotice.content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setPosting(true);
      const payload = {
        title: newNotice.title,
        content: newNotice.content,
        notice_type: newNotice.notice_type,
        event_date: newNotice.event_date || null,
        start_time: newNotice.start_time || null,
        end_time: newNotice.end_time || null
      };

      let response;
      if (isEditMode && editingId) {
        // Update existing announcement
        response = await announcementsAPI.update(editingId, payload);
      } else {
        // Create new announcement
        response = await announcementsAPI.create(payload);
      }

      if (response.success) {
        // Refresh announcements list
        await fetchAnnouncements();
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setNewNotice({ title: '', notice_type: 'General', content: '', event_date: '', start_time: '', end_time: '' });
      } else {
        alert('Failed to ' + (isEditMode ? 'update' : 'post') + ' announcement');
      }
    } catch (err) {
      console.error('Error posting announcement:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = (announcement) => {
    // Format time values to HH:MM format for input type="time"
    const formatTimeForInput = (timeStr) => {
      if (!timeStr) return '';
      // If it's already in HH:MM format, return as is
      if (timeStr.length === 5 && timeStr.includes(':')) return timeStr;
      // If it's in HH:MM:SS format, truncate to HH:MM
      if (timeStr.length >= 5) return timeStr.substring(0, 5);
      return '';
    };

    setNewNotice({
      title: announcement.title,
      notice_type: announcement.type,
      content: announcement.desc,
      event_date: announcement.event_date || '',
      start_time: formatTimeForInput(announcement.start_time),
      end_time: formatTimeForInput(announcement.end_time)
    });
    setEditingId(announcement.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (announcementId) => {
    setDeletingId(announcementId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await announcementsAPI.delete(deletingId);
      if (response.success) {
        await fetchAnnouncements();
        setDeleteConfirmOpen(false);
        setDeletingId(null);
      } else {
        alert('Failed to delete announcement');
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Update':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <Megaphone className="text-red-800" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Announcements & Updates
            </h2>
          </div>
          {([1,2].includes(Number(localStorage.getItem('userRoleId')))) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-800 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
            >
              <Plus size={16} /> Create Announcement
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Latest notices from Barangay Nangka
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No announcements yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((item, index) => (
              <div
                key={item.id}
                className={`${index === 0 ? 'md:col-span-2' : ''} bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    {item.icon}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">
                        {item.title}
                      </h3>
                      {([1,2].includes(Number(localStorage.getItem('userRoleId')))) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar size={12} />
                      {item.date}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {item.desc}
                    </p>

                    <button
                      onClick={() => setSelectedAnnouncement(item)}
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      View Details ›
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Information & Account Status for PWD users */}
      {Number(localStorage.getItem('userRoleId')) >= 3 && (
        <div className="mt-6">
          {pwdLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
              <p className="text-gray-600">Loading personal information...</p>
            </div>
          ) : pwdInfo ? (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">


              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="text-lg font-semibold text-gray-800">{pwdInfo?.formattedId || localStorage.getItem('username')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-semibold text-gray-800">{pwdInfo?.fullName || localStorage.getItem('displayName') || (localStorage.getItem('username') || '').toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="text-lg font-semibold text-gray-800 capitalize">PWD</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${pwdInfo?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-gray-700">{pwdInfo?.isActive ? 'Account Active' : 'Account Inactive'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">Login Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">Session Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : pwdError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <p className="text-yellow-800 mb-2">Failed to load personal information.</p>
              <p className="text-sm text-gray-600">If the problem persists, please contact admin.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <p className="text-gray-600">No personal information available.</p>
            </div>
          )}
        </div>
      )}

      {/* ===============================
          POST NEW NOTICE MODAL
          =============================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto my-auto overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#800000] p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare size={20} className="shrink-0" />
                <span className="font-bold tracking-wider text-sm truncate">
                  {isEditMode ? 'EDIT ANNOUNCEMENT' : 'POST NEW NOTICE'}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/10 p-1 rounded shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-gray-900 mb-2 tracking-widest uppercase">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Community Clean-up Drive"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-black"
                  value={newNotice.title}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-900 mb-2 tracking-widest uppercase">
                  Notice Type
                </label>
                <div className="flex gap-2">
                  {['General', 'Update', 'Emergency'].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setNewNotice({ ...newNotice, notice_type: type })
                      }
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg border ${
                        newNotice.notice_type === type
                          ? 'bg-[#800000] border-[#800000] text-white'
                          : 'bg-white border-slate-200 text-gray-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-900 mb-2 tracking-widest uppercase">
                  Event Date
                </label>
                <div className="relative">
                  <input
                    ref={dateRef}
                    type="date"
                    className="w-full pr-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-black"
                    value={newNotice.event_date}
                    onChange={(e) =>
                      setNewNotice({ ...newNotice, event_date: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (dateRef.current?.showPicker) dateRef.current.showPicker();
                      else dateRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 z-10"
                    aria-label="Open date picker"
                  >
                    <Calendar size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-900 mb-2 tracking-widest uppercase">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      ref={startRef}
                      type="time"
                      className="w-full pr-10 p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black"
                      value={newNotice.start_time}
                      onChange={(e) =>
                        setNewNotice({ ...newNotice, start_time: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (startRef.current?.showPicker) startRef.current.showPicker();
                        else startRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 z-10"
                      aria-label="Open time picker"
                    >
                      <Clock size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-900 mb-2 tracking-widest uppercase">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      ref={endRef}
                      type="time"
                      className="w-full pr-10 p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black"
                      value={newNotice.end_time}
                      onChange={(e) =>
                        setNewNotice({ ...newNotice, end_time: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (endRef.current?.showPicker) endRef.current.showPicker();
                        else endRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 z-10"
                      aria-label="Open time picker"
                    >
                      <Clock size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-900 mb-2 tracking-widest uppercase">
                  Full Content / Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Provide detailed information here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none text-black"
                  value={newNotice.content}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, content: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 sm:space-y-3 pt-2">
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className="w-full py-3 sm:py-4 bg-[#800000] text-white font-bold rounded-xl disabled:opacity-50 text-sm sm:text-base"
                >
                  {posting ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update Announcement' : 'Post Announcement')}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingId(null);
                    setNewNotice({ title: '', notice_type: 'General', content: '', event_date: '', start_time: '', end_time: '' });
                  }}
                  className="w-full py-2 text-gray-900 font-bold text-[10px] sm:text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===============================
          VIEW DETAILS MODAL (WITH TYPE)
          =============================== */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Increased width from max-w-lg to max-w-2xl */}
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#800000] p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold tracking-wide text-sm">
                ANNOUNCEMENT DETAILS
              </h3>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="hover:bg-white/10 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Added max-height and overflow-y-auto to handle long content */}
            <div className="p-8 space-y-4 overflow-y-auto max-h-[75vh]">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedAnnouncement.title}
              </h2>

              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {selectedAnnouncement.date}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${getTypeStyle(
                    selectedAnnouncement.type
                  )}`}
                >
                  {selectedAnnouncement.type}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {selectedAnnouncement.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===============================
          DELETE CONFIRMATION MODAL
          =============================== */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-red-50 p-6 border-b border-red-200">
              <h3 className="text-lg font-bold text-red-800">
                Delete Announcement?
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this announcement? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
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
