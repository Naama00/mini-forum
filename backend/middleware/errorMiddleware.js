/**
 * Centralized Error Handler Middleware
 * Catches all errors thrown from controllers and services
 */

const logger = require('../config/logger');

function errorMiddleware(err, req, res, next) {
  // Default values
  let status = 500;
  let message = 'שגיאה במערכת';
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log error with timestamp
  logger.error({
    message: err.message,
    status: err.status || status,
    path: req.path,
    method: req.method,
    stack: isDevelopment ? err.stack : undefined
  }, 'Request error');

  // Determine status code based on error message
  if (err.message) {
    // 400 - Bad Request (validation errors)
    if (
      err.message.includes('חסר') ||
      err.message.includes('לא valid') ||
      err.message.includes('כבר רשום') ||
      err.message.includes('לפחות')
    ) {
      status = 400;
      message = err.message;
    }
    // 401 - Unauthorized / bad credentials
    else if (
      err.message.includes('הסיסמה שגויה') ||
      err.message.includes('המייל אינו קיים') ||
      err.message.includes('חשבון זה משתמש בכניסה עם Google') ||
      (err.message.includes('מייל') && err.message.includes('סיסמה'))
    ) {
      status = 401;
      message = err.message;
    }
    // 403 - Forbidden (authorization errors)
    else if (err.message.includes('אין הרשאה')) {
      status = 403;
      message = err.message;
    }
    // 404 - Not Found
    else if (
      err.message.includes('לא נמצא') ||
      err.message.includes('לא נמצאה')
    ) {
      status = 404;
      message = err.message;
    }
    // Custom status from error object
    else if (err.status) {
      status = err.status;
      message = err.message;
    }
    // Default to error message
    else {
      message = err.message;
    }
  }

  // Send response
  res.status(status).json({
    success: false,
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
}

module.exports = errorMiddleware;
