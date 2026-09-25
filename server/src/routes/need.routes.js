import express from 'express';
import {
  createNeed,
  getMyNeeds,
  getNeedById,
  matchNeedMatches,
  cancelNeed,
  getCommunityNeedsFeed,
} from '../controllers/need.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public / community explore
router.get('/community', getCommunityNeedsFeed);

// Protected routes
router.post('/', authMiddleware, createNeed);
router.get('/me', authMiddleware, getMyNeeds);
router.get('/:id', authMiddleware, getNeedById);
router.post('/:id/match', authMiddleware, matchNeedMatches);
router.put('/:id/cancel', authMiddleware, cancelNeed);

export default router;
