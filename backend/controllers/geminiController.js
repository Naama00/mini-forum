// backend/controllers/geminiController.js
const geminiService = require("../services/geminiService");

async function handleAIAssist(req, res) {
  const { action, prompt, extraContext, history } = req.body;

  // ולידציה של שדות החובה
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "הקלט לחיפוש/עיבוד ריק או לא תקין." });
  }

  try {
    const aiText = await geminiService.generateContent({
      action,
      prompt,
      extraContext,
      history
    });

    return res.json({ text: aiText });
  } catch (error) {
    console.error("Controller Error in Gemini assist:", error);
    return res.status(500).json({ 
      error: "שגיאה בפנייה למנוע הבינה המלאכותית: " + (error?.message || error) 
    });
  }
}

module.exports = {
  handleAIAssist
};