import api from './api';

export const userService = {
  /**
   * Get user profile
   */
  getProfile: (userId) => api.get(`/users/${userId}`),

  /**
   * Get all users
   */
  getAll: (page = 1, limit = 20) =>
    api.get(`/users?page=${page}&limit=${limit}`),

  /**
   * Update user profile
   */
  updateProfile: (userId, data) =>
    api.put(`/users/${userId}`, {
      firstName: data.firstName,
      lastName: data.lastName,
      city: data.city,
    }),

  /**
   * Get user posts
   */
  getPosts: (userId, page = 1) =>
    api.get(`/posts/user/${userId}?page=${page}`),

  /**
   * Get user topics
   */
  getTopics: (userId, page = 1) =>
    api.get(`/topics/user/${userId}?page=${page}`),
};

export default userService;
