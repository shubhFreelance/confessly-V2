import mongoose, { Document, Schema } from 'mongoose';

// User Behavior Tracking
export interface IUserBehavior extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'view' | 'like' | 'comment' | 'share' | 'search' | 'login' | 'logout';
  targetType: 'confession' | 'comment' | 'profile' | 'search' | 'system';
  targetId?: mongoose.Types.ObjectId;
  metadata: {
    page?: string;
    searchQuery?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    ip?: string;
    location?: string;
    duration?: number;
  };
  timestamp: Date;
}

// Content Performance Metrics
export interface IContentPerformance extends Document {
  contentId: mongoose.Types.ObjectId;
  contentType: 'confession' | 'comment';
  metrics: {
    views: number;
    uniqueViews: number;
    likes: number;
    comments: number;
    shares: number;
    averageViewDuration: number;
    engagementRate: number;
  };
  dailyStats: [{
    date: Date;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }];
  lastUpdated: Date;
}

// System Performance Metrics
export interface ISystemPerformance extends Document {
  timestamp: Date;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    databaseConnections: number;
    cacheHitRate: number;
  };
  alerts: [{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }];
}

// Create schemas
const userBehaviorSchema = new Schema<IUserBehavior>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'like', 'comment', 'share', 'search', 'login', 'logout'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['confession', 'comment', 'profile', 'search', 'system'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId
  },
  metadata: {
    page: String,
    searchQuery: String,
    deviceType: String,
    browser: String,
    os: String,
    ip: String,
    location: String,
    duration: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const contentPerformanceSchema = new Schema<IContentPerformance>({
  contentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  contentType: {
    type: String,
    enum: ['confession', 'comment'],
    required: true
  },
  metrics: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    averageViewDuration: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }
  },
  dailyStats: [{
    date: Date,
    views: Number,
    likes: Number,
    comments: Number,
    shares: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const systemPerformanceSchema = new Schema<ISystemPerformance>({
  timestamp: {
    type: Date,
    default: Date.now
  },
  metrics: {
    cpuUsage: Number,
    memoryUsage: Number,
    activeUsers: Number,
    requestsPerMinute: Number,
    averageResponseTime: Number,
    errorRate: Number,
    databaseConnections: Number,
    cacheHitRate: Number
  },
  alerts: [{
    type: String,
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    timestamp: Date
  }]
});

// Create indexes for efficient querying
userBehaviorSchema.index({ userId: 1, timestamp: -1 });
userBehaviorSchema.index({ action: 1, timestamp: -1 });
userBehaviorSchema.index({ targetType: 1, targetId: 1 });

contentPerformanceSchema.index({ contentId: 1, contentType: 1 });
contentPerformanceSchema.index({ 'metrics.engagementRate': -1 });

systemPerformanceSchema.index({ timestamp: -1 });

// Create models
export const UserBehavior = mongoose.model<IUserBehavior>('UserBehavior', userBehaviorSchema);
export const ContentPerformance = mongoose.model<IContentPerformance>('ContentPerformance', contentPerformanceSchema);
export const SystemPerformance = mongoose.model<ISystemPerformance>('SystemPerformance', systemPerformanceSchema); 