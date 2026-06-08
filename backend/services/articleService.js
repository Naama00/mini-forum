const Article = require('../models/Article');
const { assertOwnership, toggleLike, addComment, deleteComment } = require('../utils/serviceHelpers');

const NOT_FOUND = 'מאמר לא נמצא';

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
  const article = await Article.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'firstName lastName icon')
    .populate('category', 'name')
    .populate('comments.author', 'firstName lastName icon');

  if (!article) throw new Error(NOT_FOUND);
  return article;
}

async function createArticle({ title, content, summary, image, tags, categoryId }, authorId) {
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
    author: authorId,
    category: categoryId || null,
  });
  
  await article.save();
  await article.populate('author', 'firstName lastName icon');
  return article;
}

async function updateArticle(id, { title, content, summary, image, tags, categoryId }, authorId) {
  const article = await Article.findById(id);
  if (!article) throw new Error(NOT_FOUND);
  assertOwnership(article, authorId, 'לערוך');

  Object.assign(article, { title, content, summary, image, tags, category: categoryId || null, updatedAt: Date.now() });
  await article.save();
  return article;
}

async function deleteArticle(id, authorId) {
  const article = await Article.findById(id);
  if (!article) throw new Error(NOT_FOUND);
  assertOwnership(article, authorId, 'למחוק');

  await article.deleteOne();
  return { message: 'מאמר נמחק בהצלחה' };
}

const likeArticle = (id, userId) => toggleLike(Article, 'Article', id, userId, NOT_FOUND);
const addArticleComment = (id, body, userId) => addComment(Article, 'Article', id, body, userId, NOT_FOUND);
const deleteArticleComment = (id, commentId, userId) => deleteComment(Article, id, commentId, userId, NOT_FOUND);

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  addComment: addArticleComment,
  deleteComment: deleteArticleComment
};
