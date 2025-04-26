import { Router } from 'express';
import { auth, authorize } from '../middleware/auth';
import {
  getReportedConfessions,
  updateReportedConfession,
  getCollegeUsers,
  getCollegeContent,
  getCollegeStats
} from '../controllers/adminController';

const router = Router();

// Admin only routes
router.get('/reported-confessions', auth, authorize('admin'), getReportedConfessions);
router.put('/reported-confessions/:reportId', auth, authorize('admin'), updateReportedConfession);
router.get('/college-users', auth, authorize('admin'), getCollegeUsers);
router.get('/college-content', auth, authorize('admin'), getCollegeContent);
router.get('/college-stats', auth, authorize('admin'), getCollegeStats);

router.get('/users', auth, authorize('admin'), (req, res) => {
  // TODO: Implement get all users
  res.json({ message: 'Get all users' });
});

export default router; 