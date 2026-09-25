import express from 'express';
import {
  createResource,
  getPublicResources,
  getResourceById,
  getMyResources,
  updateResource,
  deleteResource,
} from '../controllers/resource.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public browse routes
router.get('/public', getPublicResources);
router.get('/public/:id', getResourceById);

// Authenticated user resource management
router.post('/', authMiddleware, createResource);
router.get('/me', authMiddleware, getMyResources);
router.put('/:id', authMiddleware, updateResource);
router.delete('/:id', authMiddleware, deleteResource);

export default router;
