const notificationService = require('../services/notificationService');
const { wrapAsync } = require('../utils/controllerFactory');

const getNotifications = wrapAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await notificationService.getNotifications(req.user.userId, page, limit);
  res.json(result);
});

const getUnreadCount = wrapAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.userId);
  res.json({ count });
});

const markAsRead = wrapAsync(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id, req.user.userId);
  res.json(result);
});

const markAllAsRead = wrapAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.userId);
  res.json(result);
});

const deleteNotification = wrapAsync(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user.userId);
  res.json(result);
});

const deleteAllNotifications = wrapAsync(async (req, res) => {
  const result = await notificationService.deleteAllNotifications(req.user.userId);
  res.json(result);
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
