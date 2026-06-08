const eventService = require('../services/eventService');
const { createCrudController, wrapAsync } = require('../utils/controllerFactory');

const crud = createCrudController(
  {
    getAll: eventService.getAllEvents,
    getById: eventService.getEventById,
    create: (body, userId) => eventService.createEvent(body, userId),
    update: eventService.updateEvent,
    delete: eventService.deleteEvent,
    like: eventService.likeEvent,
    addComment: eventService.addComment,
    deleteComment: eventService.deleteComment,
  }
);

const attendEvent = wrapAsync(async (req, res) => {
  const result = await eventService.attendEvent(req.params.id, req.user.userId);
  res.json(result);
});

module.exports = {
  getAllEvents: crud.getAll,
  getEventById: crud.getById,
  createEvent: crud.create,
  updateEvent: crud.update,
  deleteEvent: crud.delete,
  likeEvent: crud.like,
  attendEvent,
  addComment: crud.addComment,
  deleteComment: crud.deleteComment,
};
