import { Router } from 'express';
import {
  updateTheme,
  togglePrivateVault,
  addToPrivateVault,
  removeFromPrivateVault,
  purchaseBoostPack
} from '../controllers/premiumController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Theme customization
router.put('/theme', authenticate, updateTheme);

// Private vault operations
router.put('/private-vault/toggle', authenticate, togglePrivateVault);
router.post('/private-vault/:confessionId', authenticate, addToPrivateVault);
router.delete('/private-vault/:confessionId', authenticate, removeFromPrivateVault);

// Boost pack purchase
router.post('/boost-pack', authenticate, purchaseBoostPack);

export default router; 