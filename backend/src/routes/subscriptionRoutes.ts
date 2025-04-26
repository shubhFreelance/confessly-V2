import express from 'express';
import { auth } from '../middleware/auth';
import { getSubscriptionPlans, subscribe, unsubscribe } from '../controllers/subscriptionController';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes
router.post('/subscribe', auth, subscribe);
router.post('/unsubscribe', auth, unsubscribe);

export default router; 