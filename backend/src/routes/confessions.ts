import express from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import { confessionLimiter } from '../middleware/rateLimiter';
import {
  createConfession,
  getConfessions,
  reactToConfession,
  reportConfession
} from '../controllers/confessionController';

const router = express.Router();

// Validation middleware
const confessionValidation = [
  body('content')
    .notEmpty()
    .withMessage('Confession content is required')
    .isLength({ max: 1000 })
    .withMessage('Confession must not exceed 1000 characters'),
  body('collegeName')
    .notEmpty()
    .withMessage('College name is required'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean value')
];

const reactionValidation = [
  body('reaction')
    .notEmpty()
    .withMessage('Reaction is required')
    .isIn(['❤️', '😂', '😮', '😢', '😡'])
    .withMessage('Invalid reaction type')
];

const reportValidation = [
  body('reason')
    .notEmpty()
    .withMessage('Report reason is required')
    .isLength({ max: 200 })
    .withMessage('Report reason must not exceed 200 characters')
];

// Routes
router.post('/', auth, confessionLimiter, confessionValidation, createConfession);
router.get('/', getConfessions);
router.post('/:confessionId/react', auth, reactionValidation, reactToConfession);
router.post('/:confessionId/report', auth, reportValidation, reportConfession);

export default router; 