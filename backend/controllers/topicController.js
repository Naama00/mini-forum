const topicService = require('../services/topicService');
const { wrapAsync } = require('../utils/controllerFactory');

const getTopics = wrapAsync(async (req, res) => {
  const topics = await topicService.getTopics({
    limit: req.query.limit,
    sort: req.query.sort,
    tag: req.query.tag,
  });
  res.json({ success: true, data: topics });
});

const createTopic = wrapAsync(async (req, res) => {
  const topic = await topicService.createTopic(req.body, req.user.userId, req.user.isAdmin);
  res.status(201).json({ success: true, message: 'הנושא נוצר בהצלחה', data: topic });
});

module.exports = {
  getTopics,
  createTopic
};
