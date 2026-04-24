const notificationService = require('../services/notificationService');

/**
 * GET /api/notifications
 */
async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getNotifications(req.user.userId, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications/unread-count
 */
async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/notifications/:id/read
 */
async function markAsRead(req, res, next) {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/notifications/read-all
 */
async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notifications/:id
 */
async function deleteNotification(req, res, next) {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notifications
 */
async function deleteAllNotifications(req, res, next) {
  try {
    const result = await notificationService.deleteAllNotifications(req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
