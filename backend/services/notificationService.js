const Notification = require('../models/Notification');
const logger = require('../config/logger');
const { addNotificationJob } = require('../queues/notificationQueue');

/**
 * Create a notification (internal helper)
 * Does not send to the same user
 */
async function createNotification({ recipient, sender, type, refModel, refId, text = '' }) {
  try {
    if (recipient.toString() === sender.toString()) return; // Don't send to yourself
    await addNotificationJob({ recipient, sender, type, refModel, refId, text });
  } catch (err) {
    logger.error({ err }, 'createNotification error');
  }
}

/**
 * Get notifications for a user with pagination
 */
async function getNotifications(userId, page = 1, limit = 20) {
  const notifications = await Notification.find({ recipient: userId })
    .populate('sender', 'username firstName lastName icon avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    read: false
  });

  const total = await Notification.countDocuments({ recipient: userId });

  return {
    notifications,
    unreadCount,
    total,
    pages: Math.ceil(total / limit)
  };
}

/**
 * Get unread notification count for a user
 */
async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({
    recipient: userId,
    read: false
  });
  return count;
}

/**
 * Mark a single notification as read
 */
async function markAsRead(notificationId, userId) {
  const notif = await Notification.findOne({
    _id: notificationId,
    recipient: userId
  });

  if (!notif) {
    throw new Error('התראה לא נמצאה');
  }

  notif.read = true;
  await notif.save();

  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
  await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );

  return { success: true };
}

/**
 * Delete a single notification
 */
async function deleteNotification(notificationId, userId) {
  await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId
  });

  return { success: true };
}

/**
 * Delete all notifications for a user
 */
async function deleteAllNotifications(userId) {
  await Notification.deleteMany({ recipient: userId });

  return { success: true };
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
