const topicService = require('../services/topicService');

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

module.exports = {
  getTopics,
  createTopic
};
