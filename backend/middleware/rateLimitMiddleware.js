const rateLimit = require('express-rate-limit');

// Redis is optional - uncomment if you have Redis set up for distributed rate limiting
// const RedisStore = require('rate-limit-redis');
// const redis = require('redis');
// const redisClient = redis.createClient();

/**
 * Auth rate limiter - Prevents brute force attacks
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'יותר מדי ניסיונות התחברות. אנא נסה שוב בעוד 15 דקות.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req, res) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'יותר מדי ניסיונות. אנא חכה קצת לפני שתנסה שוב.'
    });
  }
});

/**
 * Topic creation rate limiter - Prevents spam
 * 5 topics per hour per user
 */
const topicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each user to 5 topics per hour
  message: 'יותר מדי נושאים. אנא חכה לפני שתיצור נושא חדש.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use JWT userId if available, otherwise use IP
    return req.user?.userId || req.ip;
  },
  skip: (req, res) => {
    // Skip for non-POST requests
    return req.method !== 'POST';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'יותר מדי נושאים בזמן קצר. אנא נסה שוב בעוד זמן.'
    });
  }
});

/**
 * Post creation rate limiter - Prevents spam
 * 10 posts per hour per user (identified by JWT)
 */
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 posts per hour
  message: 'יותר מדי פוסטים. אנא חכה לפני שתפרסם פוסט נוסף.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use JWT userId if available, otherwise use IP
    return req.user?.userId || req.ip;
  },
  skip: (req, res) => {
    // Skip for non-POST requests
    return req.method !== 'POST';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'יותר מדי פוסטים בזמן קצר. אנא נסה שוב בעוד זמן.'
    });
  }
});

/**
 * Comment creation rate limiter
 * 30 comments per hour per user
 */
const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each user to 30 comments per hour
  message: 'יותר מדי תגובות. אנא חכה לפני שתוסיף תגובה נוספת.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.user?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'יותר מדי תגובות בזמן קצר. אנא נסה שוב בעוד זמן.'
    });
  }
});

/**
 * Search rate limiter - Prevents abuse of search API
 * 30 searches per minute per IP
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: 'יותר מדי חיפושים. אנא חכה לפני שתבצע חיפוש נוסף.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'יותר מדי חיפושים בזמן קצר. אנא נסה שוב בעוד זמן.'
    });
  }
});

/**
 * General API limiter - Fallback for all routes
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  topicLimiter,
  postLimiter,
  commentLimiter,
  searchLimiter,
  generalLimiter
};
