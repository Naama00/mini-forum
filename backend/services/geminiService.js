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

// ─── basePersona: הגדרה אחידה עבור כל הפיצ'רים ──────────────────────────────
const basePersona = `
You are DevHub AI Co-pilot - a brilliant, engaging, friendly, and expert technological AI assistant.
You reside inside a modern high-performance technological forum and help young frontenders, backenders, and devops engineers code better, build faster, and deploy securely.
Mandatory rule: Answer fluently in professional technological Hebrew. Use Markdown beautifully.
`;

// ─── בניית system instruction לפי action ─────────────────────────────────────
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
      - Memory leaks (זיכרון דולף) or resource leaks.
      - Performance bottlenecks (rendering issues, slow algorithms).
      - Security holes (OWASP top 10, SQL injection, XSS, insecure state storage).
      
      Mandatory rules:
      1. Write your explanations and optimization summary in professional technological Hebrew.
      2. Keep the code itself clean, secure, and written in pristine, working English.
      3. Output the fully optimized corrected code in standard Markdown block specifying the correct language.
      4. Structure your response clearly:
         - # ניתוח ואיתור בעיות (Analysis and issue identification)
         - ## קוד משופר ואופטימלי (The optimized code block)
         - ## פירוט השינויים והשיפורים (Detailed summary of changes made)
         - ## המלצות נוספות (Additional expert advice)
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
  // ─── פיצ'ר חדש 1: סימולטור ראיונות עבודה (AI Interviewer) ───
  if (action === "tech-interview") {
    return `
      ${basePersona}
      Action Context: Elite Tech Interview Simulator.
      - You are interviewing the user for a high-paying tech position based on their prompt/role choice (e.g., Cyber, Fullstack, DevOps).
      - Conduct a simulated dynamic interview. Evaluate their knowledge critically.
      - Provide a structured response:
        1. "ציון הערכה זמני" (Mock score out of 100).
        2. "ניתוח תשובות" (Critical breakdown of what they did well or missed).
        3. "שאלת המשך מאתגרת" (A follow-up tough interview question or coding riddle to keep the thread going).
    `;
  }

  // ─── פיצ'ר חדש 2: יוצר אתגרי קוד לקהילה (Daily Challenge Creator) ───
  if (action === "create-challenge") {
    return `
      ${basePersona}
      Action Context: Forum Challenge Generator.
      - Create a brilliant, addictive weekly coding puzzle, algorithmic challenge, or system design riddle for the DEV.HUB forum.
      - Include: 
        1. סיפור רקע (A fun tech scenario, e.g., "The production database is locking up...").
        2. דרישות ומגבלות (Constraints like O(n) time complexity).
        3. קלט ופלט לדוגמה.
      - Encourage users to post their solutions in the thread below.
    `;
  }
  // default: chat
  return `
    You are DevHub AI Co-pilot - a brilliant, engaging, friendly, and expert technological AI assistant.
    You reside inside a modern high-performance technological forum and help young frontenders, backenders, and devops engineers code better, build faster, and deploy securely.
    
    Mandatory rules:
    1. Answer in fluent, helpful, clear Hebrew.
    2. Utilize clear Markdown blocks for explanations, lists, and code blocks.
    3. Be highly technical, concise, precise, and practical. Do not use fluff or excessive preambles.
  `;
}

// ─── buildContents: מייצר את מבנה contents עבור Gemini ───────────────────────
function buildContents(action, prompt, extraContext, history) {
  if (action === "chat" && Array.isArray(history)) {
    return history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));
  }

  if ((action === "optimize-code" || action === "optimize" || action === "explain") && extraContext) {
    return `Code to analyze:\n\`\`\`\n${extraContext}\n\`\`\`\n\nUser request/Context: ${prompt}`;
  }

  return prompt;
}

// ─── generateContent: קיים, לא שונה ─────────────────────────────────────────
async function generateContent({ action, prompt, extraContext, history }) {
  const ai = getGeminiClient();
  const systemInstruction = buildSystemInstruction(action);
  const contents = buildContents(action, prompt, extraContext, history);

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents,
    config: { systemInstruction, temperature: 1 },
  });

  return response.text;
}

// ─── generateContentStream: חדש — מחזיר AsyncIterable של chunks ──────────────
async function generateContentStream({ action, prompt, extraContext, history }) {
  const ai = getGeminiClient();
  const systemInstruction = buildSystemInstruction(action);
  const contents = buildContents(action, prompt, extraContext, history);

  // generateContentStream מחזיר AsyncIterable — כל איטרציה היא chunk
  const stream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents,
    config: { systemInstruction, temperature: 1 },
  });

  return stream;
}

module.exports = {
  generateContent,
  generateContentStream,
};