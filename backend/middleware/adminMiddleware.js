module.exports = (req, res, next) => {
  if (!req.user?.isAdmin) {
    const error = new Error('גישה נדחית. דרוש מנהל.');
    error.status = 403;
    return next(error);
  }
  next();
};
