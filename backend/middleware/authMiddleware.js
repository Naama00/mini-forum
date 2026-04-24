const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'devhub-secret-key-change-in-production';

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    const error = new Error('לא מחובר');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error('טוקן לא תקין');
    error.status = 401;
    next(error);
  }
};
