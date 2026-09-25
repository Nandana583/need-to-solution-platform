import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { Need } from '../models/Need.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, needId, scheduledDate, notes, locationLabel, agreedPrice } = req.body;

  const service = await Service.findById(serviceId).populate('provider', 'name email');
  if (!service || !service.isActive) {
    throw new AppError('Service not found or unavailable', 404, 'SERVICE_NOT_FOUND');
  }

  // Enforce Provider Availability Rules
  const providerProfile = await ProviderProfile.findOne({ user: service.provider._id });
  if (providerProfile && (providerProfile.availabilityStatus === 'UNAVAILABLE' || !providerProfile.isActive)) {
    throw new AppError('This provider is not currently accepting requests.', 400, 'PROVIDER_UNAVAILABLE');
  }

  if (service.provider._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot book your own service', 400, 'SELF_BOOKING_NOT_ALLOWED');
  }

  const booking = await Booking.create({
    service: service._id,
    need: needId || null,
    requester: req.user._id,
    provider: service.provider._id,
    scheduledDate: scheduledDate || new Date(),
    notes: notes || '',
    locationLabel: locationLabel || req.user.locationLabel || '',
    agreedPrice: agreedPrice !== undefined ? agreedPrice : service.rateAmount,
    status: 'PENDING',
  });

  // Link booking to Need if present
  if (needId) {
    await Need.findByIdAndUpdate(needId, {
      status: 'REQUESTED',
      'selectedSolution.solutionType': 'PROVIDER_SERVICE',
      'selectedSolution.bookingId': booking._id,
    });
  }

  // Notify Provider
  await NotificationService.createNotification({
    recipient: service.provider._id,
    sender: req.user._id,
    type: 'BOOKING_REQUEST',
    title: 'New Service Booking Request',
    message: `${req.user.name} requested your service: "${service.title}"`,
    link: `/bookings`,
  });

  await booking.populate(['service', 'provider', 'requester']);

  return sendSuccess(res, 201, 'Booking request sent to provider', { booking });
});

export const getRequesterBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ requester: req.user._id })
    .populate('service', 'title category rateType rateAmount')
    .populate('provider', 'name email phone profileImage')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'User bookings retrieved', { bookings });
});

export const getProviderBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ provider: req.user._id })
    .populate('service', 'title category rateType rateAmount')
    .populate('requester', 'name email phone profileImage locationLabel')
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, 'Provider incoming bookings retrieved', { bookings });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service')
    .populate('requester', 'name email phone profileImage location locationLabel')
    .populate('provider', 'name email phone profileImage location locationLabel')
    .populate('need');

  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const isParty =
    booking.requester._id.toString() === req.user._id.toString() ||
    booking.provider._id.toString() === req.user._id.toString() ||
    req.user.roles.includes('admin');

  if (!isParty) {
    throw new AppError('Unauthorized to view this booking', 403, 'FORBIDDEN');
  }

  return sendSuccess(res, 200, 'Booking details retrieved', { booking });
});

export const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    provider: req.user._id,
  });

  if (!booking) {
    throw new AppError('Booking not found or unauthorized', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.status !== 'PENDING') {
    throw new AppError(`Cannot accept booking with status ${booking.status}`, 400, 'INVALID_STATUS');
  }

  booking.status = 'ACCEPTED';
  await booking.save();

  if (booking.need) {
    await Need.findByIdAndUpdate(booking.need, { status: 'ACCEPTED' });
  }

  // Notify Requester
  await NotificationService.createNotification({
    recipient: booking.requester,
    sender: req.user._id,
    type: 'BOOKING_ACCEPTED',
    title: 'Booking Accepted!',
    message: `${req.user.name} has accepted your service booking request.`,
    link: `/bookings`,
  });

  return sendSuccess(res, 200, 'Booking accepted successfully', { booking });
});

export const rejectBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findOne({
    _id: req.params.id,
    provider: req.user._id,
  });

  if (!booking) {
    throw new AppError('Booking not found or unauthorized', 404, 'BOOKING_NOT_FOUND');
  }

  booking.status = 'REJECTED';
  booking.rejectionReason = reason || 'Provider is unavailable at the requested time.';
  await booking.save();

  if (booking.need) {
    await Need.findByIdAndUpdate(booking.need, { status: 'MATCHING' });
  }

  // Notify Requester
  await NotificationService.createNotification({
    recipient: booking.requester,
    sender: req.user._id,
    type: 'BOOKING_REJECTED',
    title: 'Booking Request Update',
    message: `${req.user.name} was unable to accept your request. Re-checking fallback options.`,
    link: `/bookings`,
  });

  return sendSuccess(res, 200, 'Booking rejected', { booking });
});

export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const isParty =
    booking.requester.toString() === req.user._id.toString() ||
    booking.provider.toString() === req.user._id.toString();

  if (!isParty) {
    throw new AppError('Unauthorized to update this booking', 403, 'FORBIDDEN');
  }

  booking.status = 'COMPLETED';
  await booking.save();

  if (booking.need) {
    await Need.findByIdAndUpdate(booking.need, { status: 'COMPLETED' });
  }

  // Increment completed bookings count on provider profile
  await ProviderProfile.findOneAndUpdate(
    { user: booking.provider },
    { $inc: { completedBookingsCount: 1 } }
  );

  const notifyTarget =
    booking.requester.toString() === req.user._id.toString()
      ? booking.provider
      : booking.requester;

  await NotificationService.createNotification({
    recipient: notifyTarget,
    sender: req.user._id,
    type: 'BOOKING_COMPLETED',
    title: 'Service Completed',
    message: `The service booking has been marked as completed. You can now leave a review.`,
    link: `/bookings`,
  });

  return sendSuccess(res, 200, 'Booking marked as completed', { booking });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const isParty =
    booking.requester.toString() === req.user._id.toString() ||
    booking.provider.toString() === req.user._id.toString();

  if (!isParty) {
    throw new AppError('Unauthorized', 403, 'FORBIDDEN');
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = reason || 'Cancelled by user';
  await booking.save();

  return sendSuccess(res, 200, 'Booking cancelled', { booking });
});
