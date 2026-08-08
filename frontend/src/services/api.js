import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT Auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const componentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/components', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/components/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/components', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/components/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/components/${id}`);
    return response.data;
  }
};

export const configService = {
  getAll: async (params = {}) => {
    const response = await api.get('/configurations', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/configurations/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/configurations', data);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/configurations/${id}/status`, { status });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/configurations/${id}`);
    return response.data;
  }
};

export default api;
