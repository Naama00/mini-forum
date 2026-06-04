const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const authMiddleware = require('../middleware/authMiddleware');

// Personal stats — requires login
router.get('/me', authMiddleware, usageController.getMyUsage);

// Global forum stats — public
router.get('/global', usageController.getGlobalUsage);

module.exports = router;