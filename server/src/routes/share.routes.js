import express from 'express';
import {
  createShareRequest,
  getMySentShareRequests,
  getMyIncomingShareRequests,
  getShareRequestById,
  acceptShareRequest,
  rejectShareRequest,
  completeShareRequest,
} from '../controllers/share.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createShareRequest);
router.get('/sent', getMySentShareRequests);
router.get('/incoming', getMyIncomingShareRequests);
router.get('/:id', getShareRequestById);
router.put('/:id/accept', acceptShareRequest);
router.put('/:id/reject', rejectShareRequest);
router.put('/:id/complete', completeShareRequest);

export default router;
