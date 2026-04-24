const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET /api/search?q=...&type=all|articles|events|jobs|topics|users&limit=5
router.get('/', searchController.search);

module.exports = router;
