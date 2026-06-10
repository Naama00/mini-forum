const Event = require('../models/Event');
const { createNotification } = require('./notificationService');

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
  if (!event) throw new Error('אירוע לא נמצא');
  return event;
}

async function createEvent({ title, description, date, location, link, image, tags }, authorId) {
  const event = new Event({ title, description, date, location, link, image, tags: tags || [], author: authorId });
  await event.save();
  await event.populate('author', 'username avatar');
  return event;
}

// ✅ נוסף isAdmin
async function updateEvent(id, { title, description, date, location, link, image, tags }, authorId, isAdmin = false) {
  const event = await Event.findById(id);
  if (!event) throw new Error('אירוע לא נמצא');
  if (!isAdmin && event.author.toString() !== authorId) {
    const err = new Error('אין הרשאה לערוך');
    err.status = 403;
    throw err;
  }
  Object.assign(event, { title, description, date, location, link, image, tags, updatedAt: Date.now() });
  await event.save();
  return event;
}

// ✅ נוסף isAdmin
async function deleteEvent(id, authorId, isAdmin = false) {
  const event = await Event.findById(id);
  if (!event) throw new Error('אירוע לא נמצא');
  if (!isAdmin && event.author.toString() !== authorId) {
    const err = new Error('אין הרשאה למחוק');
    err.status = 403;
    throw err;
  }
  await event.deleteOne();
  return { message: 'אירוע נמחק בהצלחה' };
}

async function likeEvent(id, userId) {
  const event = await Event.findById(id);
  if (!event) throw new Error('אירוע לא נמצא');
  const liked = event.likes.includes(userId);
  liked ? event.likes.pull(userId) : event.likes.push(userId);
  await event.save();
  if (!liked) {
    await createNotification({ recipient: event.author, sender: userId, type: 'like', refModel: 'Event', refId: event._id });
  }
  return { likes: event.likes.length, liked: !liked };
}

async function attendEvent(id, userId) {
  const event = await Event.findById(id);
  if (!event) throw new Error('אירוע לא נמצא');
  const attending = event.attendees.some(a => a.toString() === userId.toString());
  if (attending) {
    event.attendees = event.attendees.filter(a => a.toString() !== userId.toString());
  } else {
    event.attendees.push(userId);
  }
  await event.save();
  await event.populate('attendees', 'firstName lastName username avatar');
  return { success: true, attending: !attending, attendeesCount: event.attendees.length, attendees: event.attendees };
}

async function addComment(id, { content }, userId) {
  const event = await Event.findById(id);
  if (!event) throw new Error('אירוע לא נמצא');
  event.comments.push({ content, author: userId });
  await event.save();
  await createNotification({ recipient: event.author, sender: userId, type: 'comment', refModel: 'Event', refId: event._id, text: content });
  await event.populate('comments.author', 'firstName lastName icon');
  return event.comments[event.comments.length - 1];
}

async function deleteComment(id, commentId, userId) {
  const event = await Event.findById(id);
  if (!event) throw new Error('אירוע לא נמצא');
  const comment = event.comments.id(commentId);
  if (!comment) throw new Error('תגובה לא נמצאה');
  if (comment.author.toString() !== userId) throw new Error('אין הרשאה למחוק');
  comment.deleteOne();
  await event.save();
  return { message: 'תגובה נמחקה' };
}

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, likeEvent, attendEvent, addComment, deleteComment };
