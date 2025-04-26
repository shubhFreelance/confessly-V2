import express from 'express';
import { auth } from '../middleware/auth';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  reportComment
} from '../controllers/commentController';

const router = express.Router();

// Create a new comment
router.post('/', auth, createComment);

// Get comments for a confession
router.get('/:confessionId', auth, getComments);

// Update a comment
router.put('/:commentId', auth, updateComment);

// Delete a comment
router.delete('/:commentId', auth, deleteComment);

// Report a comment
router.post('/:id/report', auth, reportComment);

export default router; 