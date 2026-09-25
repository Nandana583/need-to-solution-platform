import { Resource } from '../models/Resource.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const createResource = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    resourceType,
    condition,
    shareType,
    metadata,
    locationLabel,
    location,
  } = req.body;

  if (!title || !description || !category) {
    throw new AppError('Title, description, and category are required', 400, 'MISSING_FIELDS');
  }

  const resource = await Resource.create({
    owner: req.user._id,
    category,
    title,
    description,
    resourceType: resourceType || 'book',
    condition: condition || 'GOOD',
    shareType: shareType || 'LEND',
    metadata: metadata || {},
    locationLabel: locationLabel || req.user.locationLabel || '',
    location: location || req.user.location,
    availabilityStatus: 'AVAILABLE',
    isActive: true,
  });

  await resource.populate(['category', 'owner']);

  return sendSuccess(res, 201, 'Resource listed successfully', { resource });
});

export const getPublicResources = asyncHandler(async (req, res) => {
  const { category, resourceType, shareType, search, availability } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (resourceType) query.resourceType = resourceType;
  if (shareType) query.shareType = shareType;
  if (availability) {
    query.availabilityStatus = availability;
  } else {
    query.availabilityStatus = { $in: ['AVAILABLE', 'SHARED'] };
  }

  let resources = await Resource.find(query)
    .populate('owner', 'name email phone profileImage location locationLabel')
    .populate('category', 'name slug icon')
    .sort({ createdAt: -1 })
    .limit(50);

  if (search) {
    const s = search.toLowerCase();
    resources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.metadata?.author?.toLowerCase().includes(s) ||
        r.metadata?.subject?.toLowerCase().includes(s)
    );
  }

  return sendSuccess(res, 200, 'Resources retrieved successfully', {
    total: resources.length,
    resources,
  });
});

export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)
    .populate('owner', 'name email phone profileImage location locationLabel createdAt')
    .populate('category', 'name slug icon');

  if (!resource) {
    throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }

  return sendSuccess(res, 200, 'Resource details retrieved', { resource });
});

export const getMyResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ owner: req.user._id })
    .populate('category', 'name slug icon')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'User resources retrieved', { resources });
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!resource) {
    throw new AppError('Resource not found or unauthorized', 404, 'RESOURCE_NOT_FOUND');
  }

  Object.assign(resource, req.body);
  await resource.save();
  await resource.populate(['category', 'owner']);

  return sendSuccess(res, 200, 'Resource updated successfully', { resource });
});

export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!resource) {
    throw new AppError('Resource not found or unauthorized', 404, 'RESOURCE_NOT_FOUND');
  }

  return sendSuccess(res, 200, 'Resource removed successfully');
});
