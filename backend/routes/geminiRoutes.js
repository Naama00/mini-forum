// backend/routes/geminiRoutes.js
const express = require("express");
const router = express.Router();
const { handleAIAssist, handleAIStream } = require("../controllers/geminiController");

// קיים — תגובה מלאה
router.post("/assist", handleAIAssist);

// חדש — Server-Sent Events streaming
router.post("/stream", handleAIStream);

module.exports = router;