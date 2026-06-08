import api from './api';

/**
 * Factory that builds a standard CRUD + like/comment service object.
 *
 * @param {string} basePath – e.g. '/articles', '/jobs', '/events'
 * @param {object} [extra]  – additional methods merged onto the service
 */
export default function createResourceService(basePath, extra = {}) {
  return {
    getAll(page = 1, limit = 9, search = '', tag = '') {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);
      return api.get(`${basePath}?${params}`);
    },

    getById: (id) => api.get(`${basePath}/${id}`),
    create:  (data) => api.post(basePath, data),
    update:  (id, data) => api.put(`${basePath}/${id}`, data),
    delete:  (id) => api.delete(`${basePath}/${id}`),

    like:   (id) => api.post(`${basePath}/${id}/like`),
    unlike: (id) => api.post(`${basePath}/${id}/unlike`),

    addComment:    (id, content) => api.post(`${basePath}/${id}/comments`, { content }),
    deleteComment: (id, commentId) => api.delete(`${basePath}/${id}/comments/${commentId}`),

    ...extra,
  };
}
