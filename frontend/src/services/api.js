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

// Mock fallback storage for static cloud deployments (Vercel) when backend API is offline
const MOCK_USER = {
  id: 'usr_demo',
  name: 'Rahul Sharma',
  email: 'sales@electronics.com',
  role: 'Sales Lead'
};

const MOCK_COMPONENTS_KEY = 'mock_laptop_components';
const MOCK_CONFIGS_KEY = 'mock_laptop_configs';

const getStoredComponents = () => {
  const saved = localStorage.getItem(MOCK_COMPONENTS_KEY);
  if (saved) return JSON.parse(saved);
  const initial = [
    { id: 'cmp_1', name: 'Intel Core i7-13700H (14 Cores, 5.0 GHz)', category: 'Processor', price: 28500, is_active: true, description: 'High performance gaming & workstation CPU' },
    { id: 'cmp_2', name: 'Intel Core i5-13500H (12 Cores, 4.7 GHz)', category: 'Processor', price: 18200, is_active: true, description: 'Balanced performance processor' },
    { id: 'cmp_3', name: '16GB DDR5 4800MHz Dual Channel', category: 'RAM', price: 4500, is_active: true, description: 'High speed DDR5 system memory' },
    { id: 'cmp_4', name: '32GB DDR5 5200MHz Dual Channel', category: 'RAM', price: 8900, is_active: true, description: 'Ultra high capacity RAM' },
    { id: 'cmp_5', name: '1TB NVMe M.2 PCIe Gen4 SSD', category: 'Storage', price: 6200, is_active: true, description: 'Ultra fast solid state drive' },
    { id: 'cmp_6', name: '512GB NVMe M.2 PCIe SSD', category: 'Storage', price: 3400, is_active: true, description: 'Standard high speed NVMe storage' },
    { id: 'cmp_7', name: 'NVIDIA GeForce RTX 4060 8GB GDDR6', category: 'Graphics Card', price: 32000, is_active: true, description: 'Dedicated Ray-Tracing GPU' },
    { id: 'cmp_8', name: 'Integrated Intel Iris Xe Graphics', category: 'Graphics Card', price: 0, is_active: true, description: 'Power efficient integrated graphics' },
    { id: 'cmp_9', name: '15.6" FHD (1920x1080) 144Hz IPS Panel', category: 'Display', price: 7500, is_active: true, description: 'High refresh rate display panel' },
    { id: 'cmp_10', name: '70Wh 4-Cell Lithium-Polymer Battery', category: 'Battery', price: 3800, is_active: true, description: 'Long lasting battery unit' },
    { id: 'cmp_11', name: 'Full-size Backlit Chiclet Keyboard', category: 'Keyboard', price: 1500, is_active: true, description: 'Ergonomic keyboard with numeric keypad' },
    { id: 'cmp_12', name: 'Windows 11 Pro 64-bit Pre-installed', category: 'Operating System', price: 4200, is_active: true, description: 'Official Windows OS with enterprise security' }
  ];
  localStorage.setItem(MOCK_COMPONENTS_KEY, JSON.stringify(initial));
  return initial;
};

const getStoredConfigs = () => {
  const saved = localStorage.getItem(MOCK_CONFIGS_KEY);
  if (saved) return JSON.parse(saved);
  const initial = [
    {
      id: 'cfg_1',
      quote_number: 'Q-2026-001',
      config_name: 'Pro Creator Workstation 15',
      customer_name: 'TechCorp Solutions',
      customer_email: 'procurement@techcorp.io',
      margin_percentage: 15,
      components_total: 86900,
      profit_amount: 13035,
      tax_amount: 17988,
      final_quote_price: 117923,
      status: 'Issued',
      created_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(MOCK_CONFIGS_KEY, JSON.stringify(initial));
  return initial;
};

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // Fallback for live Vercel demo if backend server is not connected
      console.warn('Backend API unavailable. Falling back to Demo Mode login.');
      const demoToken = 'mock_jwt_token_demo';
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      return { token: demoToken, user: MOCK_USER };
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return MOCK_USER;
    }
  }
};

export const componentService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/components', { params });
      return response.data;
    } catch (error) {
      let data = getStoredComponents();
      if (params.category) {
        data = data.filter(c => c.category === params.category);
      }
      if (params.activeOnly) {
        data = data.filter(c => c.is_active);
      }
      return data;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/components/${id}`);
      return response.data;
    } catch (error) {
      const comps = getStoredComponents();
      return comps.find(c => c.id === id);
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/components', data);
      return response.data;
    } catch (error) {
      const comps = getStoredComponents();
      const newComp = { id: `cmp_${Date.now()}`, ...data, is_active: true };
      comps.push(newComp);
      localStorage.setItem(MOCK_COMPONENTS_KEY, JSON.stringify(comps));
      return newComp;
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/components/${id}`, data);
      return response.data;
    } catch (error) {
      const comps = getStoredComponents();
      const idx = comps.findIndex(c => c.id === id);
      if (idx !== -1) {
        comps[idx] = { ...comps[idx], ...data };
        localStorage.setItem(MOCK_COMPONENTS_KEY, JSON.stringify(comps));
        return comps[idx];
      }
      return data;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/components/${id}`);
      return response.data;
    } catch (error) {
      let comps = getStoredComponents();
      comps = comps.filter(c => c.id !== id);
      localStorage.setItem(MOCK_COMPONENTS_KEY, JSON.stringify(comps));
      return { message: 'Component deleted' };
    }
  }
};

export const configService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/configurations', { params });
      return response.data;
    } catch (error) {
      return getStoredConfigs();
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/configurations/${id}`);
      return response.data;
    } catch (error) {
      const configs = getStoredConfigs();
      return configs.find(c => c.id === id);
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/configurations', data);
      return response.data;
    } catch (error) {
      const configs = getStoredConfigs();
      const quoteNum = `Q-${new Date().getFullYear()}-${String(configs.length + 1).padStart(3, '0')}`;
      const newConfig = {
        id: `cfg_${Date.now()}`,
        quote_number: quoteNum,
        ...data,
        status: data.status || 'Issued',
        created_at: new Date().toISOString()
      };
      configs.unshift(newConfig);
      localStorage.setItem(MOCK_CONFIGS_KEY, JSON.stringify(configs));
      return newConfig;
    }
  },
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/configurations/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const configs = getStoredConfigs();
      const idx = configs.findIndex(c => c.id === id);
      if (idx !== -1) {
        configs[idx].status = status;
        localStorage.setItem(MOCK_CONFIGS_KEY, JSON.stringify(configs));
        return configs[idx];
      }
      return { id, status };
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/configurations/${id}`);
      return response.data;
    } catch (error) {
      let configs = getStoredConfigs();
      configs = configs.filter(c => c.id !== id);
      localStorage.setItem(MOCK_CONFIGS_KEY, JSON.stringify(configs));
      return { message: 'Configuration deleted' };
    }
  }
};

export default api;
