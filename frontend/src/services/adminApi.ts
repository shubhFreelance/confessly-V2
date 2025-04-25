import axios from 'axios';
import { AdminUser, AdminStats, AdminReport } from '../types/admin';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const adminApi = {
  // User Management
  getUsers: () => axios.get<AdminUser[]>(`${BASE_URL}/admin/users`),
  updateUserRole: (userId: string, role: 'admin' | 'moderator') => 
    axios.put(`${BASE_URL}/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => 
    axios.delete(`${BASE_URL}/admin/users/${userId}`),

  // Statistics
  getStats: () => axios.get<AdminStats>(`${BASE_URL}/admin/stats`),

  // Reports
  getReports: () => axios.get<AdminReport[]>(`${BASE_URL}/admin/reports`),
  updateReportStatus: (reportId: string, status: 'resolved' | 'dismissed') =>
    axios.put(`${BASE_URL}/admin/reports/${reportId}`, { status }),
};

export default adminApi; 