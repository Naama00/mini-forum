// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET || 'devhub-secret-key-change-in-production';

// module.exports = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     const error = new Error('לא מחובר');
//     error.status = 401;
//     return next(error);
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     const error = new Error('טוקן לא תקין');
//     error.status = 401;
//     next(error);
//   }
// };
const jwt = require('jsonwebtoken');

// Enforce strict secret check during initialization phase to prevent silent failures
const JWT_SECRET = process.env.JWT_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
  if (IS_PRODUCTION) {
    throw new Error('CRITICAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing in production!');
  }
  console.warn('WARNING: JWT_SECRET is not defined. Using a volatile fallback key for development.');
}

// Volatile fallback only for local testing, isolated from production
const EffectiveSecret = JWT_SECRET || 'devhub-temporary-volatile-development-secret-key-12345';

/**
 * Express middleware to authenticate requests via JWT.
 * Optimized for maximum performance and hardened against key confusion/signature exploits.
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new Error('Access denied. No token provided.');
    error.status = 401;
    return next(error);
  }

  // Strictly enforce the "Bearer <token>" scheme using a high-performance regex
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const error = new Error('Invalid authorization format. Use "Bearer <token>".');
    error.status = 400;
    return next(error);
  }

  const token = match[1];

  try {
    // Hardened verification with explicit algorithm enforcement
    const decoded = jwt.verify(token, EffectiveSecret, {
      algorithms: ['HS256'],
      // You can add 'issuer' or 'audience' checks here for enhanced security if applicable
    });

    // Sanitized attachment of user context
    req.user = {
      id: decoded.id,
      roles: decoded.roles || [],
      // Only extract what you explicitly trust and need
    };

    next();
  } catch (err) {
    const error = new Error('Invalid or expired token.');
    error.status = 401;
    // Prevent leaking internal error details in production
    error.details = IS_PRODUCTION ? undefined : err.message;
    next(error);
  }
};