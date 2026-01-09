import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
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
    const response = await API.get("/pwd-users/me");
    return response.data;
  },

  /**
   * Get own disabilities
   */
  getOwnDisabilities: async () => {
    const response = await API.get("/pwd-users/me/disabilities");
    return response.data;
  },

  /**
   * Get own claims/benefits status
   */
  getOwnClaimsStatus: async () => {
    const response = await API.get("/pwd-users/me/claims");
    return response.data;
  },

  /**
   * Verify PWD registration
   */
  verifyRegistration: async (verificationData) => {
    const response = await API.post(
      "/pwd-users/verify-registration",
      verificationData
    );
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
    const response = await API.get(`/pwd/${pwdId}`);
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
 * Analytics API
 */
export const analyticsAPI = {
  getOverview: async () => {
    const response = await API.get('/analytics/overview');
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
