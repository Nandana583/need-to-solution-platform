import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { User } from '../models/User.js';
import { Need } from '../models/Need.js';
import { Booking } from '../models/Booking.js';
import { Resource } from '../models/Resource.js';
import { Service } from '../models/Service.js';
import { Category } from '../models/Category.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// Apply auth + requireAdmin to all admin routes
router.use(authMiddleware, requireAdmin);

/**
 * GET /api/v1/admin/users - List all users
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    const safeUsers = users.map((u) => u.toSafeObject());

    return sendSuccess(res, 200, 'All registered users retrieved', {
      total: safeUsers.length,
      users: safeUsers,
    });
  })
);

/**
 * GET /api/v1/admin/stats - Comprehensive platform stats
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ roles: 'provider' });
    const totalRequesters = await User.countDocuments({ roles: 'requester' });
    const totalAdmins = await User.countDocuments({ roles: 'admin' });
    const totalNeeds = await Need.countDocuments();
    const activeNeeds = await Need.countDocuments({ status: { $in: ['CREATED', 'MATCHING', 'REQUESTED', 'IN_PROGRESS'] } });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'COMPLETED' });
    const totalResources = await Resource.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalCategories = await Category.countDocuments();

    return sendSuccess(res, 200, 'Admin platform statistics', {
      stats: {
        totalUsers,
        totalProviders,
        totalRequesters,
        totalAdmins,
        totalNeeds,
        activeNeeds,
        totalBookings,
        completedBookings,
        totalResources,
        totalServices,
        totalCategories,
      },
    });
  })
);

/**
 * PUT /api/v1/admin/users/:id/roles - Update user roles (Admin only)
 */
router.put(
  '/users/:id/roles',
  asyncHandler(async (req, res) => {
    const { roles } = req.body;
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new AppError('Roles must be a non-empty array', 400, 'INVALID_ROLES');
    }

    const validRoles = ['requester', 'provider', 'admin'];
    const isValid = roles.every((r) => validRoles.includes(r));
    if (!isValid) {
      throw new AppError(
        'Invalid role in array. Allowed: requester, provider, admin',
        400,
        'INVALID_ROLES'
      );
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { roles } },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, 200, 'User roles updated successfully', {
      user: user.toSafeObject(),
    });
  })
);

/**
 * PUT /api/v1/admin/users/:id/status - Activate or deactivate user
 */
router.put(
  '/users/:id/status',
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean', 400, 'INVALID_STATUS');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive } },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, 200, `User account ${isActive ? 'activated' : 'deactivated'}`, {
      user: user.toSafeObject(),
    });
  })
);

export default router;
