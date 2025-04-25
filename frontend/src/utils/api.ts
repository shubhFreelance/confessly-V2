import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add a request interceptor to include the auth token
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// User endpoints
export const users = {
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (userId: string, data: any) =>
    api.put(`/users/${userId}`, data),
  getLeaderboard: (collegeName: string, period: string = 'weekly') =>
    api.get(`/users/leaderboard/${collegeName}`, { params: { period } }),
};

// Confession endpoints
export const confessions = {
  create: (data: { content: string; recipientUsername: string }) =>
    api.post('/confessions', data),
  getUserConfessions: (userId: string, page: number = 1, limit: number = 10) =>
    api.get(`/confessions/user/${userId}`, { params: { page, limit } }),
  react: (confessionId: string, reaction: string) =>
    api.post(`/confessions/${confessionId}/react`, { reaction }),
  report: (confessionId: string, reason: string) =>
    api.post(`/confessions/${confessionId}/report`, { reason }),
  getTrending: (collegeName: string, timeframe: string = '24h') =>
    api.get(`/confessions/trending/${collegeName}`, {
      params: { timeframe },
    }),
};

// Subscription endpoints
export const subscriptions = {
  create: (planId: string) =>
    api.post('/subscriptions', { planId }),
  cancel: () => api.post('/subscriptions/cancel'),
  getPlans: () => api.get('/subscriptions/plans'),
};

interface UpdateProfileData {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const updateUserProfile = async (data: UpdateProfileData) => {
  return await api.put('/users/profile', data);
};

export const deleteAccount = async () => {
  return await api.delete('/users/account');
};

export default api; 