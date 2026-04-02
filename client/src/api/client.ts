import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Clients
export const clientsAPI = {
  list: () => api.get('/clients'),
  get: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// Invoices
export const invoicesAPI = {
  list: (params?: any) => api.get('/invoices', { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/invoices/${id}/status`, { status }),
  downloadPDF: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

// Expenses
export const expensesAPI = {
  list: (params?: any) => api.get('/expenses', { params }),
  get: (id: string) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Reports
export const reportsAPI = {
  revenue: (params?: any) => api.get('/reports/revenue', { params }),
  expenses: (params?: any) => api.get('/reports/expenses', { params }),
  taxSummary: (params?: any) => api.get('/reports/tax-summary', { params }),
  exportCSV: (params?: any) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

// Projects (Freelancer)
export const projectsAPI = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Time Entries (Freelancer)
export const timeEntriesAPI = {
  list: (params?: any) => api.get('/time-entries', { params }),
  create: (data: any) => api.post('/time-entries', data),
  update: (id: string, data: any) => api.put(`/time-entries/${id}`, data),
  delete: (id: string) => api.delete(`/time-entries/${id}`),
};

// Campaigns (Influencer)
export const campaignsAPI = {
  list: () => api.get('/campaigns'),
  get: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post('/campaigns', data),
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
};

export default api;
