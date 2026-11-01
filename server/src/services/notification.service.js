import { Notification } from '../models/Notification.js';

export class NotificationService {
  static async createNotification({ recipient, sender, type, title, message, link }) {
    try {
      if (!recipient) return null;

      // Deduplication: skip if same type sent to same recipient within 5 minutes
      // MESSAGE_RECEIVED and SYSTEM are always allowed (unique content each time)
      if (type !== 'MESSAGE_RECEIVED' && type !== 'SYSTEM') {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recent = await Notification.findOne({
          recipient,
          type,
          createdAt: { $gte: fiveMinutesAgo },
        });
        if (recent) return null; // Suppress duplicate
      }

      return await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        link: link || '',
      });
    } catch (err) {
      console.error('[Notification Error]:', err.message);
      return null;
    }
  }

  static async getForUser(userId, limit = 50) {
    return Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email profileImage');
  }

  static async getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }

  static async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId) {
    return Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }
}
