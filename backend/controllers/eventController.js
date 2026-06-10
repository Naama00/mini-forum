const eventService = require('../services/eventService');

async function getAllEvents(req, res, next) {
  try { res.json(await eventService.getAllEvents(req.query)); } catch (err) { next(err); }
}

async function getEventById(req, res, next) {
  try { res.json(await eventService.getEventById(req.params.id)); } catch (err) { next(err); }
}

async function createEvent(req, res, next) {
  try { res.status(201).json(await eventService.createEvent(req.body, req.user.userId)); } catch (err) { next(err); }
}

async function updateEvent(req, res, next) {
  try {
    // ✅ מעביר isAdmin
    res.json(await eventService.updateEvent(req.params.id, req.body, req.user.userId, req.user.isAdmin));
  } catch (err) { next(err); }
}

async function deleteEvent(req, res, next) {
  try {
    // ✅ מעביר isAdmin
    res.json(await eventService.deleteEvent(req.params.id, req.user.userId, req.user.isAdmin));
  } catch (err) { next(err); }
}

async function likeEvent(req, res, next) {
  try { res.json(await eventService.likeEvent(req.params.id, req.user.userId)); } catch (err) { next(err); }
}

async function attendEvent(req, res, next) {
  try { res.json(await eventService.attendEvent(req.params.id, req.user.userId)); } catch (err) { next(err); }
}

async function addComment(req, res, next) {
  try { res.status(201).json(await eventService.addComment(req.params.id, req.body, req.user.userId)); } catch (err) { next(err); }
}

async function deleteComment(req, res, next) {
  try { res.json(await eventService.deleteComment(req.params.id, req.params.commentId, req.user.userId)); } catch (err) { next(err); }
}

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, likeEvent, attendEvent, addComment, deleteComment };
