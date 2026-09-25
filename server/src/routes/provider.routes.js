import express from 'express';
import {
  enableProviderCapability,
  getMyProviderProfile,
  updateMyProviderProfile,
  getPublicProviders,
  getProviderById,
  createService,
  getMyServices,
  updateService,
  deleteService,
} from '../controllers/provider.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireProvider } from '../middleware/role.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicProviders);
router.get('/public/:id', getProviderById);

// Enable capability (any authenticated user)
router.post('/enable-capability', authMiddleware, enableProviderCapability);

// Dashboard preview (requires provider role)
router.get('/dashboard-preview', authMiddleware, requireProvider, (req, res) => {
  return sendSuccess(res, 200, 'Provider dashboard capability verified', {
    providerId: req.user._id,
    displayName: req.user.name,
    status: 'ACTIVE_PROVIDER',
    capabilities: ['offer_services', 'share_resources', 'accept_bookings'],
  });
});

// Provider profile management (requires provider role)
router.get('/profile/me', authMiddleware, requireProvider, getMyProviderProfile);
router.put('/profile/me', authMiddleware, requireProvider, updateMyProviderProfile);

// Provider services CRUD
router.post('/services', authMiddleware, requireProvider, createService);
router.get('/services/me', authMiddleware, requireProvider, getMyServices);
router.put('/services/:id', authMiddleware, requireProvider, updateService);
router.delete('/services/:id', authMiddleware, requireProvider, deleteService);

export default router;
