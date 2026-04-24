const dataService = require('../services/dataService');

/**
 * GET /api/categories
 */
async function getCategories(req, res, next) {
    try {
        const result = await dataService.getCategories();
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/categories/:categoryId
 */
async function getCategoryById(req, res, next) {
    try {
        const result = await dataService.getCategoryById(req.params.categoryId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/topics/:topicId
 */
async function getTopicById(req, res, next) {
    try {
        const result = await dataService.getTopicById(req.params.topicId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/posts/:postId
 */
async function getPostById(req, res, next) {
    try {
        const result = await dataService.getPostById(req.params.postId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/users/:userId
 */
async function getUserById(req, res, next) {
    try {
        const result = await dataService.getUserById(req.params.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/users
 */
async function getAllUsers(req, res, next) {
    try {
        const result = await dataService.getAllUsers();
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/statistics
 */
async function getStatistics(req, res, next) {
    try {
        const result = await dataService.getStatistics();
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/trending-topics
 */
async function getTrendingTopics(req, res, next) {
    try {
        const result = await dataService.getTrendingTopics();
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCategories,
    getCategoryById,
    getTopicById,
    getPostById,
    getUserById,
    getAllUsers,
    getStatistics,
    getTrendingTopics
};
