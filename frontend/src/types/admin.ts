export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalConfessions: number;
  reportedConfessions: number;
  activeUsers: number;
}

export interface AdminReport {
  id: string;
  confessionId: string;
  reason: string;
  reportedBy: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
} 