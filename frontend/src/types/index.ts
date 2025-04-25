export interface User {
  id: string;
  username: string;
  collegeName: string;
  confessionLink: string;
  subscription: {
    type: 'free' | 'silver' | 'gold' | 'platinum';
    expiresAt: Date;
  };
  confessionsReceived: number;
  likes: number;
  profileVisits: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Confession {
  id: string;
  recipient: User['id'];
  content: string;
  likes: number;
  reactions: {
    [key: string]: number; // emoji: count
  };
  isHidden: boolean;
  isReported: boolean;
  reportCount: number;
  reportReasons: string[];
  collegeName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxConfessions: number;
  collegeAccess: number;
  stripePriceId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  collegeName: string;
  likes: number;
  confessionsReceived: number;
  rank: number;
} 