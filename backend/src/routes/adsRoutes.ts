import { Router } from 'express';
import {
  createPromotion,
  getActivePromotions,
  getBannerAds,
  updatePromotion,
  deletePromotion
} from '../controllers/adsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Get banner ads for free users
router.get('/banners', getBannerAds);

// Promotion management (admin only)
router.post('/promotions', authenticate, authorize('admin'), createPromotion);
router.get('/promotions', getActivePromotions);
router.put('/promotions/:id', authenticate, authorize('admin'), updatePromotion);
router.delete('/promotions/:id', authenticate, authorize('admin'), deletePromotion);

export default router; 