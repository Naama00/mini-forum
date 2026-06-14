const topicService = require('../services/topicService');
const likeService = require('../services/likeService');

async function getTopic(req, res, next) {
  try {
    const topic = await topicService.getTopic(req.params.topicId);
    res.json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
}
async function getTopics(req, res, next) {
  try {
    const topics = await topicService.getTopics({
      limit: req.query.limit,
      sort: req.query.sort,
      tag: req.query.tag,
    });
    res.json({ success: true, data: topics });
  } catch (error) {
    next(error);
  }
}

async function createTopic(req, res, next) {
  try {
    const topic = await topicService.createTopic(req.body, req.user.userId, req.user.isAdmin);
    res.status(201).json({ success: true, message: 'הנושא נוצר בהצלחה', data: topic });
  } catch (error) {
    next(error);
  }
}

async function deleteTopic(req, res, next) {
  try {
    const result = await topicService.deleteTopic(
      req.params.topicId,
      req.user.userId,
      req.user.isAdmin
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function updateTopic(req, res, next) {
  try {
    const topic = await topicService.updateTopic(
      req.params.topicId,
      req.body,
      req.user.userId,
      req.user.isAdmin
    );
    res.json({ success: true, message: 'הנושא עודכן בהצלחה', data: topic });
  } catch (error) {
    next(error);
  }
}

async function likeTopic(req, res, next) {
  try {
    const result = await likeService.likeTopic(req.params.topicId, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTopic,
  getTopics,
  createTopic,
  deleteTopic,
  updateTopic,
  likeTopic,
  
};