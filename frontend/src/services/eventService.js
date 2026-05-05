import api from './api';

export const eventService = {
  /**
   * Get all events
   */
  getAll: (page = 1, limit = 9, search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    return api.get(`/events?${params}`);
  },

  /**
   * Get event by ID
   */
  getById: (id) => api.get(`/events/${id}`),

  /**
   * Create event
   */
  create: (data) => api.post('/events', data),

  /**
   * Update event
   */
  update: (id, data) => api.put(`/events/${id}`, data),

  /**
   * Delete event
   */
  delete: (id) => api.delete(`/events/${id}`),

  /**
   * Like event
   */
  like: (id) => api.post(`/events/${id}/like`),

  /**
   * Unlike event
   */
  unlike: (id) => api.post(`/events/${id}/unlike`),

  /**
   * Attend event
   */
  attend: (id) => api.post(`/events/${id}/attend`),

  /**
   * Cancel attendance
   */
  cancelAttendance: (id) => api.post(`/events/${id}/cancel-attendance`),

  /**
   * Add comment
   */
  addComment: (id, content) => api.post(`/events/${id}/comments`, { content }),

  /**
   * Delete comment
   */
  deleteComment: (id, commentId) => api.delete(`/events/${id}/comments/${commentId}`),
};

export default eventService;
