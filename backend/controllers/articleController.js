const articleService = require('../services/articleService');

async function getAllArticles(req, res, next) {
  try { res.json(await articleService.getAllArticles(req.query)); } catch (err) { next(err); }
}

async function getArticleById(req, res, next) {
  try { res.json(await articleService.getArticleById(req.params.id)); } catch (err) { next(err); }
}

async function createArticle(req, res, next) {
  try { res.status(201).json(await articleService.createArticle(req.body, req.user.userId)); } catch (err) { next(err); }
}

async function updateArticle(req, res, next) {
  try {
    // ✅ מעביר isAdmin
    res.json(await articleService.updateArticle(req.params.id, req.body, req.user.userId, req.user.isAdmin));
  } catch (err) { next(err); }
}

async function deleteArticle(req, res, next) {
  try {
    // ✅ מעביר isAdmin
    res.json(await articleService.deleteArticle(req.params.id, req.user.userId, req.user.isAdmin));
  } catch (err) { next(err); }
}

async function likeArticle(req, res, next) {
  try { res.json(await articleService.likeArticle(req.params.id, req.user.userId)); } catch (err) { next(err); }
}

async function addComment(req, res, next) {
  try { res.status(201).json(await articleService.addComment(req.params.id, req.body, req.user.userId)); } catch (err) { next(err); }
}

async function deleteComment(req, res, next) {
  try { res.json(await articleService.deleteComment(req.params.id, req.params.commentId, req.user.userId)); } catch (err) { next(err); }
}

module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle, likeArticle, addComment, deleteComment };
