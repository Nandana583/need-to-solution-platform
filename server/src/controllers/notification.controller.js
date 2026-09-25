import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationService.getForUser(req.user._id);
  const unreadCount = await NotificationService.getUnreadCount(req.user._id);

  return sendSuccess(res, 200, 'Notifications retrieved', {
    notifications,
    unreadCount,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await NotificationService.getUnreadCount(req.user._id);
  return sendSuccess(res, 200, 'Unread count retrieved', { unreadCount });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
  return sendSuccess(res, 200, 'Notification marked as read', { notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllAsRead(req.user._id);
  return sendSuccess(res, 200, 'All notifications marked as read');
});
