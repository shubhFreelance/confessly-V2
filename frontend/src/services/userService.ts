import axios from 'axios';
import { API_URL } from '../config';

const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/users/profile`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: {
    username?: string;
    email?: string;
    college?: string;
    bio?: string;
    avatar?: string;
  }) => {
    const response = await axios.put(`${API_URL}/users/profile`, data);
    return response.data;
  },

  // Get user's confessions
  getUserConfessions: async (userId: string, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/users/${userId}/confessions`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user's comments
  getUserComments: async (userId: string, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/users/${userId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user's reactions
  getUserReactions: async (userId: string, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/users/${userId}/reactions`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user's notifications
  getUserNotifications: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/users/notifications`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string) => {
    const response = await axios.put(`${API_URL}/users/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    const response = await axios.put(`${API_URL}/users/notifications/read-all`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    const response = await axios.delete(`${API_URL}/users/notifications/${notificationId}`);
    return response.data;
  },

  // Get user's private vault
  getPrivateVault: async () => {
    const response = await axios.get(`${API_URL}/users/private-vault`);
    return response.data;
  },

  // Add confession to private vault
  addToPrivateVault: async (confessionId: string) => {
    const response = await axios.post(`${API_URL}/users/private-vault`, { confessionId });
    return response.data;
  },

  // Remove confession from private vault
  removeFromPrivateVault: async (confessionId: string) => {
    const response = await axios.delete(`${API_URL}/users/private-vault/${confessionId}`);
    return response.data;
  },

  // Get user's premium status
  getPremiumStatus: async () => {
    const response = await axios.get(`${API_URL}/users/premium-status`);
    return response.data;
  },

  // Upgrade to premium
  upgradeToPremium: async (paymentDetails: any) => {
    const response = await axios.post(`${API_URL}/users/upgrade-premium`, paymentDetails);
    return response.data;
  },

  // Cancel premium subscription
  cancelPremium: async () => {
    const response = await axios.post(`${API_URL}/users/cancel-premium`);
    return response.data;
  },
};

export default userService; 