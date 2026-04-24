const topicService = require('../services/topicService');

async function createTopic(req, res, next) {
  try {
    const topic = await topicService.createTopic(req.body, req.user.userId);
    res.status(201).json({ success: true, message: 'הנושא נוצר בהצלחה', data: topic });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTopic
};
