import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireProvider } from '../middleware/role.middleware.js';
import { User } from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * POST /api/v1/providers/enable-capability
 * Allows an existing requester to become a provider on the same account
 */
router.post(
  '/enable-capability',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user.roles.includes('provider')) {
      user.roles.push('provider');
      await user.save();
    }

    return sendSuccess(
      res,
      200,
      'Provider capability enabled on your account successfully',
      {
        user: user.toSafeObject(),
      }
    );
  })
);

/**
 * GET /api/v1/providers/dashboard-preview
 * Requires provider role
 */
router.get(
  '/dashboard-preview',
  authMiddleware,
  requireProvider,
  asyncHandler(async (req, res) => {
    return sendSuccess(res, 200, 'Provider dashboard capability verified', {
      providerId: req.user._id,
      displayName: req.user.name,
      status: 'ACTIVE_PROVIDER',
      capabilities: ['offer_services', 'share_resources', 'accept_bookings'],
    });
  })
);

export default router;
