import express from 'express';
import { auth } from '../middleware/auth';
import { getCollegeRankings, getUserRankings } from '../controllers/rankingController';

const router = express.Router();

// Protected routes
router.get('/college', auth, getCollegeRankings);
router.get('/user', auth, getUserRankings);

export default router; 