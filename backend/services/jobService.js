const Job = require('../models/Job');
const { assertOwnership, toggleLike, addComment, deleteComment } = require('../utils/serviceHelpers');

const NOT_FOUND = 'משרה לא נמצאה';

async function getAllJobs({ tag, search, type, location, page = 1, limit = 10 }) {
  let query = {};
  if (tag) query.tags = tag;
  if (type) query.type = type;
  if (location) query.location = { $regex: location, $options: 'i' };
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { company: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } }
  ];

  const jobs = await Job.find(query)
    .populate('author', 'username avatar')
    .populate('comments.author', 'firstName lastName icon')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Job.countDocuments(query);
  return { jobs, total, pages: Math.ceil(total / limit) };
}

async function getJobById(id) {
  const job = await Job.findById(id)
    .populate('author', 'username avatar')
    .populate('comments.author', 'firstName lastName icon');

  if (!job) throw new Error(NOT_FOUND);
  return job;
}

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

async function updateJob(id, { title, company, location, type, description, requirements, applyLink, salary, tags }, authorId) {
  const job = await Job.findById(id);
  if (!job) throw new Error(NOT_FOUND);
  assertOwnership(job, authorId, 'לערוך');

  Object.assign(job, { title, company, location, type, description, requirements, applyLink, salary, tags, updatedAt: Date.now() });
  await job.save();
  return job;
}

async function deleteJob(id, authorId) {
  const job = await Job.findById(id);
  if (!job) throw new Error(NOT_FOUND);
  assertOwnership(job, authorId, 'למחוק');

  await job.deleteOne();
  return { message: 'משרה נמחקה בהצלחה' };
}

const likeJob = (id, userId) => toggleLike(Job, 'Job', id, userId, NOT_FOUND);
const addJobComment = (id, body, userId) => addComment(Job, 'Job', id, body, userId, NOT_FOUND);
const deleteJobComment = (id, commentId, userId) => deleteComment(Job, id, commentId, userId, NOT_FOUND);

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  likeJob,
  addComment: addJobComment,
  deleteComment: deleteJobComment
};
