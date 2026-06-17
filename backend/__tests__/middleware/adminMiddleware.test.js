const adminMiddleware = require('../../middleware/adminMiddleware');

function buildRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('adminMiddleware', () => {
  it('calls next() when req.user.isAdmin is true', () => {
    const req = { user: { isAdmin: true } };
    const res = buildRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with 403 error when user is not admin', () => {
    const req = { user: { isAdmin: false } };
    const res = buildRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403 })
    );
  });

  it('calls next with 403 error when req.user is undefined', () => {
    const req = {};
    const res = buildRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403 })
    );
  });

  it('calls next with 403 error when req.user is null', () => {
    const req = { user: null };
    const res = buildRes();
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403 })
    );
  });
});
