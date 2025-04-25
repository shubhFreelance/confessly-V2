import { Router } from 'express';
import { reactToConfession } from '../controllers/confessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Add reaction to confession
router.post('/:confessionId', authenticate, reactToConfession);

export default router; 