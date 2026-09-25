import { ShareRequest } from '../models/ShareRequest.js';
import { Resource } from '../models/Resource.js';
import { Need } from '../models/Need.js';
import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const createShareRequest = asyncHandler(async (req, res) => {
  const { resourceId, needId, requestType, durationDays, message } = req.body;

  const resource = await Resource.findById(resourceId).populate('owner', 'name email');
  if (!resource || !resource.isActive) {
    throw new AppError('Resource not found or unavailable', 404, 'RESOURCE_NOT_FOUND');
  }

  if (resource.owner._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot request your own resource', 400, 'SELF_REQUEST_NOT_ALLOWED');
  }

  const days = durationDays ? Number(durationDays) : 7;
  const returnDeadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const shareRequest = await ShareRequest.create({
    resource: resource._id,
    need: needId || null,
    requester: req.user._id,
    owner: resource.owner._id,
    requestType: requestType || resource.shareType || 'BORROW',
    durationDays: days,
    returnDeadline,
    message: message || '',
    status: 'PENDING',
  });

  if (needId) {
    await Need.findByIdAndUpdate(needId, {
      status: 'REQUESTED',
      'selectedSolution.solutionType': 'COMMUNITY_RESOURCE',
      'selectedSolution.shareRequestId': shareRequest._id,
    });
  }

  // Notify Owner
  await NotificationService.createNotification({
    recipient: resource.owner._id,
    sender: req.user._id,
    type: 'SHARE_REQUEST',
    title: 'New Community Share Request',
    message: `${req.user.name} requested to access your shared resource: "${resource.title}"`,
    link: `/shares`,
  });

  await shareRequest.populate(['resource', 'owner', 'requester']);

  return sendSuccess(res, 201, 'Share request sent to resource owner', { shareRequest });
});

export const getMySentShareRequests = asyncHandler(async (req, res) => {
  const requests = await ShareRequest.find({ requester: req.user._id })
    .populate('resource', 'title resourceType shareType condition')
    .populate('owner', 'name email phone profileImage locationLabel')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Sent share requests retrieved', { requests });
});

export const getMyIncomingShareRequests = asyncHandler(async (req, res) => {
  const requests = await ShareRequest.find({ owner: req.user._id })
    .populate('resource', 'title resourceType shareType')
    .populate('requester', 'name email phone profileImage locationLabel')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Incoming share requests retrieved', { requests });
});

export const getShareRequestById = asyncHandler(async (req, res) => {
  const shareRequest = await ShareRequest.findById(req.params.id)
    .populate('resource')
    .populate('requester', 'name email phone profileImage location locationLabel')
    .populate('owner', 'name email phone profileImage location locationLabel')
    .populate('need');

  if (!shareRequest) {
    throw new AppError('Share request not found', 404, 'SHARE_REQUEST_NOT_FOUND');
  }

  const isParty =
    shareRequest.requester._id.toString() === req.user._id.toString() ||
    shareRequest.owner._id.toString() === req.user._id.toString() ||
    req.user.roles.includes('admin');

  if (!isParty) {
    throw new AppError('Unauthorized', 403, 'FORBIDDEN');
  }

  return sendSuccess(res, 200, 'Share request retrieved', { shareRequest });
});

export const acceptShareRequest = asyncHandler(async (req, res) => {
  const shareRequest = await ShareRequest.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!shareRequest) {
    throw new AppError('Share request not found or unauthorized', 404, 'SHARE_REQUEST_NOT_FOUND');
  }

  shareRequest.status = 'ACCEPTED';
  await shareRequest.save();

  // Mark resource as shared if applicable
  await Resource.findByIdAndUpdate(shareRequest.resource, { availabilityStatus: 'SHARED' });

  if (shareRequest.need) {
    await Need.findByIdAndUpdate(shareRequest.need, { status: 'ACCEPTED' });
  }

  // Notify Requester
  await NotificationService.createNotification({
    recipient: shareRequest.requester,
    sender: req.user._id,
    type: 'SHARE_ACCEPTED',
    title: 'Resource Share Request Accepted!',
    message: `${req.user.name} accepted your request to borrow/share their resource.`,
    link: `/shares`,
  });

  return sendSuccess(res, 200, 'Share request accepted', { shareRequest });
});

export const rejectShareRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const shareRequest = await ShareRequest.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!shareRequest) {
    throw new AppError('Share request not found or unauthorized', 404, 'SHARE_REQUEST_NOT_FOUND');
  }

  shareRequest.status = 'REJECTED';
  shareRequest.rejectionReason = reason || 'Owner is currently unable to share this resource.';
  await shareRequest.save();

  if (shareRequest.need) {
    await Need.findByIdAndUpdate(shareRequest.need, { status: 'MATCHING' });
  }

  // Notify Requester
  await NotificationService.createNotification({
    recipient: shareRequest.requester,
    sender: req.user._id,
    type: 'SHARE_REJECTED',
    title: 'Share Request Update',
    message: `${req.user.name} declined the request for this resource.`,
    link: `/shares`,
  });

  return sendSuccess(res, 200, 'Share request rejected', { shareRequest });
});

export const completeShareRequest = asyncHandler(async (req, res) => {
  const shareRequest = await ShareRequest.findById(req.params.id);

  if (!shareRequest) {
    throw new AppError('Share request not found', 404, 'SHARE_REQUEST_NOT_FOUND');
  }

  const isParty =
    shareRequest.requester.toString() === req.user._id.toString() ||
    shareRequest.owner.toString() === req.user._id.toString();

  if (!isParty) {
    throw new AppError('Unauthorized', 403, 'FORBIDDEN');
  }

  shareRequest.status = 'COMPLETED';
  await shareRequest.save();

  // Reset resource availability
  await Resource.findByIdAndUpdate(shareRequest.resource, { availabilityStatus: 'AVAILABLE' });

  if (shareRequest.need) {
    await Need.findByIdAndUpdate(shareRequest.need, { status: 'COMPLETED' });
  }

  const notifyTarget =
    shareRequest.requester.toString() === req.user._id.toString()
      ? shareRequest.owner
      : shareRequest.requester;

  await NotificationService.createNotification({
    recipient: notifyTarget,
    sender: req.user._id,
    type: 'SHARE_COMPLETED',
    title: 'Resource Shared / Returned',
    message: `The community resource share transaction has completed.`,
    link: `/shares`,
  });

  return sendSuccess(res, 200, 'Share request completed', { shareRequest });
});
