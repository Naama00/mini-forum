import api from './api';

export const dataService = {
  /**
   * Get all categories
   */
  getCategories: () => api.get('/data/categories'),

  /**
   * Get category by ID
   */
  getCategoryById: (id) => api.get(`/data/categories/${id}`),

  /**
   * Get topic by ID
   */
  getTopicById: (id) => api.get(`/data/topics/${id}`),

  /**
   * Get post by ID
   */
  getPostById: (id) => api.get(`/data/posts/${id}`),

  /**
   * Get user by ID
   */
  getUserById: (id) => api.get(`/data/users/${id}`),

  /**
   * Get all users
   */
  getAllUsers: () => api.get('/data/users'),

  /**
   * Get statistics
   */
  getStatistics: () => api.get('/data/statistics'),

  /**
   * Get trending topics
   */
  getTrendingTopics: () => api.get('/data/trending'),
};

export default dataService;
