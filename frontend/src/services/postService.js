import api from './api';

export const postService = {
  /**
   * Get all posts for a topic
   */
  getAllByTopic: (topicId, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    return api.get(`/posts/topic/${topicId}?${params}`);
  },

  /**
   * Get post by ID
   */
  getById: (id) => api.get(`/posts/${id}`),

  /**
   * Create post
   */
  create: (data) => api.post('/posts', { content: data.content, topicId: data.topicId }),

  /**
   * Update post
   */
  update: (id, data) => api.put(`/posts/${id}`, { content: data.content }),

  /**
   * Delete post
   */
  delete: (id) => api.delete(`/posts/${id}`),

  /**
   * Vote on post (upvote/downvote)
   */
  vote: (id, direction) => api.post(`/posts/${id}/vote`, { direction }),

  /**
   * Get posts by user
   */
  getByUser: (userId, page = 1) =>
    api.get(`/posts/user/${userId}?page=${page}`),
};

export default postService;
