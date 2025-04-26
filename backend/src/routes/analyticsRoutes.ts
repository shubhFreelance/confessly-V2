import express from 'express';
import { auth, authorize } from '../middleware/auth';
import { getUserAnalytics, getCollegeAnalytics, getPlatformAnalytics } from '../controllers/analyticsController';

const router = express.Router();

// User analytics
router.get('/user', auth, getUserAnalytics);

// College analytics (admin only)
router.get('/college', auth, authorize('admin'), getCollegeAnalytics);

// Platform analytics (admin only)
router.get('/platform', auth, authorize('admin'), getPlatformAnalytics);

export default router;