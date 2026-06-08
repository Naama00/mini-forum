const jobService = require('../services/jobService');
const { createCrudController } = require('../utils/controllerFactory');

const crud = createCrudController(
  {
    getAll: jobService.getAllJobs,
    getById: jobService.getJobById,
    create: (body, userId) => jobService.createJob(body, userId),
    update: jobService.updateJob,
    delete: jobService.deleteJob,
    like: jobService.likeJob,
    addComment: jobService.addComment,
    deleteComment: jobService.deleteComment,
  }
);

module.exports = {
  getAllJobs: crud.getAll,
  getJobById: crud.getById,
  createJob: crud.create,
  updateJob: crud.update,
  deleteJob: crud.delete,
  likeJob: crud.like,
  addComment: crud.addComment,
  deleteComment: crud.deleteComment,
};
