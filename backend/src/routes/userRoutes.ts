import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updateSubscription,
  deleteAccount,
  getConfessionLink,
  getProfileByLink,
  getUserStats,
  getMessageCount
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { userValidation } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', userValidation, register);
router.post('/login', login);
router.get('/confession-link/:username', getConfessionLink);
router.get('/profile/:confessionLink', getProfileByLink);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, userValidation, updateProfile);
router.put('/subscription', authenticate, updateSubscription);
router.delete('/', authenticate, deleteAccount);
router.get('/stats', authenticate, getUserStats);
router.get('/message-count', authenticate, getMessageCount);

export default router; 