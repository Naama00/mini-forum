jest.mock('../../config/logger', () => ({
  error: jest.fn(), info: jest.fn(), warn: jest.fn(),
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

jest.mock('../../models/User', () => {
  const saveFn = jest.fn();
  function MockUser(data) {
    Object.assign(this, data);
    this._id = data._id || 'new-user-id';
    this.save = saveFn;
  }
  MockUser.findOne = jest.fn();
  MockUser._saveFn = saveFn;
  return { User: MockUser };
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('../../services/authService');
const { User } = require('../../models/User');

describe('authService', () => {
  afterEach(() => jest.clearAllMocks());

  // ── registerUser ──────────────────────────────────────────────────────────
  describe('registerUser', () => {
    it('throws when required fields are missing', async () => {
      await expect(registerUser({ firstName: 'A' })).rejects.toThrow('יש למלא');
      await expect(registerUser({ firstName: 'A', lastName: 'B', email: 'e' })).rejects.toThrow('יש למלא');
    });

    it('throws when email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'a@b.com' });

      await expect(registerUser({
        firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'Pass1234',
      })).rejects.toThrow('כבר רשומה');
    });

    it('registers a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User._saveFn.mockResolvedValue(undefined);

      const result = await registerUser({
        firstName: 'A', lastName: 'B', email: 'new@test.com', password: 'Pass1234',
      });

      expect(result.token).toBeDefined();
      expect(result.user.firstName).toBe('A');
      expect(result.user.email).toBe('new@test.com');
      expect(User._saveFn).toHaveBeenCalled();

      // Verify the token is valid
      const decoded = jwt.decode(result.token);
      expect(decoded.email).toBe('new@test.com');
    });
  });

  // ── loginUser ─────────────────────────────────────────────────────────────
  describe('loginUser', () => {
    it('throws when email or password is missing', async () => {
      await expect(loginUser('', 'pass')).rejects.toThrow('יש להזין');
      await expect(loginUser('a@b.com', '')).rejects.toThrow('יש להזין');
    });

    it('throws when user is not found', async () => {
      User.findOne.mockResolvedValue(null);
      await expect(loginUser('no@one.com', 'pass')).rejects.toThrow('המייל אינו קיים');
    });

    it('throws when user has no password (Google account)', async () => {
      User.findOne.mockResolvedValue({ email: 'g@g.com', password: null });
      await expect(loginUser('g@g.com', 'pass')).rejects.toThrow('Google');
    });

    it('throws on wrong password', async () => {
      User.findOne.mockResolvedValue({
        email: 'a@b.com',
        password: await bcrypt.hash('correct', 10),
      });

      await expect(loginUser('a@b.com', 'wrong')).rejects.toThrow('הסיסמה שגויה');
    });

    it('returns token and user on valid credentials', async () => {
      const hashed = await bcrypt.hash('Pass1234', 10);
      const saveFn = jest.fn().mockResolvedValue(undefined);
      User.findOne.mockResolvedValue({
        _id: 'u1',
        email: 'a@b.com',
        password: hashed,
        firstName: 'A',
        lastName: 'B',
        icon: '',
        isAdmin: false,
        lastLogin: null,
        isConnected: false,
        save: saveFn,
      });

      const result = await loginUser('a@b.com', 'Pass1234');

      expect(result.token).toBeDefined();
      expect(result.user._id).toBe('u1');
      expect(saveFn).toHaveBeenCalled();
    });
  });
});
