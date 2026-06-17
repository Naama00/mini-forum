const jwt = require('jsonwebtoken');

const SECRET = 'devhub-secret-key-change-in-production';

// The middleware reads process.env at module level, so we must set the var
// before requiring it.
process.env.JWT_SECRET = SECRET;
const authMiddleware = require('../../middleware/authMiddleware');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('authMiddleware', () => {
  it('calls next with 401 error when no Authorization header', () => {
    const req = { headers: {} };
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('No token'), status: 401 })
    );
  });

  it('calls next with 400 error for malformed Authorization header', () => {
    const req = { headers: { authorization: 'Token abc' } };
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Invalid authorization'), status: 400 })
    );
  });

  it('calls next with 401 error for an invalid/expired token', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.here' } };
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Invalid or expired'), status: 401 })
    );
  });

  it('attaches req.user and calls next() for a valid token (userId payload)', () => {
    const token = jwt.sign(
      { userId: 'user123', email: 'a@b.com', isAdmin: true, roles: ['admin'] },
      SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(); // no error
    expect(req.user).toMatchObject({
      id: 'user123',
      userId: 'user123',
      isAdmin: true,
      roles: ['admin'],
    });
  });

  it('attaches req.user from "id" field when "userId" is absent', () => {
    const token = jwt.sign(
      { id: 'id456', email: 'x@y.com', isAdmin: false },
      SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: 'id456', userId: 'id456', isAdmin: false, roles: [] });
  });

  it('is case-insensitive for "Bearer" prefix', () => {
    const token = jwt.sign({ userId: 'u1' }, SECRET, { algorithm: 'HS256' });
    const req = { headers: { authorization: `bearer ${token}` } };
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user.id).toBe('u1');
  });
});
