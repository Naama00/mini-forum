// backend/services/geminiService.js
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

let genAI = null;

// איתחול בטוח של הלקוח
function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

/**
 * מחולל תוכן קוד או שיחה מול Gemini לפי הפעולה הנדרשת
 */
async function generateContent({ action, prompt, extraContext, history }) {
  const ai = getGeminiClient();
  let systemInstruction = "";
  let formattedPrompt = prompt;

  if (action === "generate-draft") {
    systemInstruction = `
      You are a world-class senior software developer, tech architect, and expert technical blogger.
      Your task is to draft an exceptionally polished, high-calibre, educational article, tutorial, or deep-dive forum topic based on the user's prompt.
      
      Mandatory rules:
      1. Write exclusively in clear, professional, modern technological Hebrew (עברית).
      2. Keep a helpful, engaging, and professional tone.
      3. Use Markdown beautifully. Include rich formatted lists, bold terms, headers, and code sections.
      4. Every code example or block MUST have syntax-highlighting language specified (e.g., \`\`\`tsx or \`\`\`typescript) and be written in high-quality, clean, production-ready English code.
      5. Structure the response cleanly with a:
         - # כותרת מרשימה (Catchy Title)
         - ## תקציר (Summary / TL;DR)
         - ## סקירה מעמיקה / רקע (Deep-dive background explanation)
         - ## דוגמת קוד מלאה (Full, beautiful, syntax-highlighted code example)
         - ## טיפים והמלצות (Expert tips and recommendations)
       6. Return only the Markdown text.
    `;
  } else if (action === "optimize-code") {
    systemInstruction = `
      You are an elite compiler engineer, principal performance architect, and senior security auditor.
      Your task is to analyze, debug, and optimize the provided code block.
      
      Identify:
      - Memory leaks (זיכרון דולף) or resource leaks.
      - Performance bottlenecks (rendering issues, slow algorithms).
      - Security holes (OWASP top 10, SQL injection, XSS, insecure state storage).
      
      Mandatory rules:
      1. Write your explanations and optimization summary in professional technological Hebrew.
      2. Keep the code itself clean, secure, and written in pristine, working English.
      3. Output the fully optimized corrected code in standard Markdown block specifying the correct language (e.g., \`\`\`typescript).
      4. Structure your response clearly:
         - # ניתוח ואיתור בעיות (Analysis and issue identification)
         - ## קוד משופר ואופטימלי (The optimized code block)
         - ## פירוט השינויים והשיפורים (Detailed summary of changes made)
         - ## המלצות נוספות (Additional expert advice)
    `;
    if (extraContext) {
      formattedPrompt = `Code to optimize:\n\`\`\`\n${extraContext}\n\`\`\`\n\nUser request/Context: ${prompt}`;
    }
  } else if (action === "refine-content") {
    systemInstruction = `
      You are an expert technical editor, localization specialist, and tech copywriter.
      Your task is to refine, brush up, and polish the user's drafted text to make it extremely professional, grammatically perfect, and technically precise.
      
      Mandatory rules:
      1. Exclusively output the refined, clear, engaging technical Hebrew version.
      2. Preserve any technical English terms or code snippets accurately within the text.
      3. Format into proper readable Markdown (paragraphs, bullet points, correct headers).
      4. Output only the final refined version itself without introductory conversational meta-talk.
    `;
  } else {
    // צ'אט מותאם אישית של העוזר (AI Chat Helper)
    systemInstruction = `
      You are DevHub AI Co-pilot - a brilliant, engaging, friendly, and expert technological AI assistant.
      You reside inside a modern high-performance technological forum and help young frontenders, backenders, and devops engineers code better, build faster, and deploy securely.
      
      Mandatory rules:
      1. Answer in fluent, helpful, clear Hebrew.
      2. Utilize clear Markdown blocks for explanations, lists, and code blocks.
      3. Be highly technical, concise, precise, and practical. Do not use fluff or excessive preambles.
    `;
  }

  let contents = formattedPrompt;

  // אם אנחנו בשיחת צ'אט רציפה ויש היסטוריית הודעות - נמיר אותה למבנה ש-Gemini מצפה לקבל
  if (action === "chat" && Array.isArray(history)) {
    contents = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: contents,
    config: {
      systemInstruction,
      temperature: 1,
    }
  });

  return response.text;
}

module.exports = {
  generateContent
};