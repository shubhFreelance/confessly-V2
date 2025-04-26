import { Request, Response } from 'express';
import { 
  getCollegeLeaderboard, 
  getCollegeStats, 
  updateUserRankings 
} from '../services/analyticsService';
import { auth, adminAuth } from '../middleware/auth';
import { UserBehavior, ContentPerformance, SystemPerformance } from '../models/Analytics';
import { User } from '../models/User';
import { Confession } from '../models/Confession';
import os from 'os';
import { ExportService } from '../services/exportService';
import path from 'path';
import * as AnalyticsService from '../services/analyticsService';

interface AuthRequest extends Request {
  user?: any;
}

// Get college leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaderboard = await getCollegeLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Get college statistics
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Only admins can access all college stats
    if (user.isAdmin) {
      const stats = await getCollegeStats();
      return res.json(stats);
    }

    // Regular users can only see their college stats
    const collegeStats = await getCollegeStats();
    const userCollegeStats = collegeStats.find(
      stat => stat.collegeName === user.collegeName
    );

    if (!userCollegeStats) {
      return res.status(404).json({ message: 'College stats not found' });
    }

    res.json(userCollegeStats);
  } catch (error) {
    console.error('Error getting college stats:', error);
    res.status(500).json({ message: 'Error fetching college statistics' });
  }
};

// Update user rankings (admin only)
export const updateRankings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await updateUserRankings();
    res.json({ message: 'User rankings updated successfully' });
  } catch (error) {
    console.error('Error updating rankings:', error);
    res.status(500).json({ message: 'Error updating user rankings' });
  }
};

// Track user behavior
export const trackUserBehavior = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { action, targetType, targetId, metadata } = req.body;

    const behavior = new UserBehavior({
      userId: user._id,
      action,
      targetType,
      targetId,
      metadata: {
        ...metadata,
        ip: req.ip,
        browser: req.headers['user-agent']
      }
    });

    await behavior.save();
    res.status(201).json(behavior);
  } catch (error) {
    console.error('Error tracking user behavior:', error);
    res.status(500).json({ message: 'Error tracking user behavior' });
  }
};

// Get user behavior analytics
export const getUserBehaviorAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId, startDate, endDate, action } = req.query;
    const query: any = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const behaviors = await UserBehavior.find(query)
      .populate('userId', 'username')
      .sort({ timestamp: -1 });

    // Aggregate behavior data
    const actionCounts = behaviors.reduce((acc: any, behavior) => {
      acc[behavior.action] = (acc[behavior.action] || 0) + 1;
      return acc;
    }, {});

    res.json({
      behaviors,
      actionCounts,
      totalActions: behaviors.length
    });
  } catch (error) {
    console.error('Error getting user behavior analytics:', error);
    res.status(500).json({ message: 'Error fetching user behavior analytics' });
  }
};

// Get content performance analytics
export const getContentPerformanceAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { contentType, startDate, endDate } = req.query;
    const query: any = {};

    if (contentType) query.contentType = contentType;
    if (startDate || endDate) {
      query.lastUpdated = {};
      if (startDate) query.lastUpdated.$gte = new Date(startDate as string);
      if (endDate) query.lastUpdated.$lte = new Date(endDate as string);
    }

    const performances = await ContentPerformance.find(query)
      .sort({ 'metrics.engagementRate': -1 });

    // Calculate aggregate metrics
    const aggregateMetrics = performances.reduce((acc: any, performance) => {
      acc.totalViews += performance.metrics.views;
      acc.totalLikes += performance.metrics.likes;
      acc.totalComments += performance.metrics.comments;
      acc.totalShares += performance.metrics.shares;
      return acc;
    }, {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0
    });

    res.json({
      performances,
      aggregateMetrics,
      totalContent: performances.length
    });
  } catch (error) {
    console.error('Error getting content performance analytics:', error);
    res.status(500).json({ message: 'Error fetching content performance analytics' });
  }
};

// Get system performance metrics
export const getSystemPerformanceMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get current system metrics
    const cpuUsage = os.loadavg()[0];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Get active users count
    const activeUsers = await User.countDocuments({
      'stats.lastActive': { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    // Create system performance record
    const performance = new SystemPerformance({
      metrics: {
        cpuUsage,
        memoryUsage,
        activeUsers,
        requestsPerMinute: 0, // Implement request counting
        averageResponseTime: 0, // Implement response time tracking
        errorRate: 0, // Implement error rate tracking
        databaseConnections: 0, // Implement DB connection tracking
        cacheHitRate: 0 // Implement cache hit rate tracking
      }
    });

    await performance.save();

    // Get historical performance data
    const historicalData = await SystemPerformance.find()
      .sort({ timestamp: -1 })
      .limit(24); // Last 24 records

    res.json({
      currentMetrics: performance.metrics,
      historicalData,
      alerts: performance.alerts
    });
  } catch (error) {
    console.error('Error getting system performance metrics:', error);
    res.status(500).json({ message: 'Error fetching system performance metrics' });
  }
};

// Get detailed analytics dashboard
export const getAnalyticsDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const [
      userStats,
      contentStats,
      systemStats,
      recentBehaviors,
      topContent
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [
                  { $gte: ['$stats.lastActive', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      // Content statistics
      Confession.aggregate([
        {
          $group: {
            _id: null,
            totalConfessions: { $sum: 1 },
            totalLikes: { $sum: '$stats.likes' },
            totalComments: { $sum: '$stats.comments' }
          }
        }
      ]),
      // System statistics
      SystemPerformance.findOne().sort({ timestamp: -1 }),
      // Recent user behaviors
      UserBehavior.find()
        .populate('userId', 'username')
        .sort({ timestamp: -1 })
        .limit(10),
      // Top performing content
      ContentPerformance.find()
        .sort({ 'metrics.engagementRate': -1 })
        .limit(5)
    ]);

    res.json({
      userStats: userStats[0] || {},
      contentStats: contentStats[0] || {},
      systemStats: systemStats?.metrics || {},
      recentBehaviors,
      topContent
    });
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({ message: 'Error fetching analytics dashboard' });
  }
};

// Export analytics data
export const exportAnalyticsData = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { format = 'csv', type = 'all', startDate, endDate } = req.query;

    const options = {
      format: format as 'csv' | 'excel' | 'json',
      type: type as 'user-behavior' | 'content-performance' | 'system-performance' | 'all',
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };

    let filePath;
    if (options.type === 'all') {
      const result = await ExportService.exportAll(options);
      filePath = result.userBehavior; // Return the first file path
    } else {
      switch (options.type) {
        case 'user-behavior':
          filePath = await ExportService.exportUserBehavior(options);
          break;
        case 'content-performance':
          filePath = await ExportService.exportContentPerformance(options);
          break;
        case 'system-performance':
          filePath = await ExportService.exportSystemPerformance(options);
          break;
        default:
          throw new Error('Invalid export type');
      }
    }

    // Send file to client
    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error sending file' });
      }
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ message: 'Error exporting analytics data' });
  }
};

// User analytics
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const analytics = await AnalyticsService.getUserAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Error fetching user analytics' });
  }
};

// College analytics
export const getCollegeAnalytics = async (req: Request, res: Response) => {
  try {
    const { collegeName } = req.user;
    const analytics = await AnalyticsService.getCollegeAnalytics(collegeName);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting college analytics:', error);
    res.status(500).json({ message: 'Error fetching college analytics' });
  }
};

// Platform analytics
export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await AnalyticsService.getPlatformAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting platform analytics:', error);
    res.status(500).json({ message: 'Error fetching platform analytics' });
  }
}; 