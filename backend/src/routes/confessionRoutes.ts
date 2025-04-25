import { Router } from 'express';
import {
  createConfession,
  getConfession,
  getConfessions,
  deleteConfession,
  addReaction
} from '../controllers/confessionController';
import { authenticate } from '../middleware/auth';
import { confessionValidation } from '../middleware/validation.js';

const router = Router();

// Create a new confession
router.post('/', authenticate, confessionValidation, createConfession);

// Get all confessions
router.get('/', getConfessions);

// Get a specific confession
router.get('/:id', getConfession);

// Delete a confession
router.delete('/:id', authenticate, deleteConfession);

// Add reaction to a confession
router.post('/:id/reactions', authenticate, addReaction);

export default router; 