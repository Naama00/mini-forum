const jobService = require('../services/jobService');

async function getAllJobs(req, res, next) {
  try {
    const result = await jobService.getAllJobs(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getJobById(req, res, next) {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json(job);
  } catch (err) {
    next(err);
  }
}

async function createJob(req, res, next) {
  try {
    const job = await jobService.createJob(req.body, req.user.userId);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

async function updateJob(req, res, next) {
  try {
    const job = await jobService.updateJob(req.params.id, req.body, req.user.userId);
    res.json(job);
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    const result = await jobService.deleteJob(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function likeJob(req, res, next) {
  try {
    const result = await jobService.likeJob(req.params.id, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const comment = await jobService.addComment(req.params.id, req.body, req.user.userId);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const result = await jobService.deleteComment(req.params.id, req.params.commentId, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
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
