import express from 'express';
import {
  createConfession,
  getConfession,
  getConfessions,
  deleteConfession,
  addReaction,
  updateConfession
} from '../controllers/confessionController';
import { auth } from '../middleware/auth';
import { confessionValidation } from '../middleware/validation.js';

const router = express.Router();

// Create a new confession
router.post('/', auth, confessionValidation, createConfession);

// Get all confessions
router.get('/', auth, getConfessions);

// Get a specific confession
router.get('/:id', getConfession);

// Delete a confession
router.delete('/:id', auth, deleteConfession);

// Add reaction to a confession
router.post('/:id/reactions', auth, addReaction);

// Update a confession
router.put('/:id', auth, updateConfession);

export default router; 