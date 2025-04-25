import express from 'express';
import { auth } from '../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController';

const router = express.Router();

// Routes
router.get('/', auth, getNotifications);
router.patch('/:notificationId/read', auth, markAsRead);
router.patch('/mark-all-read', auth, markAllAsRead);
router.delete('/:notificationId', auth, deleteNotification);

export default router; 