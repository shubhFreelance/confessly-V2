import { Router } from 'express';
import { getLeaderboard, getStats, updateRankings } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import {
  trackUserBehavior,
  getUserBehaviorAnalytics,
  getContentPerformanceAnalytics,
  getSystemPerformanceMetrics,
  getAnalyticsDashboard
} from '../controllers/analyticsController';

const router = Router();

// Get college leaderboard
router.get('/leaderboard', getLeaderboard);

// Get college statistics
router.get('/stats', authenticate, getStats);

// Update user rankings (admin only)
router.post('/update-rankings', authenticate, authorize('admin'), updateRankings);

// User behavior tracking
router.post('/track', authenticate, trackUserBehavior);
router.get('/user-behavior', authenticate, authorize('admin'), getUserBehaviorAnalytics);

// Content performance
router.get('/content-performance', authenticate, authorize('admin'), getContentPerformanceAnalytics);

// System performance
router.get('/system-performance', authenticate, authorize('admin'), getSystemPerformanceMetrics);

// Analytics dashboard
router.get('/dashboard', authenticate, authorize('admin'), getAnalyticsDashboard);

export default router; 