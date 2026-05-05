import api from './api';

export const articleService = {
  /**
   * Get all articles
   */
  getAll: (page = 1, limit = 9, search = '', tag = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    return api.get(`/articles?${params}`);
  },

  /**
   * Get article by ID
   */
  getById: (id) => api.get(`/articles/${id}`),

  /**
   * Create article
   */
  create: (data) => api.post('/articles', data),

  /**
   * Update article
   */
  update: (id, data) => api.put(`/articles/${id}`, data),

  /**
   * Delete article
   */
  delete: (id) => api.delete(`/articles/${id}`),

  /**
   * Like article
   */
  like: (id) => api.post(`/articles/${id}/like`),

  /**
   * Unlike article
   */
  unlike: (id) => api.post(`/articles/${id}/unlike`),

  /**
   * Add comment
   */
  addComment: (id, content) => api.post(`/articles/${id}/comments`, { content }),

  /**
   * Delete comment
   */
  deleteComment: (id, commentId) => api.delete(`/articles/${id}/comments/${commentId}`),
};

export default articleService;
