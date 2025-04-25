import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getReportedConfessions,
  updateReportedConfession,
  getCollegeUsers,
  getCollegeContent,
  getCollegeStats
} from '../controllers/adminController';

const router = Router();

// Admin only routes
router.get('/reported-confessions', authenticate, authorize('admin'), getReportedConfessions);
router.put('/reported-confessions/:reportId', authenticate, authorize('admin'), updateReportedConfession);
router.get('/college-users', authenticate, authorize('admin'), getCollegeUsers);
router.get('/college-content', authenticate, authorize('admin'), getCollegeContent);
router.get('/college-stats', authenticate, authorize('admin'), getCollegeStats);

export default router; 