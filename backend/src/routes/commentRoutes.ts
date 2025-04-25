import { Router } from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  reportComment
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create a new comment
router.post('/', authenticate, createComment);

// Get comments for a confession
router.get('/:confessionId', getComments);

// Update a comment
router.put('/:id', authenticate, updateComment);

// Delete a comment
router.delete('/:id', authenticate, deleteComment);

// Report a comment
router.post('/:id/report', authenticate, reportComment);

export default router; 