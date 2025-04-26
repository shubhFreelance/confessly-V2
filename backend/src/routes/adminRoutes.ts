import express from 'express';
import { 
  blockUser, 
  unblockUser,
  getReportedConfessions,
  getBlockedUsers,
  getColleges,
  getAdminStats
} from '../controllers/userController';
import { auth, authorize } from '../middleware/auth';
import { updateReportedConfession, getCollegeUsers, getCollegeContent, getCollegeStats } from '../controllers/adminController';

const router = express.Router();

// Admin only routes
router.post('/users/:userId/block', auth, authorize('admin'), blockUser);
router.post('/users/:userId/unblock', auth, authorize('admin'), unblockUser);
router.get('/reported-confessions', auth, authorize('admin'), getReportedConfessions);
router.put('/reported-confessions/:reportId', auth, authorize('admin'), updateReportedConfession);
router.get('/blocked-users', auth, authorize('admin'), getBlockedUsers);
router.get('/colleges', auth, authorize('admin'), getColleges);
router.get('/stats', auth, authorize('admin'), getAdminStats);
router.get('/college-users', auth, authorize('admin'), getCollegeUsers);
router.get('/college-content', auth, authorize('admin'), getCollegeContent);
router.get('/college-stats', auth, authorize('admin'), getCollegeStats);

export default router; 