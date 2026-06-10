const { Topic } = require('../models/Topic');
const { Post } = require('../models/Post');
const { Category } = require('../models/Category');
const { User } = require('../models/User');
const cache = require('../config/cache');

/**
 * Create new topic with first post
 */
async function createTopic({ title, content, type, categoryId, tags, imageUrl }, userId, isAdmin = false) {
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
  respondsTo: [],
  imageUrl: imageUrl || null, 
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

/**
 * Update an existing topic (Title and Tags)
 */
async function updateTopic(topicId, { title, tags }, userId, isAdmin = false) {
  const topic = await Topic.findById(topicId);
  if (!topic) throw new Error('נושא לא נמצא');

  // בדיקת הרשאות עריכה (רק המחבר או אדמין)
  const authorId = topic.author?._id?.toString() || topic.author?.toString();
  if (!isAdmin && authorId !== userId) throw new Error('אין הרשאה לערוך נושא זה');

  // עדכון שדות במידה ונשלחו
  if (title && title.trim()) topic.title = title.trim();
  if (tags && Array.isArray(tags)) {
    if (tags.map(String).map((tag) => tag.toLowerCase()).includes('challenge') && !isAdmin) {
      throw new Error('רק מנהל מערכת יכול להוסיף תגית אתגר.');
    }
    topic.tags = tags;
  }

  await topic.save();

  // ניקוי Cache בהתאם לשינוי הנושא
  await cache.del(`topic:${topicId}`);
  await cache.del('categories:all');
  if (topic.category) await cache.del(`category:${topic.category.toString()}`);
  await cache.invalidate('trending:');

  return topic;
}

/**
 * Delete a topic and all its posts
 */
async function deleteTopic(topicId, userId, isAdmin = false) {
  const topic = await Topic.findById(topicId);
  if (!topic) throw new Error('נושא לא נמצא');

  const authorId = topic.author?._id?.toString() || topic.author?.toString();
  if (!isAdmin && authorId !== userId) throw new Error('אין הרשאה למחוק נושא זה');

  // מחק את כל הפוסטים של הנושא
  await Post.deleteMany({ _id: { $in: topic.posts } });

  // הסר מהקטגוריה
  await Category.findByIdAndUpdate(topic.category, { $pull: { topics: topic._id } });

  // הסר מהמשתמש
  await User.findByIdAndUpdate(authorId, { $pull: { 'links.topics': topic._id } });

  await Topic.findByIdAndDelete(topicId);

  // נקה cache
  await cache.del(`topic:${topicId}`);
  await cache.del('categories:all');
  if (topic.category) await cache.del(`category:${topic.category.toString()}`);
  await cache.invalidate('trending:');

  return { success: true, message: 'הנושא נמחק בהצלחה' };
}
const likeService = require('../services/likeService');

async function likeTopic(req, res, next) {
  try {
    const result = await likeService.likeTopic(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) { next(err); }
}
module.exports = {
  createTopic,
  getTopics,
  deleteTopic,
  updateTopic,
  likeTopic
};  

