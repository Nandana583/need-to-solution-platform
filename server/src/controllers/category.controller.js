import { CategoryService } from '../services/category.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = {};
  if (type) filter.type = { $in: [type, 'both'] };

  const categories = await CategoryService.getAll(filter);
  return sendSuccess(res, 200, 'Categories retrieved successfully', { categories });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await CategoryService.getById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  return sendSuccess(res, 200, 'Category details retrieved', { category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await CategoryService.create(req.body);
  return sendSuccess(res, 201, 'Category created successfully', { category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await CategoryService.update(req.params.id, req.body);
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  return sendSuccess(res, 200, 'Category updated successfully', { category });
});
