import { ProviderProfile } from '../models/ProviderProfile.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

/**
 * Enable provider role on current user account (Additive)
 */
export const enableProviderCapability = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.roles.includes('provider')) {
    user.roles.push('provider');
    await user.save();
  }

  // Ensure a ProviderProfile document exists
  let profile = await ProviderProfile.findOne({ user: user._id });
  if (!profile) {
    profile = await ProviderProfile.create({
      user: user._id,
      bio: '',
      skills: [],
      availabilityStatus: 'AVAILABLE_NOW',
    });
  }

  return sendSuccess(
    res,
    200,
    'Provider capability enabled on your account successfully',
    {
      user: user.toSafeObject(),
      profile,
    }
  );
});

/**
 * Get current user's provider profile & services
 */
export const getMyProviderProfile = asyncHandler(async (req, res) => {
  let profile = await ProviderProfile.findOne({ user: req.user._id })
    .populate('categories', 'name slug icon')
    .populate('user', 'name email phone profileImage location locationLabel');

  if (!profile) {
    profile = await ProviderProfile.create({
      user: req.user._id,
      bio: '',
      skills: [],
    });
  }

  const services = await Service.find({ provider: req.user._id }).populate('category', 'name slug icon');

  return sendSuccess(res, 200, 'Provider profile retrieved', {
    profile,
    services,
  });
});

/**
 * Update current user's provider profile
 */
export const updateMyProviderProfile = asyncHandler(async (req, res) => {
  const {
    bio,
    skills,
    categories,
    experienceYears,
    serviceArea,
    availabilityStatus,
    workingHours,
    isActive,
  } = req.body;

  let profile = await ProviderProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = new ProviderProfile({ user: req.user._id });
  }

  if (bio !== undefined) profile.bio = bio;
  if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : [];
  if (categories !== undefined) profile.categories = categories;
  if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
  if (serviceArea !== undefined) profile.serviceArea = serviceArea;
  if (availabilityStatus !== undefined) profile.availabilityStatus = availabilityStatus;
  if (workingHours !== undefined) profile.workingHours = workingHours;
  if (isActive !== undefined) profile.isActive = Boolean(isActive);

  await profile.save();
  await profile.populate(['categories', 'user']);

  return sendSuccess(res, 200, 'Provider profile updated successfully', {
    profile,
  });
});

/**
 * List public providers with filters
 */
export const getPublicProviders = asyncHandler(async (req, res) => {
  const { category, search, availability } = req.query;

  const query = { isActive: true };
  if (category) {
    query.categories = category;
  }
  if (availability) {
    query.availabilityStatus = availability;
  }

  const profiles = await ProviderProfile.find(query)
    .populate('user', 'name email phone profileImage location locationLabel')
    .populate('categories', 'name slug icon')
    .sort({ rating: -1, completedBookingsCount: -1 })
    .limit(50);

  // If text search is provided, filter in memory by name/skills/bio
  let filtered = profiles;
  if (search) {
    const s = search.toLowerCase();
    filtered = profiles.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(s) ||
        p.bio?.toLowerCase().includes(s) ||
        p.skills?.some((skill) => skill.toLowerCase().includes(s))
    );
  }

  return sendSuccess(res, 200, 'Providers retrieved successfully', {
    total: filtered.length,
    providers: filtered,
  });
});

/**
 * Get detailed provider profile by user/profile ID
 */
export const getProviderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try finding by user ID or profile ID
  let profile = await ProviderProfile.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { user: id }],
  })
    .populate('user', 'name email phone profileImage location locationLabel createdAt')
    .populate('categories', 'name slug icon');

  if (!profile) {
    throw new AppError('Provider profile not found', 404, 'PROVIDER_NOT_FOUND');
  }

  const services = await Service.find({
    provider: profile.user._id,
    isActive: true,
  }).populate('category', 'name slug icon');

  const reviews = await Review.find({ targetUser: profile.user._id })
    .populate('reviewer', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(20);

  return sendSuccess(res, 200, 'Provider details retrieved', {
    profile,
    services,
    reviews,
  });
});

// -------------------------------------------------------------
// Provider Services CRUD
// -------------------------------------------------------------

export const createService = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    serviceType,
    rateType,
    rateAmount,
    availability,
    locationLabel,
    location,
  } = req.body;

  if (!title || !description || !category) {
    throw new AppError('Title, description, and category are required', 400, 'MISSING_FIELDS');
  }

  const service = await Service.create({
    provider: req.user._id,
    category,
    title,
    description,
    serviceType: serviceType || 'ON_SITE',
    rateType: rateType || 'FIXED',
    rateAmount: rateAmount || 0,
    availability: availability || 'Standard Working Hours',
    locationLabel: locationLabel || req.user.locationLabel || '',
    location: location || req.user.location,
    isActive: true,
  });

  await service.populate('category', 'name slug icon');

  return sendSuccess(res, 201, 'Service created successfully', { service });
});

export const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id })
    .populate('category', 'name slug icon')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Provider services retrieved', { services });
});

export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findOne({ _id: id, provider: req.user._id });
  if (!service) {
    throw new AppError('Service not found or unauthorized', 404, 'SERVICE_NOT_FOUND');
  }

  Object.assign(service, req.body);
  await service.save();
  await service.populate('category', 'name slug icon');

  return sendSuccess(res, 200, 'Service updated successfully', { service });
});

export const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findOneAndDelete({ _id: id, provider: req.user._id });
  if (!service) {
    throw new AppError('Service not found or unauthorized', 404, 'SERVICE_NOT_FOUND');
  }

  return sendSuccess(res, 200, 'Service removed successfully');
});
