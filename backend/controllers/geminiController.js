// backend/controllers/geminiController.js
const geminiService = require("../services/geminiService");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// ─── handleAIAssistWithImage: חדש — תמיכה בתמונה ────────────────────────────
async function handleAIAssistWithImage(req, res) {
  const { action, prompt, extraContext } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "הקלט ריק או לא תקין." });
  }

  if (!req.file) {
    return res.status(400).json({ error: "לא הועלתה תמונה." });
  }

  try {
    // שליחה לGemini עם התמונה כbase64
    const imageBase64 = req.file.buffer.toString("base64");
    const imageMimeType = req.file.mimetype;

    const aiText = await geminiService.generateContent({
      action: action || "chat",
      prompt,
      extraContext,
      imageBase64,
      imageMimeType,
    });

    return res.json({
      text: aiText,
      success: true,
    });
  } catch (error) {
    console.error("Controller Error in AI with image:", error);
    return res.status(500).json({
      error: "שגיאה בעיבוד התמונה: " + (error?.message || error),
    });
  }
}


// ─── handleAIAssist: קיים, לא שונה ───────────────────────────────────────────
async function handleAIAssist(req, res) {
  const { action, prompt, extraContext, history } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "הקלט לחיפוש/עיבוד ריק או לא תקין." });
  }

  try {
    const aiText = await geminiService.generateContent({
      action,
      prompt,
      extraContext,
      history,
    });

    return res.json({ text: aiText });
  } catch (error) {
    console.error("Controller Error in Gemini assist:", error);
    return res.status(500).json({
      error: "שגיאה בפנייה למנוע הבינה המלאכותית: " + (error?.message || error),
    });
  }
}

// ─── handleAIStream: קיים, לא שונה — SSE endpoint ────────────────────────────
async function handleAIStream(req, res) {
  const { action, prompt, extraContext, history } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "הקלט לחיפוש/עיבוד ריק או לא תקין." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = await geminiService.generateContentStream({
      action,
      prompt,
      extraContext,
      history,
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        send("chunk", { text });
      }
    }

    send("done", { finished: true });
  } catch (error) {
    console.error("Stream Error in Gemini:", error);
    send("error", { message: error?.message || "שגיאה לא ידועה" });
  } finally {
    res.end();
  }
}

// ─── ✨ חדש: handleAIStreamWithImage — SSE endpoint עם תמונה ────────────────────
async function handleAIStreamWithImage(req, res) {
  const { action, prompt, extraContext, history } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "הקלט לחיפוש/עיבוד ריק או לא תקין." });
  }

  if (!req.file) {
    return res.status(400).json({ error: "לא הועלתה תמונה." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const imageBase64 = req.file.buffer.toString("base64");
    const imageMimeType = req.file.mimetype;

    // streaming עם התמונה
    const geminiStream = await geminiService.generateContentStream({
      action,
      prompt,
      extraContext,
      history,
      imageBase64,
      imageMimeType,
    });

    for await (const chunk of geminiStream) {
      const text = chunk.text;
      if (text) {
        send("chunk", { text });
      }
    }

    send("done", { finished: true });
  } catch (error) {
    console.error("Stream Error in Gemini with image:", error);
    send("error", { message: error?.message || "שגיאה לא ידועה" });
  } finally {
    res.end();
  }
}

// ─── ✨ handleSummarizePost: חדש — סיכום פוסט בודד ───────────────────────────
// מקבל: { title, content, comments[] }
// מחזיר: { text } — סיכום Markdown
async function handleSummarizePost(req, res) {
  const { title, content, comments } = req.body;
  if (!title && !content) {
    return res.status(400).json({ error: "חסר תוכן לסיכום." });
  }
  try {
    const text = await geminiService.summarizePost({ title, content, comments });
    return res.json({ text });
  } catch (error) {
    console.error("Controller Error in summarizePost:", error);
    return res.status(500).json({ error: "שגיאה בסיכום הפוסט: " + (error?.message || error) });
  }
}
async function handleUploadImage(req, res) {
  try {
    const cloudinary = require('../config/cloudinary');
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'agent-uploads' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });
    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  handleAIAssist,
  handleAIStream,
  handleAIStreamWithImage,
  handleSummarizePost,
  handleAIAssistWithImage,
  handleUploadImage,
  upload,                  
};


