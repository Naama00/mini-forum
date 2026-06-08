const Job = require('../models/Job');
const { createNotification } = require('./notificationService');

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get all jobs with optional filters
 */
async function getAllJobs({ tag, search, type, location, page = 1, limit = 10 }) {
  let query = {};
  if (tag) query.tags = tag;
  if (type) query.type = type;
  if (location) query.location = { $regex: escapeRegex(location), $options: 'i' };
  if (search) {
    const escaped = escapeRegex(search);
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { company: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } }
    ];
  }

  const jobs = await Job.find(query)
    .populate('author', 'username avatar')
    .populate('comments.author', 'firstName lastName icon')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Job.countDocuments(query);
  return { jobs, total, pages: Math.ceil(total / limit) };
}

/**
 * Get single job by ID
 */
async function getJobById(id) {
  const job = await Job.findById(id)
    .populate('author', 'username avatar')
    .populate('comments.author', 'firstName lastName icon');

  if (!job) throw new Error('משרה לא נמצאה');
  return job;
}

/**
 * Create new job
 */
async function createJob({ title, company, location, type, description, requirements, applyLink, salary, tags }, authorId) {
  const job = new Job({
    title, company, location, type, description,
    requirements: requirements || [],
    applyLink, salary,
    tags: tags || [],
    author: authorId
  });
  await job.save();
  await job.populate('author', 'username avatar');
  return job;
}

/**
 * Update job
 */
async function updateJob(id, { title, company, location, type, description, requirements, applyLink, salary, tags }, authorId) {
  const job = await Job.findById(id);
  if (!job) throw new Error('משרה לא נמצאה');
  if (job.author.toString() !== authorId) throw new Error('אין הרשאה לערוך');

  Object.assign(job, { title, company, location, type, description, requirements, applyLink, salary, tags, updatedAt: Date.now() });
  await job.save();
  return job;
}

/**
 * Delete job
 */
async function deleteJob(id, authorId) {
  const job = await Job.findById(id);
  if (!job) throw new Error('משרה לא נמצאה');
  if (job.author.toString() !== authorId) throw new Error('אין הרשאה למחוק');

  await job.deleteOne();
  return { message: 'משרה נמחקה בהצלחה' };
}

/**
 * Like/unlike job
 */
async function likeJob(id, userId) {
  const job = await Job.findById(id);
  if (!job) throw new Error('משרה לא נמצאה');

  const liked = job.likes.includes(userId);
  liked ? job.likes.pull(userId) : job.likes.push(userId);
  await job.save();

  if (!liked) {
    await createNotification({
      recipient: job.author,
      sender: userId,
      type: 'like',
      refModel: 'Job',
      refId: job._id,
    });
  }

  return { likes: job.likes.length, liked: !liked };
}

/**
 * Add comment to job
 */
async function addComment(id, { content }, userId) {
  const job = await Job.findById(id);
  if (!job) throw new Error('משרה לא נמצאה');

  job.comments.push({ content, author: userId });
  await job.save();

  await createNotification({
    recipient: job.author,
    sender: userId,
    type: 'comment',
    refModel: 'Job',
    refId: job._id,
    text: content
  });

  await job.populate('comments.author', 'firstName lastName icon');
  return job.comments[job.comments.length - 1];
}

/**
 * Delete comment from job
 */
async function deleteComment(id, commentId, userId) {
  const job = await Job.findById(id);
  if (!job) throw new Error('משרה לא נמצאה');

  const comment = job.comments.id(commentId);
  if (!comment) throw new Error('תגובה לא נמצאה');
  if (comment.author.toString() !== userId) throw new Error('אין הרשאה למחוק');

  comment.deleteOne();
  await job.save();
  return { message: 'תגובה נמחקה' };
}

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  likeJob,
  addComment,
  deleteComment
};