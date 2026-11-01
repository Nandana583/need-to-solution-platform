import express from 'express';
import {
  fileReport,
  getMyBlocks,
  unblockUser,
  getAdminReports,
  reviewReport,
} from '../controllers/abuse.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// User routes
router.post('/report', apiRateLimiter, fileReport);
router.get('/blocks', getMyBlocks);
router.delete('/blocks/:userId', unblockUser);

// Admin routes
router.get('/admin', requireAdmin, getAdminReports);
router.put('/admin/:reportId', requireAdmin, reviewReport);

export default router;
