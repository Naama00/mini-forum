const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

router.post('/clear-caches', debugController.clearCaches);

module.exports = router;
