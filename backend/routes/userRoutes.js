const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.patch('/:userId', authMiddleware, userController.updateUser);

module.exports = router;
