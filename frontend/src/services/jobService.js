import api from './api';

export const jobService = {
  /**
   * Get all jobs
   */
  getAll: (page = 1, limit = 9, search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    return api.get(`/jobs?${params}`);
  },

  /**
   * Get job by ID
   */
  getById: (id) => api.get(`/jobs/${id}`),

  /**
   * Create job
   */
  create: (data) => api.post('/jobs', data),

  /**
   * Update job
   */
  update: (id, data) => api.put(`/jobs/${id}`, data),

  /**
   * Delete job
   */
  delete: (id) => api.delete(`/jobs/${id}`),

  /**
   * Like job
   */
  like: (id) => api.post(`/jobs/${id}/like`),

  /**
   * Unlike job
   */
  unlike: (id) => api.post(`/jobs/${id}/unlike`),

  /**
   * Add comment
   */
  addComment: (id, content) => api.post(`/jobs/${id}/comments`, { content }),

  /**
   * Delete comment
   */
  deleteComment: (id, commentId) => api.delete(`/jobs/${id}/comments/${commentId}`),
};

export default jobService;
