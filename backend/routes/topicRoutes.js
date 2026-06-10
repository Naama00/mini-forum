const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', topicController.getTopics);
router.post('/', authMiddleware, topicController.createTopic);
router.delete('/:topicId', authMiddleware, topicController.deleteTopic);
router.patch('/:topicId', authMiddleware, topicController.updateTopic);
router.post('/:topicId/like', authMiddleware, topicController.likeTopic);

module.exports = router;