import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        return refreshAuthToken(refreshToken)
          .then((newToken) => {
            localStorage.setItem('authToken', newToken);
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api.request(error.config);
          })
          .catch(() => {
            // Refresh failed, logout
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth/callback';
            return Promise.reject(error);
          });
      }
    }
    return Promise.reject(error);
  }
);

async function refreshAuthToken(refreshToken: string): Promise<string> {
  const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
  return response.data.data.token;
}

// Auth API
export const authApi = {
  login: (initData: string) =>
    api.post('/api/auth/telegram', { initData }),
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  me: () =>
    api.get('/api/auth/me'),
};

// User API
export const userApi = {
  getBalances: () =>
    api.get('/api/user/balances'),
  
  getProfile: () =>
    api.get('/api/user/profile'),
  
  getOrders: (params?: { pair?: string; status?: string; limit?: number; offset?: number }) =>
    api.get('/api/user/orders', { params }),
  
  getTransactions: (params?: { type?: string; status?: string; limit?: number; offset?: number }) =>
    api.get('/api/user/transactions', { params }),
  
  getTrades: (params?: { pair?: string; limit?: number; offset?: number }) =>
    api.get('/api/user/trades', { params }),
};

// Order API
export const orderApi = {
  create: (data: { pair: string; side: 'buy' | 'sell'; type: 'market' | 'limit'; price?: string; quantity: string }) =>
    api.post('/api/orders', data),
  
  cancel: (orderId: string) =>
    api.delete(`/api/orders/${orderId}`),
  
  get: (orderId: string) =>
    api.get(`/api/orders/${orderId}`),
};

// Trade API
export const tradeApi = {
  getOrderBook: (pair: string, depth?: number) =>
    api.get(`/api/trades/orderbook/${pair}`, { params: { depth } }),
  
  getRecentTrades: (pair: string, limit?: number) =>
    api.get(`/api/trades/${pair}`, { params: { limit } }),
  
  getPrices: () =>
    api.get('/api/trades/prices'),
  
  getTickers: () =>
    api.get('/api/trades/tickers'),
};

// Wallet API
export const walletApi = {
  getDepositAddress: () =>
    api.post('/api/wallet/deposit/address'),
  
  withdraw: (data: { currency: string; amount: string; address: string; memo?: string }) =>
    api.post('/api/wallet/withdraw', data),
  
  getWhitelist: () =>
    api.get('/api/wallet/whitelist'),
  
  addToWhitelist: (data: { address: string; label?: string }) =>
    api.post('/api/wallet/whitelist', data),
  
  removeFromWhitelist: (id: string) =>
    api.delete(`/api/wallet/whitelist/${id}`),
  
  getHistory: (params?: { type?: string; status?: string; limit?: number; offset?: number }) =>
    api.get('/api/wallet/history', { params }),
};
