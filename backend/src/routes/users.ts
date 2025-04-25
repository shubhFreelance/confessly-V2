import { Router } from 'express';
import { auth as authenticate } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  blockUser,
  unblockUser,
  getBlockedUsers
} from '../controllers/userController';

const router = Router();

// User profile routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.delete('/account', authenticate, deleteAccount);

// Admin routes
router.post('/:userId/block', authenticate, blockUser);
router.post('/:userId/unblock', authenticate, unblockUser);
router.get('/blocked', authenticate, getBlockedUsers);

export default router; 