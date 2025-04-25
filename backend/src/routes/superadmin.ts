import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  manageSubscriptionTiers,
  getSystemAnalytics,
  manageUsers,
  overrideAdminDecision,
  manageSystemSettings,
  manageReports,
  manageAnnouncements,
  modifyUserData,
  manageSystemNotifications
} from '../controllers/superadminController';

const router = Router();

// Subscription management
router.put('/subscriptions/:userId', authenticate, authorize('admin'), manageSubscriptionTiers);

// System analytics
router.get('/analytics', authenticate, authorize('admin'), getSystemAnalytics);

// User management
router.get('/users', authenticate, authorize('admin'), manageUsers);
router.put('/users/:userId', authenticate, authorize('admin'), modifyUserData);

// Report management
router.get('/reports', authenticate, authorize('admin'), manageReports);
router.put('/reports/:reportId', authenticate, authorize('admin'), overrideAdminDecision);

// System settings
router.put('/settings', authenticate, authorize('admin'), manageSystemSettings);

// Announcements
router.post('/announcements', authenticate, authorize('admin'), manageAnnouncements);

// System notifications
router.post('/notifications', authenticate, authorize('admin'), manageSystemNotifications);

export default router; 