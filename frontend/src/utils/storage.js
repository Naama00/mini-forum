import { STORAGE_KEYS } from './constants';

/**
 * Get JWT token from localStorage
 * @returns {string|null}
 */
export const getToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
};

/**
 * Set JWT token in localStorage
 * @param {string} token
 */
export const setToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (err) {
    console.error('Failed to save token:', err);
  }
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (err) {
    console.error('Failed to remove token:', err);
  }
};

/**
 * Get user data from localStorage
 * @returns {object|null}
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Set user data in localStorage
 * @param {object} user
 */
export const setUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user:', err);
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (err) {
    console.error('Failed to remove user:', err);
  }
};

/**
 * Get current logged-in user from JWT token
 * @returns {object|null}
 */
export const getLoggedInUserFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  removeToken();
  removeUser();
};

/**
 * Get theme preference
 * @returns {string}
 */
export const getTheme = () => {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
};

/**
 * Set theme preference
 * @param {string} theme
 */
export const setTheme = (theme) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export default {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  getLoggedInUserFromToken,
  clearAuthData,
  getTheme,
  setTheme,
};
