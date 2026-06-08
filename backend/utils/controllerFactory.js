/**
 * Controller factory — eliminates repetitive try/catch wrappers.
 *
 * Usage:
 *   const { wrapAsync, createCrudController } = require('../utils/controllerFactory');
 *
 *   // Single handler:
 *   const myHandler = wrapAsync(async (req, res) => { ... });
 *
 *   // Full CRUD set:
 *   module.exports = createCrudController(service, { entityName: 'Article' });
 */

/**
 * Wrap an async route handler so thrown errors are forwarded to `next`.
 */
function wrapAsync(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * Build a standard CRUD controller object from a service layer.
 *
 * The service must expose: getAll, getById, create, update, delete.
 * Optionally: like, addComment, deleteComment.
 *
 * @param {object} service       – The service module
 * @param {object} opts
 * @param {string} opts.entityName – Used in the 201 success message (e.g. 'Article')
 * @param {string} [opts.createdMessage] – Custom Hebrew success message
 */
function createCrudController(service, { entityName, createdMessage } = {}) {
  const ctrl = {};

  if (service.getAll) {
    ctrl.getAll = wrapAsync(async (req, res) => {
      const result = await service.getAll(req.query);
      res.json(result);
    });
  }

  if (service.getById) {
    ctrl.getById = wrapAsync(async (req, res) => {
      const item = await service.getById(req.params.id);
      res.json(item);
    });
  }

  if (service.create) {
    ctrl.create = wrapAsync(async (req, res) => {
      const item = await service.create(req.body, req.user.userId);
      const response = createdMessage
        ? { success: true, message: createdMessage, data: item }
        : item;
      res.status(201).json(response);
    });
  }

  if (service.update) {
    ctrl.update = wrapAsync(async (req, res) => {
      const item = await service.update(req.params.id, req.body, req.user.userId);
      res.json(item);
    });
  }

  if (service.delete) {
    ctrl.delete = wrapAsync(async (req, res) => {
      const result = await service.delete(req.params.id, req.user.userId);
      res.json(result);
    });
  }

  if (service.like) {
    ctrl.like = wrapAsync(async (req, res) => {
      const result = await service.like(req.params.id, req.user.userId);
      res.json(result);
    });
  }

  if (service.addComment) {
    ctrl.addComment = wrapAsync(async (req, res) => {
      const comment = await service.addComment(req.params.id, req.body, req.user.userId);
      res.status(201).json(comment);
    });
  }

  if (service.deleteComment) {
    ctrl.deleteComment = wrapAsync(async (req, res) => {
      const result = await service.deleteComment(req.params.id, req.params.commentId, req.user.userId);
      res.json(result);
    });
  }

  return ctrl;
}

module.exports = { wrapAsync, createCrudController };
