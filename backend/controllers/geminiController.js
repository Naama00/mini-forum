// backend/controllers/geminiController.js
const geminiService = require("../services/geminiService");

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

// ─── handleAIStream: חדש — SSE endpoint ──────────────────────────────────────
async function handleAIStream(req, res) {
  const { action, prompt, extraContext, history } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "הקלט לחיפוש/עיבוד ריק או לא תקין." });
  }

  // ── הגדרת headers של SSE ──────────────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // מונע buffering בשרתי proxy כמו nginx
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // helper: שליחת event אחד
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

    // כל איטרציה ב-stream היא chunk מ-Gemini
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        send("chunk", { text });
      }
    }

    // סיום תקין
    send("done", { finished: true });
  } catch (error) {
    console.error("Stream Error in Gemini:", error);
    send("error", { message: error?.message || "שגיאה לא ידועה" });
  } finally {
    res.end();
  }
}

module.exports = {
  handleAIAssist,
  handleAIStream,
};