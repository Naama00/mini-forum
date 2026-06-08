const Event = require('../models/Event');
const { assertOwnership, toggleLike, addComment, deleteComment } = require('../utils/serviceHelpers');

const NOT_FOUND = 'אירוע לא נמצא';

async function getAllEvents({ tag, search, upcoming, page = 1, limit = 10 }) {
  let query = {};
  if (tag) query.tags = tag;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } }
  ];
  if (upcoming === 'true') query.date = { $gte: new Date() };

  const events = await Event.find(query)
    .populate('author', 'username avatar')
    .populate('comments.author', 'firstName lastName icon')
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Event.countDocuments(query);
  return { events, total, pages: Math.ceil(total / limit) };
}

async function getEventById(id) {
  const event = await Event.findById(id)
    .populate('author', 'username avatar')
    .populate('attendees', 'firstName lastName username avatar')
    .populate('comments.author', 'firstName lastName icon');

  if (!event) throw new Error(NOT_FOUND);
  return event;
}

async function createEvent({ title, description, date, location, link, image, tags }, authorId) {
  const event = new Event({
    title, description, date, location, link, image,
    tags: tags || [],
    author: authorId
  });
  await event.save();
  await event.populate('author', 'username avatar');
  return event;
}

async function updateEvent(id, { title, description, date, location, link, image, tags }, authorId) {
  const event = await Event.findById(id);
  if (!event) throw new Error(NOT_FOUND);
  assertOwnership(event, authorId, 'לערוך');

  Object.assign(event, { title, description, date, location, link, image, tags, updatedAt: Date.now() });
  await event.save();
  return event;
}

async function deleteEvent(id, authorId) {
  const event = await Event.findById(id);
  if (!event) throw new Error(NOT_FOUND);
  assertOwnership(event, authorId, 'למחוק');

  await event.deleteOne();
  return { message: 'אירוע נמחק בהצלחה' };
}

const likeEvent = (id, userId) => toggleLike(Event, 'Event', id, userId, NOT_FOUND);

async function attendEvent(id, userId) {
  const event = await Event.findById(id);
  if (!event) throw new Error(NOT_FOUND);

  const attending = event.attendees.some(a => a.toString() === userId.toString());

  if (attending) {
    event.attendees = event.attendees.filter(a => a.toString() !== userId.toString());
  } else {
    event.attendees.push(userId);
  }

  await event.save();
  await event.populate('attendees', 'firstName lastName username avatar');

  return {
    success: true,
    attending: !attending,
    attendeesCount: event.attendees.length,
    attendees: event.attendees,
  };
}

const addEventComment = (id, body, userId) => addComment(Event, 'Event', id, body, userId, NOT_FOUND);
const deleteEventComment = (id, commentId, userId) => deleteComment(Event, id, commentId, userId, NOT_FOUND);

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  likeEvent,
  attendEvent,
  addComment: addEventComment,
  deleteComment: deleteEventComment
};
