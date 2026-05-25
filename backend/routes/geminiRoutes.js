// backend/routes/geminiRoutes.js
const express = require("express");
const router = express.Router();
const { handleAIAssist } = require("../controllers/geminiController");

// נתיב חשיפת שירותי העזרה של הבינה המלאכותית
router.post("/assist", handleAIAssist);

module.exports = router;