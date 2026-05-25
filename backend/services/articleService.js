const Article = require('../models/Article');
const { createNotification } = require('./notificationService');

/**
 * Get all articles with optional filters
 */
async function getAllArticles({ tag, search, page = 1, limit = 10 }) {
  let query = {};
  if (tag) query.tags = tag;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { content: { $regex: search, $options: 'i' } }
  ];

  const articles = await Article.find(query)
    .populate('author', 'firstName lastName icon')
    .populate('comments.author', 'firstName lastName icon')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Article.countDocuments(query);
  return { articles, total, pages: Math.ceil(total / limit) };
}

/**
 * Get single article by ID and increment views
 */
async function getArticleById(id) {
  const article = await Article.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'firstName lastName icon')
    .populate('comments.author', 'firstName lastName icon');

  if (!article) throw new Error('מאמר לא נמצא');
  return article;
}

/**
 * Create new article
 */
async function createArticle({ title, content, summary, image, tags }, authorId) {
  if (!title || !title.trim()) {
    throw new Error('כותרת המאמר חסרה');
  }
  if (!content || !content.trim()) {
    throw new Error('תוכן המאמר חסר');
  }
  
  const article = new Article({
    title: title.trim(),
    content: content.trim(),
    summary: summary ? summary.trim() : '',
    image: image || '',
    tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
    author: authorId
  });
  
  await article.save();
  await article.populate('author', 'firstName lastName icon');
  return article;
}

/**
 * Update article
 */
async function updateArticle(id, { title, content, summary, image, tags }, authorId) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');
  if (article.author.toString() !== authorId) throw new Error('אין הרשאה לערוך');

  Object.assign(article, { title, content, summary, image, tags, updatedAt: Date.now() });
  await article.save();
  return article;
}

/**
 * Delete article
 */
async function deleteArticle(id, authorId) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');
  if (article.author.toString() !== authorId) throw new Error('אין הרשאה למחוק');

  await article.deleteOne();
  return { message: 'מאמר נמחק בהצלחה' };
}

/**
 * Like/unlike article
 */
async function likeArticle(id, userId) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');

  const liked = article.likes.includes(userId);
  if (liked) {
    article.likes.pull(userId);
  } else {
    article.likes.push(userId);
  }
  await article.save();

  if (!liked) {
    await createNotification({
      recipient: article.author,
      sender: userId,
      type: 'like',
      refModel: 'Article',
      refId: article._id,
    });
  }

  return { likes: article.likes.length, liked: !liked };
}

/**
 * Add comment to article
 */
async function addComment(id, { content }, userId) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');

  const comment = { content, author: userId };
  article.comments.push(comment);
  await article.save();

  await createNotification({
    recipient: article.author,
    sender: userId,
    type: 'comment',
    refModel: 'Article',
    refId: article._id,
    text: content
  });

  await article.populate('comments.author', 'firstName lastName icon');
  const newComment = article.comments[article.comments.length - 1];
  return newComment;
}

/**
 * Delete comment from article
 */
async function deleteComment(id, commentId, userId) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');

  const comment = article.comments.id(commentId);
  if (!comment) throw new Error('תגובה לא נמצאה');
  if (comment.author.toString() !== userId) throw new Error('אין הרשאה למחוק');

  comment.deleteOne();
  await article.save();
  return { message: 'תגובה נמחקה' };
}

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  addComment,
  deleteComment
};