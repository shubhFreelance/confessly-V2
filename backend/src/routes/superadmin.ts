import express from 'express';
import { auth, authorize } from '../middleware/auth';
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
import { createSuperAdmin } from '../controllers/userController';

const router = express.Router();

// Subscription management
router.put('/subscriptions/:userId', auth, authorize('admin'), manageSubscriptionTiers);

// System analytics
router.get('/analytics', auth, authorize('admin'), getSystemAnalytics);

// User management
router.get('/users', auth, authorize('admin'), manageUsers);
router.put('/users/:userId', auth, authorize('admin'), modifyUserData);

// Report management
router.get('/reports', auth, authorize('admin'), manageReports);
router.put('/reports/:reportId', auth, authorize('admin'), overrideAdminDecision);

// System settings
router.put('/settings', auth, authorize('admin'), manageSystemSettings);

// Announcements
router.post('/announcements', auth, authorize('admin'), manageAnnouncements);

// System notifications
router.post('/notifications', auth, authorize('admin'), manageSystemNotifications);

router.post('/create', auth, authorize('admin'), createSuperAdmin);

export default router; 