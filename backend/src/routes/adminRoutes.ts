import { Router } from 'express';
import { 
  blockUser, 
  unblockUser,
  getReportedConfessions,
  getBlockedUsers,
  getColleges,
  getAdminStats
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin only routes
router.post('/users/:userId/block', authenticate, authorize('admin'), blockUser);
router.post('/users/:userId/unblock', authenticate, authorize('admin'), unblockUser);
router.get('/reported-confessions', authenticate, authorize('admin'), getReportedConfessions);
router.get('/blocked-users', authenticate, authorize('admin'), getBlockedUsers);
router.get('/colleges', authenticate, authorize('admin'), getColleges);
router.get('/stats', authenticate, authorize('admin'), getAdminStats);

export default router; 