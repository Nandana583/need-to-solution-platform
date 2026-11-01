import express from 'express';
import { logCall, getCallHistory, updateCall } from '../controllers/call.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/', logCall);
router.get('/', getCallHistory);
router.put('/:id', updateCall);

export default router;
