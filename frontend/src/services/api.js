import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for model inference
});

// Attach JWT token from localStorage to all requests if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for standard error extraction
const handleError = (error, defaultMsg) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.request) {
    return 'Unable to connect to the backend server (http://127.0.0.1:8000). Please ensure FastAPI is running.';
  }
  return error.message || defaultMsg;
};

/* =========================================================================
   CORE SKILL GAP ANALYSIS
   ========================================================================= */

export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Health check failed.') };
  }
};

export const analyzeSkills = async ({ resumeFile, resumeText, jobDescription, targetRole }) => {
  try {
    const formData = new FormData();
    if (resumeFile) formData.append('resume_file', resumeFile);
    if (resumeText && resumeText.trim()) formData.append('resume_text', resumeText.trim());
    formData.append('job_description', jobDescription.trim());
    formData.append('target_role', targetRole?.trim() || 'Software Developer');

    const response = await apiClient.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Analysis failed.') };
  }
};

/* =========================================================================
   AUTHENTICATION
   ========================================================================= */

export const loginUser = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Login failed.') };
  }
};

export const signupUser = async ({ email, password, full_name }) => {
  try {
    const response = await apiClient.post('/auth/signup', { email, password, full_name });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Signup failed.') };
  }
};

export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return { success: true, data: response.data.user };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch current user.') };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

/* =========================================================================
   USER PROFILE & HISTORY
   ========================================================================= */

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/profile');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch profile.') };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/profile', profileData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to update profile.') };
  }
};

export const getAnalysisHistory = async () => {
  try {
    const response = await apiClient.get('/profile/history');
    return { success: true, data: response.data.history };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch history.') };
  }
};

/* =========================================================================
   ADMIN PANEL
   ========================================================================= */

export const getAdminStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch admin stats.') };
  }
};

export const getAdminUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users');
    return { success: true, data: response.data.users };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch users.') };
  }
};

export const updateAdminUserRole = async (userId, data) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}/role`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to update user role.') };
  }
};

export const getAdminAnalyses = async () => {
  try {
    const response = await apiClient.get('/admin/analyses');
    return { success: true, data: response.data.analyses };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch analyses logs.') };
  }
};

export const getAdminSettings = async () => {
  try {
    const response = await apiClient.get('/admin/settings');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch settings.') };
  }
};

export const updateAdminSettings = async (thresholds) => {
  try {
    const response = await apiClient.put('/admin/settings', thresholds);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to update settings.') };
  }
};

/* =========================================================================
   PAYMENT & SUBSCRIPTIONS
   ========================================================================= */

export const getPaymentPlans = async () => {
  try {
    const response = await apiClient.get('/payment/plans');
    return { success: true, data: response.data.plans };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch plans.') };
  }
};

export const checkoutSubscription = async (checkoutData) => {
  try {
    const response = await apiClient.post('/payment/checkout', checkoutData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Payment checkout failed.') };
  }
};

export const getPaymentHistory = async () => {
  try {
    const response = await apiClient.get('/payment/history');
    return { success: true, data: response.data.payments };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch payments.') };
  }
};

/* =========================================================================
   AI COACH CHATBOT
   ========================================================================= */

export const sendChatMessage = async ({ message, analysisContext }) => {
  try {
    const response = await apiClient.post('/chat/message', {
      message,
      analysis_context: analysisContext,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to send message.') };
  }
};

export const getChatHistory = async () => {
  try {
    const response = await apiClient.get('/chat/history');
    return { success: true, data: response.data.messages };
  } catch (error) {
    return { success: false, error: handleError(error, 'Failed to fetch chat history.') };
  }
};
