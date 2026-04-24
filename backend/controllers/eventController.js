const eventService = require('../services/eventService');

async function getAllEvents(req, res, next) {
  try {
    const result = await eventService.getAllEvents(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const event = await eventService.createEvent(req.body, req.user.userId);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user.userId);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const result = await eventService.deleteEvent(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function likeEvent(req, res, next) {
  try {
    const result = await eventService.likeEvent(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function attendEvent(req, res, next) {
  try {
    const result = await eventService.attendEvent(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const comment = await eventService.addComment(req.params.id, req.body, req.user.userId);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const result = await eventService.deleteComment(req.params.id, req.params.commentId, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  likeEvent,
  attendEvent,
  addComment,
  deleteComment
};
};
