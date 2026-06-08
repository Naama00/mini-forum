const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set');
}

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
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Sanitized attachment of user context supporting both userId and id from token payload
    req.user = {
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id,
      roles: decoded.roles || [],
      isAdmin: decoded.isAdmin || false,
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