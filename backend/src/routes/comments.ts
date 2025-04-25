import express from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  reportComment
} from '../controllers/commentController';

const router = express.Router();

// Validation middleware
const commentValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters')
];

const reportValidation = [
  body('reason')
    .notEmpty()
    .withMessage('Report reason is required')
    .isLength({ max: 200 })
    .withMessage('Report reason must not exceed 200 characters')
];

// Routes
router.post('/confession/:confessionId', auth, commentValidation, createComment);
router.get('/confession/:confessionId', getComments);
router.patch('/:commentId', auth, commentValidation, updateComment);
router.delete('/:commentId', auth, deleteComment);
router.post('/:commentId/report', auth, reportValidation, reportComment);

export default router; 