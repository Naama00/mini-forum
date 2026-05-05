import api from './api';

export const authService = {
  /**
   * Register new user
   */
  register: (data) =>
    api.post('/auth/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      city: data.city || '',
    }),

  /**
   * Login user
   */
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  /**
   * Google login
   */
  googleLogin: (credential) =>
    api.post('/auth/google', { credential }),

  /**
   * Get current user info
   */
  getCurrentUser: () => api.get('/auth/me'),

  /**
   * Logout (client-side only, token removed from storage)
   */
  logout: () => {
    // This is handled in the hook/context
    return Promise.resolve();
  },
};

export default authService;
