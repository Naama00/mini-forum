// backend/middleware/aiRateLimiter.js
// ─────────────────────────────────────────────────────────────────────────────
// AI-specific Rate Limiter — שכבת הגנה נפרדת מה-rate limiter הכללי
// מגביל לפי שניהם: IP (לבוטים/אנונימיים) + userId (למשתמשים מחוברים)
// ─────────────────────────────────────────────────────────────────────────────

const { createClient } = require("redis");

// ── קבועי הגבלה ──────────────────────────────────────────────────────────────
const LIMITS = {
  perMinute: 5,   // מקס בקשות AI לדקה (לכל זהות)
  perDay: 20,     // מקס בקשות AI ליום (לכל זהות)
  maxChars: 4000, // מקס תווים בתוכן הפוסט שנשלח ל-Gemini
};

// ── Redis client (singleton) ──────────────────────────────────────────────────
let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    redisClient.on("error", (err) => console.error("AI RateLimiter Redis error:", err));
    await redisClient.connect();
  }
  return redisClient;
}

// ── בניית Redis key לפי זהות ומחזור זמן ─────────────────────────────────────
function buildKeys(identity) {
  return {
    minute: `ai:rate:${identity}:minute`,
    day: `ai:rate:${identity}:day`,
  };
}

// ── הלוגיקה המרכזית: בדיקה + הגדלת counter ───────────────────────────────────
async function checkAndIncrement(redis, identity) {
  const { minute, day } = buildKeys(identity);

  // שימוש ב-pipeline לביצועים מיטביים (שאילתה אחת לרדיס)
  const pipeline = redis.multi();
  pipeline.incr(minute);
  pipeline.incr(day);
  pipeline.ttl(minute);
  pipeline.ttl(day);
  const [minuteCount, dayCount, minuteTTL, dayTTL] = await pipeline.exec();

  // קביעת TTL בפעם הראשונה בלבד
  if (minuteTTL === -1) await redis.expire(minute, 60);
  if (dayTTL === -1) await redis.expire(day, 86400);

  return { minuteCount, dayCount };
}

// ── Middleware הראשי ──────────────────────────────────────────────────────────
async function aiRateLimiter(req, res, next) {
  try {
    const redis = await getRedisClient();

    // זהות: userId אם מחובר, אחרת IP
    const userId = req.user?.id;
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const identity = userId ? `user:${userId}` : `ip:${ip}`;

    const { minuteCount, dayCount } = await checkAndIncrement(redis, identity);

    // ── בדיקת חריגה מהמכסה ───────────────────────────────────────────────────
    if (minuteCount > LIMITS.perMinute) {
      return res.status(429).json({
        error: "rate_limit_minute",
        message: `ניסית יותר מדי פעמים בדקה האחרונה. המתן מעט ונסה שנית.`,
        retryAfter: 60,
      });
    }

    if (dayCount > LIMITS.perDay) {
      return res.status(429).json({
        error: "rate_limit_day",
        message: `הגעת למכסת הבקשות היומית שלך ל-AI. המכסה מתאפסת בחצות.`,
        retryAfter: 86400,
      });
    }

    // ── חיתוך תוכן ארוך לפני שמגיע ל-Gemini ─────────────────────────────────
    if (req.body?.content && req.body.content.length > LIMITS.maxChars) {
      req.body.content = req.body.content.slice(0, LIMITS.maxChars) + "\n\n[...התוכן קוצר אוטומטית]";
    }

    // ── העברת מידע על המכסה הנותרת ל-response headers ────────────────────────
    res.setHeader("X-AI-RateLimit-Minute-Remaining", Math.max(0, LIMITS.perMinute - minuteCount));
    res.setHeader("X-AI-RateLimit-Day-Remaining", Math.max(0, LIMITS.perDay - dayCount));

    next();
  } catch (err) {
    // אם Redis נפל — לא חוסמים את המשתמש, רק מתריעים
    console.error("aiRateLimiter error (Redis unavailable?):", err);
    next();
  }
}

module.exports = aiRateLimiter;