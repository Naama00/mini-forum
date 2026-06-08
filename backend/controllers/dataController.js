const dataService = require('../services/dataService');
const { wrapAsync } = require('../utils/controllerFactory');
const logger = require('../config/logger');

const getCategories = wrapAsync(async (req, res) => {
    logger.debug({ path: req.path, method: req.method }, 'dataController.getCategories called');
    const result = await dataService.getCategories();
    logger.debug({ resultCount: result.count }, 'Sending categories response');
    res.json(result);
});

const getCategoryById = wrapAsync(async (req, res) => {
    const result = await dataService.getCategoryById(req.params.categoryId);
    res.json(result);
});

const getTopicById = wrapAsync(async (req, res) => {
    const result = await dataService.getTopicById(req.params.topicId);
    res.json(result);
});

const getPostById = wrapAsync(async (req, res) => {
    const result = await dataService.getPostById(req.params.postId);
    res.json(result);
});

const getUserById = wrapAsync(async (req, res) => {
    const result = await dataService.getUserById(req.params.userId);
    res.json(result);
});

const getAllUsers = wrapAsync(async (req, res) => {
    const result = await dataService.getAllUsers();
    res.json(result);
});

const getStatistics = wrapAsync(async (req, res) => {
    const result = await dataService.getStatistics();
    res.json(result);
});

const getTrendingTopics = wrapAsync(async (req, res) => {
    const result = await dataService.getTrendingTopics();
    res.json(result);
});

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
