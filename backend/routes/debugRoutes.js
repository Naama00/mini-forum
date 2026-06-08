const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/clear-caches', authMiddleware, adminMiddleware, debugController.clearCaches);

module.exports = router;
