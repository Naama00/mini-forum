// backend/services/geminiService.js
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

let genAI = null;

function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });
  }
  return genAI;
}

// ─── המודלים לפי סדר עדיפות (כולם חינמיים!) ──────────────────────────────────
// אם הראשון עמוס — עובר לבא בתור אוטומטית
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
];
// ─── retry + fallback מרכזי ───────────────────────────────────────────────────
async function withRetryAndFallback(fn) {
  let lastError;

  for (const model of MODEL_FALLBACK_CHAIN) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await fn(model);
      } catch (err) {
        const status = err?.status || err?.code;
        const msg = err?.message || "";

        const isUnavailable = status === 503 || msg.includes("UNAVAILABLE") || msg.includes("high demand");
        const isNotFound    = status === 404 || msg.includes("not found");
        // quota אפסי (limit: 0) — אין טעם לנסות שוב, עבור מיד למודל הבא
        const isQuotaZero   = status === 429 && msg.includes("limit: 0");
        // quota זמני — המתן וחזור
        const isQuotaTemp   = status === 429 && !msg.includes("limit: 0");

        console.warn(`[Gemini] מודל ${model} ניסיון ${attempt} נכשל (${status}):`, msg.slice(0, 80));

        if (isNotFound || isQuotaZero) break; // עבור מיד למודל הבא

        if ((isUnavailable || isQuotaTemp) && attempt < 2) {
          await new Promise(res => setTimeout(res, 1500));
          continue;
        }

        lastError = err;
        break;
      }
    }
  }

  throw lastError || new Error("כל מודלי ה-AI אינם זמינים כרגע, נסי שוב בעוד מספר שניות.");
}

// ─── basePersona ──────────────────────────────────────────────────────────────
const basePersona = `
You are DevHub AI Co-pilot - a brilliant, engaging, friendly, and expert technological AI assistant.
You reside inside a modern high-performance technological forum and help young frontenders, backenders, and devops engineers code better, build faster, and deploy securely.
Mandatory rule: Answer fluently in professional technological Hebrew. Use Markdown beautifully.
`;

// ─── buildSystemInstruction ───────────────────────────────────────────────────
function buildSystemInstruction(action) {
  if (action === "generate-draft") {
    return `
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
  }

  if (action === "optimize-code" || action === "optimize") {
    return `
      You are an elite compiler engineer, principal performance architect, and senior security auditor.
      Your task is to analyze, debug, and optimize the provided code block.
      
      Identify:
      - Memory leaks or resource leaks.
      - Performance bottlenecks (rendering issues, slow algorithms).
      - Security holes (OWASP top 10, SQL injection, XSS, insecure state storage).
      
      Mandatory rules:
      1. Write your explanations and optimization summary in professional technological Hebrew.
      2. Keep the code itself clean, secure, and written in pristine, working English.
      3. Output the fully optimized corrected code in standard Markdown block specifying the correct language.
      4. Structure your response clearly:
         - # ניתוח ואיתור בעיות
         - ## קוד משופר ואופטימלי
         - ## פירוט השינויים והשיפורים
         - ## המלצות נוספות
    `;
  }

  if (action === "refine-content") {
    return `
      You are an expert technical editor, localization specialist, and tech copywriter.
      Your task is to refine, brush up, and polish the user's drafted text to make it extremely professional, grammatically perfect, and technically precise.
      
      Mandatory rules:
      1. Exclusively output the refined, clear, engaging technical Hebrew version.
      2. Preserve any technical English terms or code snippets accurately within the text.
      3. Format into proper readable Markdown (paragraphs, bullet points, correct headers).
      4. Output only the final refined version itself without introductory conversational meta-talk.
    `;
  }

  if (action === "tech-interview") {
    return `
      ${basePersona}
      Action Context: Elite Tech Interview Simulator.
      - You are interviewing the user for a high-paying tech position based on their prompt/role choice.
      - Conduct a simulated dynamic interview. Evaluate their knowledge critically.
      - Provide a structured response:
        1. "ציון הערכה זמני" (Mock score out of 100).
        2. "ניתוח תשובות" (Critical breakdown of what they did well or missed).
        3. "שאלת המשך מאתגרת" (A follow-up tough interview question or coding riddle).
    `;
  }

  if (action === "create-challenge") {
    return `
      ${basePersona}
      Action Context: Forum Challenge Generator.
      - Create a brilliant, addictive weekly coding puzzle, algorithmic challenge, or system design riddle for the DEV.HUB forum.
      - Include: 
        1. סיפור רקע (A fun tech scenario).
        2. דרישות ומגבלות (Constraints like O(n) time complexity).
        3. קלט ופלט לדוגמה.
      - Encourage users to post their solutions in the thread below.
    `;
  }

  if (action === "summarize-post") {
    return `
      ${basePersona}
      Action Context: Forum Post Summarizer.
      
      You are given a forum post (title + content) and optionally its comments/replies.
      Your job is to produce a short, sharp, useful summary for a developer who wants to understand the gist quickly.
      
      Mandatory rules:
      1. Write exclusively in clear professional Hebrew.
      2. Structure your response as:
         - ## 💡 תקציר (2-3 sentences max)
         - ## ✅ הפתרון / המסקנה (The key solution or conclusion, or "טרם נמצא פתרון")
         - ## 🔑 נקודות מפתח (3-5 bullet points)
      3. Be concise — this is a quick-read summary, not a full analysis.
      4. If the post contains code, mention the tech stack only, do not reproduce the code.
    `;
  }

  // default: chat
  return `
    You are DevHub AI Co-pilot - a brilliant, engaging, friendly, and expert technological AI assistant.
    You reside inside a modern high-performance technological forum and help young frontenders, backenders, and devops engineers code better, build faster, and deploy securely.
    
    Mandatory rules:
    1. Answer in fluent, helpful, clear Hebrew.
    2. Utilize clear Markdown blocks for explanations, lists, and code blocks.
    3. Be highly technical, concise, precise, and practical.
  `;
}

// ─── buildContents ────────────────────────────────────────────────────────────
function buildContents(action, prompt, extraContext, history, imageBase64, imageMimeType) {
  if (action === "chat" && Array.isArray(history)) {
    const messages = history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    if (imageBase64 && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "user") {
        last.parts.push({
          inlineData: { mimeType: imageMimeType, data: imageBase64 },
        });
      }
    }
    return messages;
  }

  if ((action === "optimize-code" || action === "optimize" || action === "explain") && extraContext) {
    return `Code to analyze:\n\`\`\`\n${extraContext}\n\`\`\`\n\nUser request/Context: ${prompt}`;
  }

  if (imageBase64) {
    return [
      { text: prompt },
      { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
    ];
  }

  return prompt;
}

// ─── generateContent ──────────────────────────────────────────────────────────
async function generateContent({ action, prompt, extraContext, history, imageBase64, imageMimeType }) {
  const ai = getGeminiClient();
  const systemInstruction = buildSystemInstruction(action);
  const contents = buildContents(action, prompt, extraContext, history, imageBase64, imageMimeType);

  return withRetryAndFallback(async (model) => {
     console.log("🔄 withRetryAndFallback started, models:", MODEL_FALLBACK_CHAIN);
    const response = await ai.models.generateContent({
      model,
      contents,
      config: { systemInstruction, temperature: 1 },
    });
    return response.text;
  });
}

// ─── generateContentStream ────────────────────────────────────────────────────
async function generateContentStream({ action, prompt, extraContext, history, imageBase64, imageMimeType }) {
  const ai = getGeminiClient();
  const systemInstruction = buildSystemInstruction(action);
  const contents = buildContents(action, prompt, extraContext, history, imageBase64, imageMimeType);

  return withRetryAndFallback(async (model) => {
    const stream = await ai.models.generateContentStream({
      model,
      contents,
      config: { systemInstruction, temperature: 1 },
    });
    return stream;
  });
}
const cache = require('../config/cache');

async function summarizePost({ title, content, comments }) {
  // בניית prompt
  const commentsText =
    Array.isArray(comments) && comments.length > 0
      ? comments.slice(0, 20).map((c, i) => `תגובה ${i + 1}: ${c.content || c.text || c || ""}`).join("\n")
      : "אין תגובות עדיין.";

  const prompt = `
כותרת הפוסט: ${title || "ללא כותרת"}
תוכן הפוסט:
${content || ""}
תגובות:
${commentsText}
  `.trim();

  // cache key לפי תוכן + מספר תגובות
  const raw = `${title}:${content}:${Array.isArray(comments) ? comments.length : 0}`;
  const cacheKey = `gemini:summary:${Buffer.from(raw).toString('base64').slice(0, 40)}`;

  // בדוק cache קודם
  const cached = await cache.get(cacheKey);
  if (cached) return cached.text;

  // קרא ל-Gemini
  const text = await generateContent({ action: "summarize-post", prompt });

  // שמור ל-6 שעות
  await cache.set(cacheKey, { text }, 60 * 60 * 6);

  return text;
}

module.exports = {
  generateContent,
  generateContentStream,
  summarizePost,
};