const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');
const { commentLimiter } = require('../middleware/rateLimitMiddleware');

// GET all articles
router.get('/', articleController.getAllArticles);

// GET single article
router.get('/:id', articleController.getArticleById);

// POST create new article
router.post('/', authMiddleware, articleController.createArticle);

// PUT update article
router.put('/:id', authMiddleware, articleController.updateArticle);

// DELETE article
router.delete('/:id', authMiddleware, articleController.deleteArticle);

// POST like article
router.post('/:id/like', authMiddleware, articleController.likeArticle);

// POST add comment (with rate limiting)
router.post('/:id/comments', authMiddleware, commentLimiter, articleController.addComment);

// DELETE comment
router.delete('/:id/comments/:commentId', authMiddleware, articleController.deleteComment);

module.exports = router;
