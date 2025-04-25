import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
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

// Authentication API
export const authAPI = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string, collegeName: string) =>
    api.post('/auth/register', { username, email, password, collegeName }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getCollegeLeaderboard: (collegeName: string, period: 'weekly' | 'monthly') =>
    api.get(`/users/leaderboard/${collegeName}?period=${period}`),
};

// Confession API
export const confessionAPI = {
  createConfession: (content: string, isAnonymous: boolean) =>
    api.post('/confessions', { content, isAnonymous }),
  getConfessions: (page = 1, limit = 10) =>
    api.get(`/confessions?page=${page}&limit=${limit}`),
  getConfessionById: (id: string) =>
    api.get(`/confessions/${id}`),
  deleteConfession: (id: string) =>
    api.delete(`/confessions/${id}`),
  reportConfession: async (id: string, reason: string) => {
    return axios.post(`${BASE_URL}/confessions/${id}/report`, { reason });
  },
};

// Comments API
export const commentAPI = {
  addComment: (confessionId: string, content: string, isAnonymous: boolean) =>
    api.post(`/confessions/${confessionId}/comments`, { content, isAnonymous }),
  getComments: (confessionId: string, page = 1) =>
    api.get(`/confessions/${confessionId}/comments?page=${page}`),
  deleteComment: (confessionId: string, commentId: string) =>
    api.delete(`/confessions/${confessionId}/comments/${commentId}`),
};

// Reactions API
export const reactionAPI = {
  addReaction: (confessionId: string, type: 'like' | 'dislike') =>
    api.post(`/confessions/${confessionId}/reactions`, { type }),
  removeReaction: (confessionId: string) =>
    api.delete(`/confessions/${confessionId}/reactions`),
};

export default api; 