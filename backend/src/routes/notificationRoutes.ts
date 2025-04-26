import express from 'express';
import { auth } from '../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController';

const router = express.Router();

// Get user notifications
router.get('/', auth, getNotifications);

// Mark notification as read
router.put('/:notificationId/read', auth, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', auth, markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, deleteNotification);

export default router; 