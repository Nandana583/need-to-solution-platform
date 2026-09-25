import { Need } from '../models/Need.js';
import { MatchingService } from '../services/matching.service.js';
import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const createNeed = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    needType,
    urgency,
    preferredSolutionType,
    locationLabel,
    location,
    requiredSkill,
    requiredService,
    preferredTime,
    duration,
    deadline,
  } = req.body;

  if (!title || !description || !category) {
    throw new AppError('Title, description, and category are required', 400, 'MISSING_FIELDS');
  }

  const need = await Need.create({
    requester: req.user._id,
    category,
    title,
    description,
    needType: needType || 'service',
    urgency: urgency || 'MEDIUM',
    preferredSolutionType: preferredSolutionType || 'COMMERCIAL_FIRST',
    locationLabel: locationLabel || req.user.locationLabel || '',
    location: location || req.user.location,
    requiredSkill: requiredSkill || '',
    requiredService: requiredService || '',
    preferredTime: preferredTime || '',
    duration: duration || '',
    deadline: deadline || null,
    status: 'CREATED',
  });

  // Run two-phase matching immediately
  const matchResults = await MatchingService.matchNeed(need);

  await need.populate(['category', 'requester']);

  return sendSuccess(res, 201, 'Need posted and matches calculated successfully', {
    need,
    matches: matchResults,
  });
});

export const getMyNeeds = asyncHandler(async (req, res) => {
  const needs = await Need.find({ requester: req.user._id })
    .populate('category', 'name slug icon')
    .populate('matchedProviders.provider', 'name email profileImage')
    .populate('matchedProviders.service', 'title rateType rateAmount')
    .populate('matchedResources.resource', 'title resourceType shareType')
    .populate('matchedResources.owner', 'name profileImage')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'User needs retrieved', { needs });
});

export const getNeedById = asyncHandler(async (req, res) => {
  const need = await Need.findById(req.params.id)
    .populate('category', 'name slug icon')
    .populate('requester', 'name email phone profileImage location locationLabel')
    .populate('matchedProviders.provider', 'name email phone profileImage location locationLabel')
    .populate('matchedProviders.service', 'title description rateType rateAmount availability')
    .populate('matchedResources.resource', 'title description resourceType shareType condition metadata')
    .populate('matchedResources.owner', 'name email phone profileImage location locationLabel')
    .populate('selectedSolution.bookingId')
    .populate('selectedSolution.shareRequestId');

  if (!need) {
    throw new AppError('Need request not found', 404, 'NEED_NOT_FOUND');
  }

  return sendSuccess(res, 200, 'Need details retrieved', { need });
});

export const matchNeedMatches = asyncHandler(async (req, res) => {
  const need = await Need.findOne({
    _id: req.params.id,
    requester: req.user._id,
  });

  if (!need) {
    throw new AppError('Need not found or unauthorized', 404, 'NEED_NOT_FOUND');
  }

  const matchResults = await MatchingService.matchNeed(need);

  return sendSuccess(res, 200, 'Matches recalculated successfully', {
    matches: matchResults,
  });
});

export const cancelNeed = asyncHandler(async (req, res) => {
  const need = await Need.findOne({
    _id: req.params.id,
    requester: req.user._id,
  });

  if (!need) {
    throw new AppError('Need not found or unauthorized', 404, 'NEED_NOT_FOUND');
  }

  if (['COMPLETED', 'CANCELLED'].includes(need.status)) {
    throw new AppError(`Cannot cancel need in ${need.status} state`, 400, 'INVALID_STATE');
  }

  need.status = 'CANCELLED';
  await need.save();

  return sendSuccess(res, 200, 'Need cancelled successfully', { need });
});

export const getCommunityNeedsFeed = asyncHandler(async (req, res) => {
  const { category, search } = req.query;

  const query = { status: { $in: ['CREATED', 'MATCHING', 'REQUESTED'] } };
  if (category) query.category = category;

  let needs = await Need.find(query)
    .populate('category', 'name slug icon')
    .populate('requester', 'name profileImage locationLabel')
    .sort({ createdAt: -1 })
    .limit(30);

  if (search) {
    const s = search.toLowerCase();
    needs = needs.filter(
      (n) => n.title.toLowerCase().includes(s) || n.description.toLowerCase().includes(s)
    );
  }

  return sendSuccess(res, 200, 'Community needs retrieved', { needs });
});
