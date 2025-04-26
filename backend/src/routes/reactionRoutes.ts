import express from 'express';
import { auth } from '../middleware/auth';
import { addReaction, removeReaction } from '../controllers/reactionController';

const router = express.Router();

// Protected routes
router.post('/:confessionId', auth, addReaction);
router.delete('/:confessionId', auth, removeReaction);

export default router; 