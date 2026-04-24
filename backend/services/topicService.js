const { Topic } = require('../models/Topic');
const { Post } = require('../models/Post');
const { Category } = require('../models/Category');
const { User } = require('../models/User');

/**
 * Create new topic with first post
 */
async function createTopic({ title, content, type, categoryId, tags }, userId) {
  if (!title?.trim()) throw new Error('כותרת חסרה');
  if (!content?.trim()) throw new Error('תוכן חסר');
  if (!categoryId) throw new Error('קטגוריה חסרה');

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

  return topic;
}

module.exports = {
  createTopic
};