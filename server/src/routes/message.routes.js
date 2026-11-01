import express from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { messagingRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', messagingRateLimiter, sendMessage);
router.get('/', getMessages);

export default router;
