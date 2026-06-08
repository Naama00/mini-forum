const articleService = require('../services/articleService');
const { createCrudController, wrapAsync } = require('../utils/controllerFactory');

const crud = createCrudController(
  {
    getAll: articleService.getAllArticles,
    getById: articleService.getArticleById,
    create: (body, userId) => articleService.createArticle(body, userId),
    update: articleService.updateArticle,
    delete: articleService.deleteArticle,
    like: articleService.likeArticle,
    addComment: articleService.addComment,
    deleteComment: articleService.deleteComment,
  },
  { createdMessage: 'מאמר נוצר בהצלחה' }
);

module.exports = {
  getAllArticles: crud.getAll,
  getArticleById: crud.getById,
  createArticle: crud.create,
  updateArticle: crud.update,
  deleteArticle: crud.delete,
  likeArticle: crud.like,
  addComment: crud.addComment,
  deleteComment: crud.deleteComment,
};
