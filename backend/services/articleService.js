const Article = require('../models/Article');
const { createNotification } = require('./notificationService');

async function getAllArticles({ tag, search, page = 1, limit = 10 }) {
  let query = {};
  if (tag) query.tags = tag;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { content: { $regex: search, $options: 'i' } }
  ];
  const articles = await Article.find(query)
    .populate('author', 'firstName lastName icon')
    .populate('category', 'name')
    .populate('comments.author', 'firstName lastName icon')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Article.countDocuments(query);
  return { articles, total, pages: Math.ceil(total / limit) };
}

async function getArticleById(id) {
  const article = await Article.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
    .populate('author', 'firstName lastName icon')
    .populate('category', 'name')
    .populate('comments.author', 'firstName lastName icon');
  if (!article) throw new Error('מאמר לא נמצא');
  return article;
}

async function createArticle({ title, content, summary, image, tags, categoryId }, authorId) {
  if (!title || !title.trim()) throw new Error('כותרת המאמר חסרה');
  if (!content || !content.trim()) throw new Error('תוכן המאמר חסר');
  const article = new Article({
    title: title.trim(), content: content.trim(),
    summary: summary ? summary.trim() : '',
    image: image || '',
    tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
    author: authorId,
    category: categoryId || null,
  });
  await article.save();
  await article.populate('author', 'firstName lastName icon');
  return article;
}

// ✅ נוסף isAdmin
async function updateArticle(id, { title, content, summary, image, tags, categoryId }, authorId, isAdmin = false) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');
  if (!isAdmin && article.author.toString() !== authorId) {
    const err = new Error('אין הרשאה לערוך');
    err.status = 403;
    throw err;
  }
  Object.assign(article, { title, content, summary, image, tags, category: categoryId || null, updatedAt: Date.now() });
  await article.save();
  return article;
}

// ✅ נוסף isAdmin
async function deleteArticle(id, authorId, isAdmin = false) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');
  if (!isAdmin && article.author.toString() !== authorId) {
    const err = new Error('אין הרשאה למחוק');
    err.status = 403;
    throw err;
  }
  await article.deleteOne();
  return { message: 'מאמר נמחק בהצלחה' };
}

async function likeArticle(id, userId) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');
  const liked = article.likes.includes(userId);
  liked ? article.likes.pull(userId) : article.likes.push(userId);
  await article.save();
  if (!liked) {
    await createNotification({ recipient: article.author, sender: userId, type: 'like', refModel: 'Article', refId: article._id });
  }
  return { likes: article.likes.length, liked: !liked };
}

async function addComment(id, { content }, userId) {
  const article = await Article.findById(id);
  if (!article) throw new Error('מאמר לא נמצא');
  article.comments.push({ content, author: userId });
  await article.save();
  await createNotification({ recipient: article.author, sender: userId, type: 'comment', refModel: 'Article', refId: article._id, text: content });
  await article.populate('comments.author', 'firstName lastName icon');
  return article.comments[article.comments.length - 1];
}

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

module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle, likeArticle, addComment, deleteComment };
