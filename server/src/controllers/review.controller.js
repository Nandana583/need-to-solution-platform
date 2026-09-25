import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { ShareRequest } from '../models/ShareRequest.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, shareRequestId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be a number between 1 and 5', 400, 'INVALID_RATING');
  }

  let targetUserId;

  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }
    if (booking.status !== 'COMPLETED') {
      throw new AppError('Can only review completed bookings', 400, 'BOOKING_NOT_COMPLETED');
    }
    if (booking.requester.toString() !== req.user._id.toString()) {
      throw new AppError('Only the requester can review this booking', 403, 'FORBIDDEN');
    }

    const existing = await Review.findOne({ reviewer: req.user._id, booking: bookingId });
    if (existing) {
      throw new AppError('You have already submitted a review for this booking', 400, 'DUPLICATE_REVIEW');
    }

    targetUserId = booking.provider;
    booking.isReviewed = true;
    await booking.save();
  } else if (shareRequestId) {
    const share = await ShareRequest.findById(shareRequestId);
    if (!share) {
      throw new AppError('Share request not found', 404, 'SHARE_NOT_FOUND');
    }
    if (share.status !== 'COMPLETED') {
      throw new AppError('Can only review completed share transactions', 400, 'SHARE_NOT_COMPLETED');
    }
    if (share.requester.toString() !== req.user._id.toString()) {
      throw new AppError('Only the requester can review this share request', 403, 'FORBIDDEN');
    }

    const existing = await Review.findOne({ reviewer: req.user._id, shareRequest: shareRequestId });
    if (existing) {
      throw new AppError('You have already submitted a review for this share transaction', 400, 'DUPLICATE_REVIEW');
    }

    targetUserId = share.owner;
    share.isReviewed = true;
    await share.save();
  } else {
    throw new AppError('Must specify either bookingId or shareRequestId', 400, 'MISSING_TARGET');
  }

  const review = await Review.create({
    reviewer: req.user._id,
    targetUser: targetUserId,
    booking: bookingId || null,
    shareRequest: shareRequestId || null,
    rating: Number(rating),
    comment: comment || '',
  });

  // Recalculate aggregate rating on ProviderProfile if target has one
  const allReviews = await Review.find({ targetUser: targetUserId });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

  await ProviderProfile.findOneAndUpdate(
    { user: targetUserId },
    {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    }
  );

  // Notify target user
  await NotificationService.createNotification({
    recipient: targetUserId,
    sender: req.user._id,
    type: 'REVIEW_RECEIVED',
    title: 'New Review Received',
    message: `${req.user.name} gave you a ${rating}★ review!`,
    link: `/providers/manage`,
  });

  await review.populate('reviewer', 'name profileImage');

  return sendSuccess(res, 201, 'Review submitted successfully', { review });
});

export const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ targetUser: req.params.userId })
    .populate('reviewer', 'name profileImage')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'User reviews retrieved', { reviews });
});
