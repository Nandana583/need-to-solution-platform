import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin protected routes
router.post('/', authMiddleware, requireAdmin, createCategory);
router.put('/:id', authMiddleware, requireAdmin, updateCategory);

export default router;
