const { Topic } = require('../models/Topic');
const { Post } = require('../models/Post');
const { Category } = require('../models/Category');
const { User } = require('../models/User');
const cache = require('../cache');

/**
 * Create new topic with first post
 */
async function createTopic({ title, content, type, categoryId, tags }, userId, isAdmin = false) {
  if (!title?.trim()) throw new Error('כותרת חסרה');
  if (!content?.trim()) throw new Error('תוכן חסר');
  if (!categoryId) throw new Error('קטגוריה חסרה');

  if (Array.isArray(tags) && tags.map(String).map((tag) => tag.toLowerCase()).includes('challenge') && !isAdmin) {
    throw new Error('יצירת אתגר קוד בפורום מותרת רק למנהל.');
  }

  const category = await Category.findById(categoryId);
  if (!category) throw new Error('קטגוריה לא נמצאה');

  const author = await User.findById(userId);
  if (!author) throw new Error('משתמש לא נמצא');

  const firstPost = new Post({
    content: content.trim(),
    numberOfVotes: 0,
    author: author.toObject(),
    createdAt: new Date(),
    isSolution: false,
    respondsTo: []
  });
  await firstPost.save();

  const topic = new Topic({
    title: title.trim(),
    type: type || 'question',
    author: author.toObject(),
    createdAt: new Date(),
    votes: 0,
    isPinned: false,
    isClosed: false,
    posts: [firstPost._id],
    tags: tags || [],
    category: categoryId
  });
  await topic.save();

  await Category.findByIdAndUpdate(categoryId, { $push: { topics: topic._id } });
  await User.findByIdAndUpdate(userId, { $push: { 'links.topics': topic._id } });

  await cache.del(`user:${userId}`);
  await cache.del('categories:all');
  await cache.del(`category:${categoryId}`);
  await cache.invalidate('trending:');
  await cache.del('statistics:summary');

  return topic;
}

/**
 * Fetch topics list with pagination / sorting support
 */
async function getTopics({ limit = 12, sort = 'newest', tag }) {
  const query = {};
  if (tag) {
    query.tags = tag;
  }
  const sortOrder = sort === 'top'
    ? { votes: -1, createdAt: -1 }
    : sort === 'trending'
      ? { votes: -1, createdAt: -1 }
      : { createdAt: -1 };

  const topics = await Topic.find(query)
    .sort(sortOrder)
    .limit(Math.max(1, Math.min(Number(limit) || 12, 100)))
    .populate('author', 'firstName lastName icon')
    .populate('category', 'name')
    .lean();

  // Preserve the full post count while only returning the first post content for list rendering
  const topicsWithCounts = await Topic.populate(topics.map((topic) => ({
    ...topic,
    postsCount: (topic.posts || []).length,
  })), {
    path: 'posts',
    select: 'content',
    options: { sort: { createdAt: 1 } },
    perDocumentLimit: 1,
  });

  return topicsWithCounts;
}

module.exports = {
  createTopic,
  getTopics
};