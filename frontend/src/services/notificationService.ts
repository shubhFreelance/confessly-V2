import axios from 'axios';
import { API_URL } from '../config';

interface Notification {
  id: string;
  type: 'confession' | 'comment' | 'reaction' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface GetNotificationsParams {
  page: number;
  limit: number;
}

interface GetNotificationsResponse {
  data: Notification[];
  hasMore: boolean;
  total: number;
}

const notificationService = {
  // Get notifications
  getNotifications: async (params: GetNotificationsParams): Promise<GetNotificationsResponse> => {
    const response = await axios.get(`${API_URL}/notifications`, { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await axios.put(`${API_URL}/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await axios.put(`${API_URL}/notifications/read-all`);
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await axios.delete(`${API_URL}/notifications/${notificationId}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get(`${API_URL}/notifications/unread-count`);
    return response.data.count;
  },
};

export default notificationService; 