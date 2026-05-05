import api from './api';

export const notificationService = {
  /**
   * Get all notifications
   */
  getAll: (page = 1, limit = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),

  /**
   * Get unread count
   */
  getUnreadCount: () => api.get('/notifications/unread'),

  /**
   * Mark as read
   */
  markAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),

  /**
   * Mark all as read
   */
  markAllAsRead: () => api.patch('/notifications/read-all'),

  /**
   * Delete notification
   */
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),

  /**
   * Delete all notifications
   */
  deleteAll: () => api.delete('/notifications/all'),
};

export default notificationService;
