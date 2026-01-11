import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  Calendar,
  Zap,
  Info,
  X,
} from 'lucide-react';
import { announcementsAPI, pwdUserAPI, pwdAdminAPI } from '../../api';

const UserHomeView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // PWD personal info
  const [pwdInfo, setPwdInfo] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const pollRef = useRef(null);

  // Fetch announcements and PWD info on component mount
  useEffect(() => {
    fetchAnnouncements();
    fetchPwdInfo();
    pollRef.current = setInterval(fetchPwdInfo, 15000);
    const onVisible = () => { if (document.visibilityState === 'visible') fetchPwdInfo(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(pollRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const fetchPwdInfo = async () => {
    setPwdError(null);
    setPwdLoading(true);
    try {
      const resp = await pwdUserAPI.getOwnRecord();
      const info = resp?.data?.personal_info || resp?.personal_info || resp?.data || resp || null;
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
        setPwdError(null);
      } else {
        setPwdError(err?.response?.data?.message || err?.message || 'Could not fetch personal information');
      }
    } finally {
      setPwdLoading(false);
    }
  };

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

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl">
            <div className="bg-[#800000] p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold tracking-wider text-sm">ANNOUNCEMENT DETAILS</span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="hover:bg-white/10 p-1 rounded shrink-0"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedAnnouncement.title}</h3>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                {selectedAnnouncement.date}
              </div>

              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getTypeStyle(selectedAnnouncement.type)}`}>
                {selectedAnnouncement.type}
              </div>

              <p className="text-gray-700 leading-relaxed">{selectedAnnouncement.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHomeView;
