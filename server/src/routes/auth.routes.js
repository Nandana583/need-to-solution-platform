import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
  changePassword,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/auth.validators.js';

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, validate(registerValidator), register);
router.post('/login', authRateLimiter, validate(loginValidator), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, validate(updateProfileValidator), updateMe);
router.put(
  '/me/password',
  authMiddleware,
  validate(changePasswordValidator),
  changePassword
);

export default router;
