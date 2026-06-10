const postService = require('../services/postService');
const likeService = require('../services/likeService');

async function createPost(req, res, next) {
  try {
    const result = await postService.createPost(
      req.body.content,
      req.body.topicId,
      req.user.userId,
      req.body.imageUrl
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function updatePost(req, res, next) {
  try {
    const result = await postService.updatePost(req.params.postId, req.body, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const result = await postService.deletePost(req.params.postId, req.user.userId, req.user.isAdmin);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function votePost(req, res, next) {
  try {
    const result = await postService.votePost(req.params.postId, req.body.direction, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function likePost(req, res, next) {
  try {
    const result = await likeService.likePost(req.params.postId, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPost,
  updatePost,
  deletePost,
  votePost,
  likePost,
};