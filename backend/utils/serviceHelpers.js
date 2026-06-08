/**
 * Shared service helpers — eliminates repeated like/comment/ownership/pagination
 * logic across articleService, jobService, and eventService.
 */

const { createNotification } = require('../services/notificationService');

/**
 * Verify document ownership. Throws if the author doesn't match.
 */
function assertOwnership(doc, userId, action = 'לערוך') {
  if (doc.author.toString() !== userId) {
    throw new Error(`אין הרשאה ${action}`);
  }
}

/**
 * Paginate a Mongoose query.
 * @returns {{ items: Array, total: number, pages: number }}
 */
async function paginate(Model, query, { page = 1, limit = 10, sort = { createdAt: -1 }, populate = [] }) {
  let q = Model.find(query);
  for (const p of populate) {
    q = q.populate(p.path, p.select);
  }
  const items = await q
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Model.countDocuments(query);
  return { items, total, pages: Math.ceil(total / limit) };
}

/**
 * Toggle like/unlike on any document that has a `likes` array + `author` field.
 * Sends a notification on new like.
 *
 * @param {Model}  Model       – Mongoose model
 * @param {string} refModel    – 'Article' | 'Job' | 'Event'
 * @param {string} id          – document _id
 * @param {string} userId      – acting user
 * @param {string} notFoundMsg – Hebrew "not found" message
 */
async function toggleLike(Model, refModel, id, userId, notFoundMsg) {
  const doc = await Model.findById(id);
  if (!doc) throw new Error(notFoundMsg);

  const liked = doc.likes.includes(userId);
  liked ? doc.likes.pull(userId) : doc.likes.push(userId);
  await doc.save();

  if (!liked) {
    await createNotification({
      recipient: doc.author,
      sender: userId,
      type: 'like',
      refModel,
      refId: doc._id,
    });
  }

  return { likes: doc.likes.length, liked: !liked };
}

/**
 * Add a comment to any document with a `comments` sub-doc array.
 * Sends a notification to the document author.
 */
async function addComment(Model, refModel, id, { content }, userId, notFoundMsg) {
  const doc = await Model.findById(id);
  if (!doc) throw new Error(notFoundMsg);

  doc.comments.push({ content, author: userId });
  await doc.save();

  await createNotification({
    recipient: doc.author,
    sender: userId,
    type: 'comment',
    refModel,
    refId: doc._id,
    text: content,
  });

  await doc.populate('comments.author', 'firstName lastName icon');
  return doc.comments[doc.comments.length - 1];
}

/**
 * Delete a comment from any document with a `comments` sub-doc array.
 */
async function deleteComment(Model, id, commentId, userId, notFoundMsg) {
  const doc = await Model.findById(id);
  if (!doc) throw new Error(notFoundMsg);

  const comment = doc.comments.id(commentId);
  if (!comment) throw new Error('תגובה לא נמצאה');
  if (comment.author.toString() !== userId) throw new Error('אין הרשאה למחוק');

  comment.deleteOne();
  await doc.save();
  return { message: 'תגובה נמחקה' };
}

module.exports = {
  assertOwnership,
  paginate,
  toggleLike,
  addComment,
  deleteComment,
};
