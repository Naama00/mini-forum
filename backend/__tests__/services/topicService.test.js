jest.mock('../../config/cache', () => ({
  del: jest.fn().mockResolvedValue(0),
  invalidate: jest.fn().mockResolvedValue(0),
}));

jest.mock('../../models/Post', () => {
  const saveFn = jest.fn().mockResolvedValue(undefined);
  function MockPost(data) {
    Object.assign(this, data);
    this._id = data._id || 'post-1';
    this.save = saveFn;
  }
  MockPost._saveFn = saveFn;
  return { Post: MockPost };
});

jest.mock('../../models/Topic', () => {
  const saveFn = jest.fn().mockResolvedValue(undefined);
  function MockTopic(data) {
    Object.assign(this, data);
    this._id = data._id || 'topic-1';
    this.save = saveFn;
  }
  MockTopic.find = jest.fn();
  MockTopic.populate = jest.fn();
  MockTopic._saveFn = saveFn;
  return { Topic: MockTopic };
});

jest.mock('../../models/Category', () => {
  const CategoryMock = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  };
  return { Category: CategoryMock };
});

jest.mock('../../models/User', () => {
  const UserMock = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  };
  return { User: UserMock };
});

const { createTopic, getTopics } = require('../../services/topicService');
const { Category } = require('../../models/Category');
const { User } = require('../../models/User');
const { Topic } = require('../../models/Topic');
const cache = require('../../config/cache');

describe('topicService', () => {
  afterEach(() => jest.clearAllMocks());

  // ── createTopic ───────────────────────────────────────────────────────────
  describe('createTopic', () => {
    it('throws when title is missing', async () => {
      await expect(createTopic({ content: 'x', categoryId: 'c1' }, 'u1'))
        .rejects.toThrow('כותרת חסרה');
    });

    it('throws when content is missing', async () => {
      await expect(createTopic({ title: 'T', categoryId: 'c1' }, 'u1'))
        .rejects.toThrow('תוכן חסר');
    });

    it('throws when categoryId is missing', async () => {
      await expect(createTopic({ title: 'T', content: 'x' }, 'u1'))
        .rejects.toThrow('קטגוריה חסרה');
    });

    it('throws when non-admin tries to create challenge', async () => {
      await expect(
        createTopic({ title: 'T', content: 'x', categoryId: 'c1', tags: ['challenge'] }, 'u1', false)
      ).rejects.toThrow('רק למנהל');
    });

    it('allows admin to create challenge', async () => {
      Category.findById.mockResolvedValue({ _id: 'c1' });
      User.findById.mockResolvedValue({
        _id: 'u1', firstName: 'A', lastName: 'B',
        toObject() { return { _id: 'u1', firstName: 'A', lastName: 'B' }; },
      });
      Topic._saveFn.mockResolvedValue(undefined);

      const result = await createTopic(
        { title: 'Challenge', content: 'body', categoryId: 'c1', tags: ['challenge'] },
        'u1',
        true
      );

      expect(result.title).toBe('Challenge');
    });

    it('throws when category not found', async () => {
      Category.findById.mockResolvedValue(null);
      await expect(
        createTopic({ title: 'T', content: 'x', categoryId: 'bad' }, 'u1')
      ).rejects.toThrow('קטגוריה לא נמצאה');
    });

    it('throws when user not found', async () => {
      Category.findById.mockResolvedValue({ _id: 'c1' });
      User.findById.mockResolvedValue(null);
      await expect(
        createTopic({ title: 'T', content: 'x', categoryId: 'c1' }, 'bad-user')
      ).rejects.toThrow('משתמש לא נמצא');
    });

    it('creates topic with first post and invalidates caches', async () => {
      Category.findById.mockResolvedValue({ _id: 'c1' });
      User.findById.mockResolvedValue({
        _id: 'u1', firstName: 'A', lastName: 'B',
        toObject() { return { _id: 'u1', firstName: 'A', lastName: 'B' }; },
      });
      Topic._saveFn.mockResolvedValue(undefined);

      const result = await createTopic(
        { title: 'My Topic', content: 'Body text', categoryId: 'c1', tags: ['js'] },
        'u1'
      );

      expect(result.title).toBe('My Topic');
      expect(result.tags).toEqual(['js']);
      expect(cache.del).toHaveBeenCalledWith('user:u1');
      expect(cache.del).toHaveBeenCalledWith('categories:all');
      expect(cache.invalidate).toHaveBeenCalledWith('trending:');
    });
  });

  // ── getTopics ─────────────────────────────────────────────────────────────
  describe('getTopics', () => {
    it('returns topics with post counts', async () => {
      const fakeTopics = [
        { _id: 't1', title: 'T1', posts: ['p1', 'p2'] },
      ];

      const chain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(fakeTopics),
      };
      Topic.find.mockReturnValue(chain);
      Topic.populate.mockResolvedValue(
        fakeTopics.map(t => ({ ...t, postsCount: t.posts.length }))
      );

      const result = await getTopics({ limit: 12, sort: 'newest' });

      expect(result).toHaveLength(1);
      expect(result[0].postsCount).toBe(2);
    });

    it('filters by tag when provided', async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      Topic.find.mockReturnValue(chain);
      Topic.populate.mockResolvedValue([]);

      await getTopics({ tag: 'python' });

      expect(Topic.find).toHaveBeenCalledWith({ tags: 'python' });
    });

    it('clamps limit between 1 and 100', async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      Topic.find.mockReturnValue(chain);
      Topic.populate.mockResolvedValue([]);

      await getTopics({ limit: 999 });

      expect(chain.limit).toHaveBeenCalledWith(100);
    });
  });
});
