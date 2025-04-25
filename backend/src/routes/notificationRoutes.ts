import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get user notifications
router.get('/', authenticate, getNotifications);

// Mark notification as read
router.put('/:notificationId/read', authenticate, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', authenticate, markAllAsRead);

// Delete notification
router.delete('/:notificationId', authenticate, deleteNotification);

export default router; 