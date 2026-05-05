import api from './api';

export const dataService = {
  /**
   * Search across all entities
   */
  search: (query, type = 'all', limit = 20) =>
    api.get(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`),

  /**
   * Search articles
   */
  articles: (query, limit = 20) =>
    api.get(`/search?q=${encodeURIComponent(query)}&type=articles&limit=${limit}`),

  /**
   * Search events
   */
  events: (query, limit = 20) =>
    api.get(`/search?q=${encodeURIComponent(query)}&type=events&limit=${limit}`),

  /**
   * Search jobs
   */
  jobs: (query, limit = 20) =>
    api.get(`/search?q=${encodeURIComponent(query)}&type=jobs&limit=${limit}`),

  /**
   * Search topics
   */
  topics: (query, limit = 20) =>
    api.get(`/search?q=${encodeURIComponent(query)}&type=topics&limit=${limit}`),

  /**
   * Search users
   */
  users: (query, limit = 20) =>
    api.get(`/search?q=${encodeURIComponent(query)}&type=users&limit=${limit}`),
};

export default dataService;
