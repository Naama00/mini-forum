const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const { commentLimiter } = require('../middleware/rateLimitMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', authMiddleware, eventController.createEvent);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);
router.post('/:id/like', authMiddleware, eventController.likeEvent);
router.post('/:id/attend', authMiddleware, eventController.attendEvent);
router.post('/:id/comments', authMiddleware, commentLimiter, eventController.addComment);
router.delete('/:id/comments/:commentId', authMiddleware, eventController.deleteComment);

module.exports = router;
