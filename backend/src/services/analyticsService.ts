import { User, IUser } from '../models/User';
import { Confession } from '../models/Confession';
import { Comment } from '../models/Comment';
import { Like } from '../models/Like';
import { logger } from '../config/logger';

interface LeaderboardEntry {
  userId: string;
  username: string;
  collegeName: string;
  totalConfessions: number;
  totalLikes: number;
  totalComments: number;
  profileVisits: number;
  score: number;
}

interface CollegeStats {
  collegeName: string;
  totalUsers: number;
  totalConfessions: number;
  totalLikes: number;
  totalComments: number;
  activeUsers: number;
}

export const calculateUserScore = (user: IUser): number => {
  const { stats } = user;
  return (
    stats.totalConfessions * 10 +
    stats.totalLikes * 5 +
    stats.profileVisits * 2
  );
};

export const updateUserRankings = async () => {
  try {
    const users = await User.find({})
      .sort({ 'stats.totalLikes': -1 })
      .lean();

    for (let i = 0; i < users.length; i++) {
      await User.findByIdAndUpdate(users[i]._id, {
        'stats.weeklyRank': i + 1
      });
    }

    logger.info('User rankings updated successfully');
  } catch (error) {
    logger.error('Error updating user rankings:', error);
  }
};

export const getCollegeLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const users = await User.find({})
      .select('username collegeName stats')
      .lean();

    const leaderboard: { [key: string]: LeaderboardEntry } = {};

    // Aggregate stats by college
    for (const user of users) {
      const collegeName = user.collegeName;
      if (!leaderboard[collegeName]) {
        leaderboard[collegeName] = {
          userId: user._id.toString(),
          username: user.username,
          collegeName,
          totalConfessions: 0,
          totalLikes: 0,
          totalComments: 0,
          profileVisits: 0,
          score: 0
        };
      }

      leaderboard[collegeName].totalConfessions += user.stats.totalConfessions;
      leaderboard[collegeName].totalLikes += user.stats.totalLikes;
      leaderboard[collegeName].profileVisits += user.stats.profileVisits;
      leaderboard[collegeName].score = calculateUserScore(user as IUser);
    }

    return Object.values(leaderboard).sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting college leaderboard:', error);
    throw error;
  }
};

export const getCollegeStats = async (): Promise<CollegeStats[]> => {
  try {
    const colleges = await User.distinct('collegeName');
    const stats: CollegeStats[] = [];

    for (const college of colleges) {
      const users = await User.find({ collegeName: college });
      const confessions = await Confession.find({ collegeName: college });
      const comments = await Comment.find({ collegeName: college });
      const likes = await Like.find({ collegeName: college });

      const activeUsers = users.filter(user => {
        const lastActivity = user.stats.activityLog[user.stats.activityLog.length - 1]?.timestamp;
        if (!lastActivity) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActivity > thirtyDaysAgo;
      }).length;

      stats.push({
        collegeName: college,
        totalUsers: users.length,
        totalConfessions: confessions.length,
        totalLikes: likes.length,
        totalComments: comments.length,
        activeUsers
      });
    }

    return stats;
  } catch (error) {
    console.error('Error getting college stats:', error);
    throw error;
  }
};

export const trackUserActivity = async (userId: string, activityType: 'confession' | 'like' | 'comment' | 'visit') => {
  try {
    const update: any = {};
    
    switch (activityType) {
      case 'confession':
        update.$inc = { 'stats.totalConfessions': 1 };
        break;
      case 'like':
        update.$inc = { 'stats.totalLikes': 1 };
        break;
      case 'comment':
        update.$inc = { 'stats.totalComments': 1 };
        break;
      case 'visit':
        update.$inc = { 'stats.profileVisits': 1 };
        break;
    }

    await User.findByIdAndUpdate(userId, update);
  } catch (error) {
    console.error('Error tracking user activity:', error);
    throw error;
  }
};

export class AnalyticsService {
  static async trackUserActivity(userId: string, action: string, data?: any) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalActions': 1 },
        $push: {
          'stats.activityLog': {
            action,
            data,
            timestamp: new Date()
          }
        }
      });
    } catch (error) {
      logger.error('Error tracking user activity:', error);
    }
  }

  static async trackConfessionView(confessionId: string) {
    try {
      await Confession.findByIdAndUpdate(confessionId, {
        $inc: { views: 1 }
      });
    } catch (error) {
      logger.error('Error tracking confession view:', error);
    }
  }

  static async trackConfessionLike(confessionId: string, userId: string) {
    try {
      await Confession.findByIdAndUpdate(confessionId, {
        $inc: { likes: 1 },
        $addToSet: { likedBy: userId }
      });
    } catch (error) {
      logger.error('Error tracking confession like:', error);
    }
  }

  static async trackConfessionComment(confessionId: string) {
    try {
      await Confession.findByIdAndUpdate(confessionId, {
        $inc: { comments: 1 }
      });
    } catch (error) {
      logger.error('Error tracking confession comment:', error);
    }
  }

  static async getSystemMetrics() {
    try {
      const totalUsers = await User.countDocuments();
      const totalConfessions = await Confession.countDocuments();
      const activeUsers = await User.countDocuments({
        'stats.lastActive': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const popularConfessions = await Confession.find()
        .sort({ likes: -1 })
        .limit(5)
        .populate('author', 'username');

      const trendingConfessions = await Confession.find()
        .sort({ views: -1 })
        .limit(5)
        .populate('author', 'username');

      return {
        totalUsers,
        totalConfessions,
        activeUsers,
        popularConfessions,
        trendingConfessions
      };
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      throw error;
    }
  }

  static async generateUserReport(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const confessions = await Confession.find({ author: userId });
      const totalLikes = confessions.reduce((sum, conf) => sum + conf.likes, 0);
      const totalComments = confessions.reduce((sum, conf) => sum + conf.comments.length, 0);

      return {
        username: user.username,
        totalConfessions: confessions.length,
        totalLikes,
        totalComments,
        weeklyRank: user.stats.weeklyRank,
        monthlyRank: user.stats.monthlyRank,
        profileVisits: user.stats.profileVisits,
        activityLog: user.stats.activityLog
      };
    } catch (error) {
      logger.error('Error generating user report:', error);
      throw error;
    }
  }
}

export const getUserAnalytics = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  return {
    profileVisits: user.stats.profileVisits,
    totalConfessions: user.stats.totalConfessions,
    totalLikes: user.stats.totalLikes,
    weeklyRank: user.stats.weeklyRank,
    monthlyRank: user.stats.monthlyRank
  };
};

export const getCollegeAnalytics = async (collegeName: string) => {
  const users = await User.find({ collegeName });
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.stats.activityLog.length > 0).length,
    totalConfessions: users.reduce((sum, u) => sum + u.stats.totalConfessions, 0),
    totalLikes: users.reduce((sum, u) => sum + u.stats.totalLikes, 0)
  };
};

export const getPlatformAnalytics = async () => {
  const [totalUsers, totalConfessions, activeUsers] = await Promise.all([
    User.countDocuments(),
    Confession.countDocuments(),
    User.countDocuments({ 'stats.lastActive': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);
  
  return { totalUsers, totalConfessions, activeUsers };
}; 