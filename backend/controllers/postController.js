const postService = require('../services/postService');

/**
 * POST /api/posts
 */
async function createPost(req, res, next) {
    try {
        const result = await postService.createPost(req.body.content, req.body.topicId, req.user.userId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/posts/:postId
 */
async function updatePost(req, res, next) {
    try {
        const result = await postService.updatePost(req.params.postId, req.body, req.user.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/posts/:postId
 */
async function deletePost(req, res, next) {
    try {
        const result = await postService.deletePost(req.params.postId, req.user.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/posts/:postId/vote
 */
async function votePost(req, res, next) {
    try {
        const result = await postService.votePost(req.params.postId, req.body.direction, req.user.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPost,
    updatePost,
    deletePost,
    votePost
};
