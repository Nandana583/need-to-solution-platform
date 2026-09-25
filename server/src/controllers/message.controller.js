import { Message } from '../models/Message.js';
import { Booking } from '../models/Booking.js';
import { ShareRequest } from '../models/ShareRequest.js';
import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { bookingId, shareRequestId, content, messageType = 'TEXT' } = req.body;

  if (!content || !content.trim()) {
    throw new AppError('Message content cannot be empty', 400, 'EMPTY_MESSAGE');
  }

  let recipientId = null;
  let link = '';
  let entityTitle = '';

  if (bookingId) {
    const booking = await Booking.findById(bookingId).populate('service', 'title');
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const isParty =
      booking.requester.toString() === req.user._id.toString() ||
      booking.provider.toString() === req.user._id.toString();

    if (!isParty) {
      throw new AppError('Unauthorized to send messages in this request', 403, 'FORBIDDEN');
    }

    recipientId =
      booking.requester.toString() === req.user._id.toString()
        ? booking.provider
        : booking.requester;

    link = `/bookings`;
    entityTitle = booking.service?.title || 'Service Booking';
  } else if (shareRequestId) {
    const share = await ShareRequest.findById(shareRequestId).populate('resource', 'title');
    if (!share) {
      throw new AppError('Share request not found', 404, 'SHARE_NOT_FOUND');
    }

    const isParty =
      share.requester.toString() === req.user._id.toString() ||
      share.owner.toString() === req.user._id.toString();

    if (!isParty) {
      throw new AppError('Unauthorized to send messages in this share request', 403, 'FORBIDDEN');
    }

    recipientId =
      share.requester.toString() === req.user._id.toString()
        ? share.owner
        : share.requester;

    link = `/shares`;
    entityTitle = share.resource?.title || 'Resource Share';
  } else {
    throw new AppError('Must provide bookingId or shareRequestId', 400, 'MISSING_CONTEXT');
  }

  const message = await Message.create({
    booking: bookingId || null,
    shareRequest: shareRequestId || null,
    sender: req.user._id,
    recipient: recipientId,
    content: content.trim(),
    messageType,
  });

  // Calm notification with deduplication window
  await NotificationService.createNotification({
    recipient: recipientId,
    sender: req.user._id,
    type: 'MESSAGE_RECEIVED',
    title: `New message on: ${entityTitle}`,
    message: `${req.user.name}: "${content.trim().slice(0, 100)}"`,
    link,
  });

  await message.populate([
    { path: 'sender', select: 'name email profileImage' },
    { path: 'recipient', select: 'name email profileImage' },
  ]);

  return sendSuccess(res, 201, 'Message sent successfully', { message });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { bookingId, shareRequestId } = req.query;

  if (!bookingId && !shareRequestId) {
    throw new AppError('Must specify bookingId or shareRequestId', 400, 'MISSING_QUERY');
  }

  let query = {};
  if (bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }
    const isParty =
      booking.requester.toString() === req.user._id.toString() ||
      booking.provider.toString() === req.user._id.toString() ||
      req.user.roles.includes('admin');
    if (!isParty) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }
    query.booking = bookingId;
  } else if (shareRequestId) {
    const share = await ShareRequest.findById(shareRequestId);
    if (!share) {
      throw new AppError('Share request not found', 404, 'SHARE_NOT_FOUND');
    }
    const isParty =
      share.requester.toString() === req.user._id.toString() ||
      share.owner.toString() === req.user._id.toString() ||
      req.user.roles.includes('admin');
    if (!isParty) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }
    query.shareRequest = shareRequestId;
  }

  const messages = await Message.find(query)
    .sort({ createdAt: 1 })
    .populate('sender', 'name email profileImage')
    .populate('recipient', 'name email profileImage');

  return sendSuccess(res, 200, 'Messages retrieved', { messages });
});
