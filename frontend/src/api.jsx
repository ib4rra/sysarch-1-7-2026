import axios from "axios"; 

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Add JWT token to headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle token refresh or redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API Calls
 */
export const authAPI = {
  /**
   * Staff/Admin/Super Admin Login
   * @param {string} username - Username
   * @param {string} password - Password
   */
  staffLogin: async (username, password) => {
    const response = await API.post("/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  /**
   * PWD User Login
   * @param {string} pwd_id - PWD ID
   * @param {string} surname - Surname
   */
  pwdLogin: async (pwd_id, surname) => {
    const response = await API.post("/auth/pwd-login", {
      pwd_id,
      surname,
    });
    return response.data;
  },

  /**
   * Create Admin/Staff Account (Super Admin Only)
   * @param {object} adminData - { username, email, password, role_id }
   */
  createAdmin: async (adminData) => {
    const response = await API.post("/auth/create-admin", adminData);
    return response.data;
  },

  /**
   * Create PWD User Account (Super Admin/Admin Only)
   * @param {object} pwdData - PWD user data
   */
  createPwdUser: async (pwdData) => {
    const response = await API.post("/auth/create-pwd-user", pwdData);
    return response.data;
  },

  /**
   * Refresh JWT Token
   * @param {string} refreshToken - Refresh token from localStorage
   */
  refreshToken: async (refreshToken) => {
    const response = await API.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },

  /**
   * Logout (Optional - for cleanup on backend)
   */
  logout: async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
};

/**
 * PWD User API Calls
 */
export const pwdUserAPI = {
  /**
   * Get own PWD record
   */
  getOwnRecord: async () => {
    const response = await API.get("/pwd-user/me");
    return response.data;
  },

  /**
   * Get own disabilities
   */
  getOwnDisabilities: async () => {
    const response = await API.get("/pwd-user/disabilities");
    return response.data;
  },

  /**
   * Get own claims/benefits status
   */
  getOwnClaimsStatus: async () => {
    const response = await API.get("/pwd-user/claims");
    return response.data;
  },

  /**
   * Verify PWD registration
   */
  verifyRegistration: async (verificationData) => {
    const response = await API.post(
      "/pwd-user/verify",
      verificationData
    );
    return response.data;
  },

  /**
   * Change own account password
   * @param {object} payload - { currentPassword, newPassword, confirmPassword }
   */
  changePassword: async (payload) => {
    const response = await API.post('/user/change-password', payload);
    return response.data;
  },
};

/**
 * Admin PWD endpoints
 */
export const pwdAdminAPI = {
  getRegistrants: async (page = 1, limit = 50) => {
    const response = await API.get(`/pwd?page=${page}&limit=${limit}`);
    return response.data;
  },
  getRegistrantById: async (pwdId) => {
    // Use the new verification endpoint for ID verification
    const response = await API.get(`/pwd/verify/${pwdId}`);
    return response.data;
  },
  // Fetch detailed registrant record by numeric or formatted id
  getRegistrantDetails: async (pwdId) => {
    const response = await API.get(`/pwd/${pwdId}`);
    return response.data;
  },
  // Generate and store QR image for a PWD on the server (uploads/qr) and update DB
  generateRegistrantQr: async (pwdId) => {
    const response = await API.post(`/pwd/${pwdId}/qr/generate`);
    return response.data;
  },
  createRegistrant: async (payload) => {
    const response = await API.post('/pwd', payload);
    return response.data;
  },
  updateRegistrant: async (pwdId, payload) => {
    const response = await API.put(`/pwd/${pwdId}`, payload);
    return response.data;
  },
  deleteRegistrant: async (pwdId) => {
    const response = await API.delete(`/pwd/${pwdId}`);
    return response.data;
  }
};

/**
 * Disability API Calls
 */
export const disabilityAPI = {
  getDisabilityTypes: async () => {
    const response = await API.get('/disability/types');
    return response.data;
  },
  getPwdDisabilities: async (pwdId) => {
    const response = await API.get(`/disability/pwd/${pwdId}`);
    return response.data;
  },
  addDisabilityRecord: async (pwdId, payload) => {
    const response = await API.post(`/disability/pwd/${pwdId}`, payload);
    return response.data;
  },
  updateDisabilityRecord: async (recordId, payload) => {
    const response = await API.put(`/disability/record/${recordId}`, payload);
    return response.data;
  },
  deleteDisabilityRecord: async (recordId) => {
    const response = await API.delete(`/disability/record/${recordId}`);
    return response.data;
  }
};

/**
 * Settings & Admin API
 */
export const settingsAPI = {
  getInterface: async () => {
    const response = await API.get('/admin/interface');
    return response.data;
  },
  saveInterface: async (data) => {
    const response = await API.put('/admin/interface', data);
    return response.data;
  },
  getLogs: async (page = 1) => {
    // Use the correct endpoint and handle data
    const response = await API.get(`/admin/logs?page=${page}&limit=10`);
    // Some APIs wrap data in { success, data }, some return array directly
    if (Array.isArray(response.data)) return { success: true, data: response.data };
    return response.data;
  },
  getStaff: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },
  downloadBackup: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/backup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backup error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'nangka_mis_backup.sql';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Backup downloaded successfully' };
    } catch (error) {
      console.error('Backup download error:', error);
      return { success: false, message: error.message || 'Failed to download backup' };
    }
  }
};

/**
 * Analytics API
 */
export const analyticsAPI = {
  getOverview: async () => {
    const response = await API.get('/analytics/overview');
    return response.data;
  }
};

/**
 * Announcements API
 */
export const announcementsAPI = {
  /**
   * Get all active announcements
   */
  getAll: async () => {
    const response = await API.get('/announcements');
    return response.data;
  },

  /**
   * Get announcement by ID
   */
  getById: async (announcementId) => {
    const response = await API.get(`/announcements/${announcementId}`);
    return response.data;
  },

  /**
   * Get announcements by type
   */
  getByType: async (type) => {
    const response = await API.get(`/announcements/type/${type}`);
    return response.data;
  },

  /**
   * Create new announcement (Admin only)
   */
  create: async (announcementData) => {
    const response = await API.post('/announcements', announcementData);
    return response.data;
  },

  /**
   * Update announcement (Admin only)
   */
  update: async (announcementId, updateData) => {
    const response = await API.put(`/announcements/${announcementId}`, updateData);
    return response.data;
  },

  /**
   * Delete/Deactivate announcement (Admin only)
   */
  delete: async (announcementId) => {
    const response = await API.delete(`/announcements/${announcementId}`);
    return response.data;
  }
};

/**
 * Health Check
 */
export const checkHealth = async () => {
  try {
    const response = await API.get("/health");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
};

export default API;
