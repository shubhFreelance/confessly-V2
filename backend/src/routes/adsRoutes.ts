import express from 'express';
import {
  createPromotion,
  getActivePromotions,
  getBannerAds,
  updatePromotion,
  deletePromotion
} from '../controllers/adsController';
import { auth, authorize } from '../middleware/auth';

const router = express.Router();

// Get banner ads for free users
router.get('/banners', getBannerAds);

// Promotion management (admin only)
router.post('/promotions', auth, authorize('admin'), createPromotion);
router.get('/promotions', getActivePromotions);
router.put('/promotions/:id', auth, authorize('admin'), updatePromotion);
router.delete('/promotions/:id', auth, authorize('admin'), deletePromotion);

export default router; 