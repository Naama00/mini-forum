const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Categories
router.get('/categories', dataController.getCategories);
router.get('/categories/:categoryId', dataController.getCategoryById);

// Topics
router.get('/topics/:topicId', dataController.getTopicById);

// Posts
router.get('/posts/:postId', dataController.getPostById);

// Users
router.get('/users/:userId', dataController.getUserById);
router.get('/users', dataController.getAllUsers);

// Statistics
router.get('/statistics', dataController.getStatistics);
router.get('/trending', dataController.getTrendingTopics);

module.exports = router;
