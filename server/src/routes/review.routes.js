import express from 'express';
import { createReview, getUserReviews } from '../controllers/review.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/user/:userId', getUserReviews);
router.post('/', authMiddleware, createReview);

export default router;
