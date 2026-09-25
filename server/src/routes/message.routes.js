import express from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', sendMessage);
router.get('/', getMessages);

export default router;
