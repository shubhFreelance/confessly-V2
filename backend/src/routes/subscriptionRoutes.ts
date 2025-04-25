import { Router } from 'express';
import { updateSubscription } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Update user subscription
router.put('/', authenticate, updateSubscription);

export default router; 