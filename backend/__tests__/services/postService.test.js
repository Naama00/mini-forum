jest.mock('../../config/cache', () => ({
  del: jest.fn().mockResolvedValue(0),
}));

jest.mock('../../models/Post', () => {
  const saveFn = jest.fn().mockResolvedValue(undefined);
  function MockPost(data) {
    Object.assign(this, data);
    this.save = saveFn;
    this.toObject = () => ({ ...data });
    this._id = data._id || 'post-1';
  }
  MockPost.findById = jest.fn();
  MockPost.findByIdAndDelete = jest.fn();
  MockPost._saveFn = saveFn;
  return { Post: MockPost };
});

jest.mock('../../models/Topic', () => {
  const TopicMock = { findById: jest.fn(), findByIdAndUpdate: jest.fn(), updateMany: jest.fn() };
  return { Topic: TopicMock };
});

jest.mock('../../models/User', () => {
  const UserMock = { findById: jest.fn(), findByIdAndUpdate: jest.fn(), updateMany: jest.fn() };
  return { User: UserMock };
});

const { formatPublicUserData, createPost, updatePost, deletePost, votePost } = require('../../services/postService');
const { Post } = require('../../models/Post');
const { Topic } = require('../../models/Topic');
const { User } = require('../../models/User');
const cache = require('../../config/cache');

describe('postService', () => {
  afterEach(() => jest.clearAllMocks());

  // ── formatPublicUserData ──────────────────────────────────────────────────
  describe('formatPublicUserData', () => {
    it('returns null for falsy input', () => {
      expect(formatPublicUserData(null)).toBeNull();
      expect(formatPublicUserData(undefined)).toBeNull();
    });

    it('picks only public fields', () => {
      const user = {
        _id: '1',
        firstName: 'A',
        lastName: 'B',
        icon: 'pic.png',
        city: 'TLV',
        votes: 5,
        isActive: true,
        password: 'secret',
        email: 'a@b.com',
      };

      const result = formatPublicUserData(user);

      expect(result).toEqual({
        _id: '1',
        firstName: 'A',
        lastName: 'B',
        icon: 'pic.png',
        city: 'TLV',
        votes: 5,
        isActive: true,
      });
      expect(result.password).toBeUndefined();
      expect(result.email).toBeUndefined();
    });
  });

  // ── createPost ────────────────────────────────────────────────────────────
  describe('createPost', () => {
    it('throws when content is empty', async () => {
      await expect(createPost('', 'topic1', 'user1')).rejects.toThrow('תוכן חסר');
      await expect(createPost('   ', 'topic1', 'user1')).rejects.toThrow('תוכן חסר');
    });

    it('throws when topicId is missing', async () => {
      await expect(createPost('hello', null, 'user1')).rejects.toThrow('topicId חסר');
    });

    it('throws when topic does not exist', async () => {
      Topic.findById.mockResolvedValue(null);
      await expect(createPost('hello', 'topic1', 'user1')).rejects.toThrow('נושא לא נמצא');
    });

    it('throws when author does not exist', async () => {
      Topic.findById.mockResolvedValue({ _id: 'topic1' });
      User.findById.mockResolvedValue(null);
      await expect(createPost('hello', 'topic1', 'user1')).rejects.toThrow('משתמש לא נמצא');
    });

    it('creates post, links to topic/user, and invalidates cache', async () => {
      Topic.findById.mockResolvedValue({ _id: 'topic1' });
      Topic.findByIdAndUpdate.mockResolvedValue(null);
      User.findById.mockResolvedValue({
        _id: 'user1',
        firstName: 'A',
        lastName: 'B',
        icon: '',
        city: '',
        votes: 0,
        isActive: true,
        toObject() { return { _id: 'user1', firstName: 'A', lastName: 'B', icon: '', city: '', votes: 0, isActive: true }; },
      });
      User.findByIdAndUpdate.mockResolvedValue(null);

      const result = await createPost('hello world', 'topic1', 'user1');

      expect(result.success).toBe(true);
      expect(Topic.findByIdAndUpdate).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(cache.del).toHaveBeenCalledWith('user:user1');
      expect(cache.del).toHaveBeenCalledWith('topic:topic1');
    });
  });

  // ── updatePost ────────────────────────────────────────────────────────────
  describe('updatePost', () => {
    it('throws when post not found', async () => {
      Post.findById.mockResolvedValue(null);
      await expect(updatePost('p1', { content: 'x' }, 'u1')).rejects.toThrow('פוסט לא נמצא');
    });

    it('throws when user is not the author', async () => {
      Post.findById.mockResolvedValue({
        author: { _id: { toString: () => 'other-user' } },
        save: jest.fn(),
      });
      await expect(updatePost('p1', { content: 'x' }, 'u1')).rejects.toThrow('אין הרשאה');
    });

    it('updates post content when authorized', async () => {
      const saveFn = jest.fn().mockResolvedValue(undefined);
      const post = {
        author: { _id: { toString: () => 'u1' } },
        content: 'old',
        save: saveFn,
      };
      Post.findById.mockResolvedValue(post);

      const result = await updatePost('p1', { content: 'new' }, 'u1');

      expect(result.success).toBe(true);
      expect(post.content).toBe('new');
      expect(saveFn).toHaveBeenCalled();
    });
  });

  // ── deletePost ────────────────────────────────────────────────────────────
  describe('deletePost', () => {
    it('throws when post not found', async () => {
      Post.findById.mockResolvedValue(null);
      await expect(deletePost('p1', 'u1')).rejects.toThrow('פוסט לא נמצא');
    });

    it('throws when user is not the author', async () => {
      Post.findById.mockResolvedValue({
        author: { _id: { toString: () => 'other-user' } },
      });
      await expect(deletePost('p1', 'u1')).rejects.toThrow('אין הרשאה');
    });

    it('deletes post, unlinks from topic/user, and invalidates cache', async () => {
      Post.findById.mockResolvedValue({
        _id: 'p1',
        author: { _id: { toString: () => 'u1' } },
        topicId: { toString: () => 't1' },
      });
      Post.findByIdAndDelete.mockResolvedValue(null);
      Topic.updateMany.mockResolvedValue(null);
      User.updateMany.mockResolvedValue(null);

      const result = await deletePost('p1', 'u1');

      expect(result.success).toBe(true);
      expect(Post.findByIdAndDelete).toHaveBeenCalledWith('p1');
      expect(cache.del).toHaveBeenCalledWith('user:u1');
      expect(cache.del).toHaveBeenCalledWith('topic:t1');
    });
  });

  // ── votePost ──────────────────────────────────────────────────────────────
  describe('votePost', () => {
    it('throws when post not found', async () => {
      Post.findById.mockResolvedValue(null);
      await expect(votePost('p1', 'up', 'u1')).rejects.toThrow('פוסט לא נמצא');
    });

    it('increments vote count for "up"', async () => {
      const post = { numberOfVotes: 3, author: { _id: 'au' }, save: jest.fn() };
      Post.findById.mockResolvedValue(post);
      User.findByIdAndUpdate.mockResolvedValue(null);

      const result = await votePost('p1', 'up', 'u1');

      expect(result.success).toBe(true);
      expect(post.numberOfVotes).toBe(4);
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('decrements vote count for "down"', async () => {
      const post = { numberOfVotes: 3, author: { _id: 'au' }, save: jest.fn() };
      Post.findById.mockResolvedValue(post);

      const result = await votePost('p1', 'down', 'u1');

      expect(result.success).toBe(true);
      expect(post.numberOfVotes).toBe(2);
    });

    it('does not change count for neutral', async () => {
      const post = { numberOfVotes: 3, author: { _id: 'au' }, save: jest.fn() };
      Post.findById.mockResolvedValue(post);

      const result = await votePost('p1', 'neutral', 'u1');

      expect(post.numberOfVotes).toBe(3);
    });
  });
});
