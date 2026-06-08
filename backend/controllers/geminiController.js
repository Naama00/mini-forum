// backend/controllers/geminiController.js
const geminiService = require("../services/geminiService");
const logger = require("../config/logger");

// ─── handleAIAssist: קיים, לא שונה ───────────────────────────────────────────
async function handleAIAssist(req, res, next) {
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
    logger.error({ err: error }, "Gemini assist error");
    next(error);
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
    logger.error({ err: error }, "Gemini stream error");
    send("error", { message: error?.message || "שגיאה לא ידועה" });
  } finally {
    res.end();
  }
}

// ─── ✨ handleSummarizePost: חדש — סיכום פוסט בודד ───────────────────────────
// מקבל: { title, content, comments[] }
// מחזיר: { text } — סיכום Markdown
async function handleSummarizePost(req, res, next) {
  const { title, content, comments } = req.body;

  if (!title && !content) {
    return res.status(400).json({ error: "חסר תוכן לסיכום." });
  }

  // ── בניית prompt מובנה מתוכן הפוסט ──────────────────────────────────────
  const commentsText =
    Array.isArray(comments) && comments.length > 0
      ? comments
          .slice(0, 20) // מקסימום 20 תגובות ראשונות כדי לחסוך טוקנים
          .map((c, i) => `תגובה ${i + 1}: ${c.content || c.text || ""}`)
          .join("\n")
      : "אין תגובות עדיין.";

  const prompt = `
כותרת הפוסט: ${title || "ללא כותרת"}

תוכן הפוסט:
${content || ""}

תגובות:
${commentsText}
  `.trim();

  try {
    const aiText = await geminiService.generateContent({
      action: "summarize-post",
      prompt,
    });

    return res.json({ text: aiText });
  } catch (error) {
    logger.error({ err: error }, "Summarize post error");
    next(error);
  }
}

module.exports = {
  handleAIAssist,
  handleAIStream,
  handleSummarizePost, // ✨ חדש
};