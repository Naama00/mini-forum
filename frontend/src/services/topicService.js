import api from './api';

export const topicService = {
  /**
   * Get all topics with pagination
   */
  getAll: (page = 1, limit = 10, categoryId = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (categoryId) params.append('categoryId', categoryId);
    return api.get(`/topics?${params}`);
  },

  /**
   * Get topic by ID
   */
  getById: (id) => api.get(`/topics/${id}`),

  /**
   * Create topic
   */
  create: (data) => api.post('/topics', { title: data.title, categoryId: data.categoryId }),

  /**
   * Update topic
   */
  update: (id, data) => api.put(`/topics/${id}`, data),

  /**
   * Delete topic
   */
  delete: (id) => api.delete(`/topics/${id}`),

  /**
   * Get topics by category
   */
  getByCategory: (categoryId, page = 1) =>
    api.get(`/data/categories/${categoryId}?page=${page}`),
};

export default topicService;
