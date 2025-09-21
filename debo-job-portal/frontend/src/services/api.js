import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

// Jobs Service
export const jobsService = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  searchJobs: async (query) => {
    const response = await api.get('/jobs/search', { params: { q: query } });
    return response.data;
  },

  getJobApplicants: async (id) => {
    const response = await api.get(`/jobs/${id}/applicants`);
    return response.data;
  },

  applyForJob: async (jobId, applicationData) => {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },
};

// Applications Service
export const applicationsService = {
  getApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  getApplication: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  createApplication: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  updateApplication: async (id, applicationData) => {
    const response = await api.put(`/applications/${id}`, applicationData);
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

// Profile Service
export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/profile/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Admin Service
export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getAllApplications: async () => {
    const response = await api.get('/admin/applications');
    return response.data;
  },

  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/admin/applications/${id}/status`, { status });
    return response.data;
  },

  classifyIntern: async (userId, classification) => {
    const response = await api.put(`/admin/users/${userId}/classify`, { classification });
    return response.data;
  },

  generateReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },
};

// Email Service
export const emailService = {
  sendNotification: async (emailData) => {
    const response = await api.post('/email/send', emailData);
    return response.data;
  },

  sendBulkNotification: async (emailData) => {
    const response = await api.post('/email/bulk-send', emailData);
    return response.data;
  },

  getEmailTemplates: async () => {
    const response = await api.get('/email/templates');
    return response.data;
  },
};

export default api;
