import authFetch from './api';

export const usageService = {
  getMyUsage: () => authFetch.get('/usage/me'),
  getGlobalUsage: () => authFetch.get('/usage/global'),
};

export default usageService;
