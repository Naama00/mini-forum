const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const { commentLimiter } = require('../middleware/rateLimitMiddleware');

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.post('/', authMiddleware, jobController.createJob);
router.put('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);
router.post('/:id/like', authMiddleware, jobController.likeJob);
router.post('/:id/comments', authMiddleware, commentLimiter, jobController.addComment);
router.delete('/:id/comments/:commentId', authMiddleware, jobController.deleteComment);

module.exports = router;
