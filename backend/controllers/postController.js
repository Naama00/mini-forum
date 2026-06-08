const postService = require('../services/postService');
const { wrapAsync } = require('../utils/controllerFactory');

const createPost = wrapAsync(async (req, res) => {
    const result = await postService.createPost(req.body.content, req.body.topicId, req.user.userId);
    res.status(201).json(result);
});

const updatePost = wrapAsync(async (req, res) => {
    const result = await postService.updatePost(req.params.postId, req.body, req.user.userId);
    res.json(result);
});

const deletePost = wrapAsync(async (req, res) => {
    const result = await postService.deletePost(req.params.postId, req.user.userId);
    res.json(result);
});

const votePost = wrapAsync(async (req, res) => {
    const result = await postService.votePost(req.params.postId, req.body.direction, req.user.userId);
    res.json(result);
});

module.exports = {
    createPost,
    updatePost,
    deletePost,
    votePost
};
