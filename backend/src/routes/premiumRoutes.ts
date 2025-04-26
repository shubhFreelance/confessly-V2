import express from 'express';
import {
  updateTheme,
  togglePrivateVault,
  addToPrivateVault,
  removeFromPrivateVault,
  purchaseBoostPack,
  getPremiumFeatures,
  upgradeToPremium,
  cancelPremium
} from '../controllers/premiumController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Theme customization
router.put('/theme', auth, updateTheme);

// Private vault operations
router.put('/private-vault/toggle', auth, togglePrivateVault);
router.post('/private-vault/:confessionId', auth, addToPrivateVault);
router.delete('/private-vault/:confessionId', auth, removeFromPrivateVault);

// Boost pack purchase
router.post('/boost-pack', auth, purchaseBoostPack);

// Protected routes
router.get('/features', auth, getPremiumFeatures);
router.post('/upgrade', auth, upgradeToPremium);
router.post('/cancel', auth, cancelPremium);

export default router; 