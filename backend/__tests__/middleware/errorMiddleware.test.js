// Silence pino logger during tests
jest.mock('../../config/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

const errorMiddleware = require('../../middleware/errorMiddleware');

function buildRes() {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  return res;
}

function buildReq(overrides = {}) {
  return { path: '/test', method: 'GET', ...overrides };
}

describe('errorMiddleware', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => { process.env.NODE_ENV = originalEnv; });

  it('returns 400 for validation errors containing "חסר"', () => {
    const err = new Error('שם חסר');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'שם חסר' })
    );
  });

  it('returns 400 for "כבר רשום" error', () => {
    // Use exact substring the middleware checks: "כבר רשום" (with final mem)
    const err = new Error('המשתמש כבר רשום במערכת');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 for "הסיסמה שגויה" error', () => {
    const err = new Error('הסיסמה שגויה');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 for "המייל אינו קיים" error', () => {
    const err = new Error('המייל אינו קיים במערכת');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 for Google-only account error', () => {
    const err = new Error('חשבון זה משתמש בכניסה עם Google');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 for "אין הרשאה" error', () => {
    const err = new Error('אין הרשאה לפעולה זו');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 404 for "לא נמצא" error', () => {
    const err = new Error('פוסט לא נמצא');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 for "לא נמצאה" error', () => {
    const err = new Error('קטגוריה לא נמצאה');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('uses err.status when set and no keyword match', () => {
    const err = new Error('custom error');
    err.status = 422;
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'custom error' })
    );
  });

  it('falls back to 500 for unknown errors', () => {
    const err = new Error('something broke');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('includes stack trace in development mode', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('dev error');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    const body = res.json.mock.calls[0][0];
    expect(body.stack).toBeDefined();
  });

  it('excludes stack trace in production mode', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('prod error');
    const res = buildRes();

    errorMiddleware(err, buildReq(), res, jest.fn());

    const body = res.json.mock.calls[0][0];
    expect(body.stack).toBeUndefined();
  });
});
