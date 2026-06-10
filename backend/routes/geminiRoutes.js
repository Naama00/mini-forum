// backend/routes/geminiRoutes.js
const express = require("express");
const router = express.Router();
const {
  handleAIAssist,
  handleAIStream,
  handleAIStreamWithImage,
  handleSummarizePost,
  handleAIAssistWithImage,
  handleUploadImage,
  upload,
} = require("../controllers/geminiController");
const aiRateLimiter = require("../middleware/aiRateLimiter");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/assist", authMiddleware, aiRateLimiter, handleAIAssist);
router.post("/stream", authMiddleware, aiRateLimiter, handleAIStream);
router.post("/stream-with-image", authMiddleware, aiRateLimiter, upload.single("image"), handleAIStreamWithImage);
router.post("/summarize", authMiddleware, aiRateLimiter, handleSummarizePost);
router.post("/assist-with-image", authMiddleware, aiRateLimiter, upload.single("image"), handleAIAssistWithImage);
router.post("/upload-image", authMiddleware, upload.single("image"), handleUploadImage);

module.exports = router;