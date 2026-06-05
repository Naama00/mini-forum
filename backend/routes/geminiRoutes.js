// backend/routes/geminiRoutes.js
const express = require("express");
const router = express.Router();
const { handleAIAssist, handleAIStream, handleSummarizePost } = require("../controllers/geminiController");
const aiRateLimiter = require("../middleware/aiRateLimiter");
const authMiddleware = require("../middleware/authMiddleware"); // ← הנתיב שלך, שנה אם צריך

router.post("/assist", authMiddleware, aiRateLimiter, handleAIAssist);
router.post("/stream", authMiddleware, aiRateLimiter, handleAIStream);
router.post("/summarize", authMiddleware, aiRateLimiter, handleSummarizePost);

module.exports = router;