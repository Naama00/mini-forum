const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// GET unread count first (before :id route)
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// GET all notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// PUT mark all as read (before :id route)
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

// PUT mark single notification as read
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

// DELETE all notifications (before :id route)
router.delete('/', authMiddleware, notificationController.deleteAllNotifications);

// DELETE single notification
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;
