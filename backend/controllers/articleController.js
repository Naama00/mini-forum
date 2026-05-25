const articleService = require('../services/articleService');

/**
 * GET all articles
 */
async function getAllArticles(req, res, next) {
  try {
    const result = await articleService.getAllArticles(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET single article by ID
 */
async function getArticleById(req, res, next) {
  try {
    const article = await articleService.getArticleById(req.params.id);
    res.json(article);
  } catch (err) {
    next(err);
  }
}

/**
 * POST create new article
 */
async function createArticle(req, res, next) {
  try {
    const article = await articleService.createArticle(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      message: 'מאמר נוצר בהצלחה',
      data: article
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT update article
 */
async function updateArticle(req, res, next) {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body, req.user.userId);
    res.json(article);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE article
 */
async function deleteArticle(req, res, next) {
  try {
    const result = await articleService.deleteArticle(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST like/unlike article
 */
async function likeArticle(req, res, next) {
  try {
    const result = await articleService.likeArticle(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST add comment to article
 */
async function addComment(req, res, next) {
  try {
    const comment = await articleService.addComment(req.params.id, req.body, req.user.userId);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE remove comment from article
 */
async function deleteComment(req, res, next) {
  try {
    const result = await articleService.deleteComment(req.params.id, req.params.commentId, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
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
