import { Router } from 'express';
import { getCollegeLeaderboard } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get college leaderboard
router.get('/college/:collegeName', authenticate, getCollegeLeaderboard);

export default router; 