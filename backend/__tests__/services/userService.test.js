jest.mock('../../config/cache', () => ({
  del: jest.fn().mockResolvedValue(0),
}));

jest.mock('../../models/User', () => {
  const UserMock = {
    findByIdAndUpdate: jest.fn(),
  };
  return { User: UserMock };
});

const { formatPublicUserData, updateUser } = require('../../services/userService');
const { User } = require('../../models/User');
const cache = require('../../config/cache');

describe('userService', () => {
  afterEach(() => jest.clearAllMocks());

  // ── formatPublicUserData ──────────────────────────────────────────────────
  describe('formatPublicUserData', () => {
    it('returns null for falsy input', () => {
      expect(formatPublicUserData(null)).toBeNull();
      expect(formatPublicUserData(undefined)).toBeNull();
    });

    it('strips sensitive fields', () => {
      const user = {
        _id: '1', firstName: 'A', lastName: 'B', icon: 'x',
        city: 'TLV', votes: 2, isActive: true,
        password: 'hash', email: 'a@b.com', isAdmin: true,
      };
      const result = formatPublicUserData(user);
      expect(result.password).toBeUndefined();
      expect(result.email).toBeUndefined();
      expect(result.isAdmin).toBeUndefined();
      expect(result.firstName).toBe('A');
    });
  });

  // ── updateUser ────────────────────────────────────────────────────────────
  describe('updateUser', () => {
    it('throws when userId !== requestingUserId', async () => {
      await expect(updateUser('u1', 'u2', { firstName: 'X' }))
        .rejects.toThrow('אין הרשאה');
    });

    it('throws when user not found in DB', async () => {
      // findByIdAndUpdate returns a query-like object with .select()
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(updateUser('u1', 'u1', { firstName: 'X' }))
        .rejects.toThrow('משתמש לא נמצא');
    });

    it('updates profile and invalidates cache', async () => {
      const updatedDoc = {
        _id: 'u1', firstName: 'New', lastName: 'Name', icon: '',
        city: 'NYC', votes: 0, isActive: true,
      };
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedDoc),
      });

      const result = await updateUser('u1', 'u1', {
        firstName: 'New', lastName: 'Name', city: 'NYC',
      });

      expect(result.firstName).toBe('New');
      expect(cache.del).toHaveBeenCalledWith('user:u1');
    });
  });
});
