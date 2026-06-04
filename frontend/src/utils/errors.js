import { ERROR_MESSAGES } from './constants';

/**
 * Extract error message from response
 * @param {Error|object} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.SERVER_ERROR;

  // If it's a string
  if (typeof error === 'string') return error;

  // If it's an error payload from the API
  if (error.error) {
    return error.error;
  }

  // If it's an axios error
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // If it's a fetch error with error message
  if (error.message) return error.message;

  // Default
  return ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Is 401 Unauthorized error
 * @param {Error|object} error
 * @returns {boolean}
 */
export const isUnauthorized = (error) => {
  return error?.response?.status === 401 || error?.status === 401;
};

/**
 * Is 403 Forbidden error
 * @param {Error|object} error
 * @returns {boolean}
 */
export const isForbidden = (error) => {
  return error?.response?.status === 403 || error?.status === 403;
};

/**
 * Is 404 Not Found error
 * @param {Error|object} error
 * @returns {boolean}
 */
export const isNotFound = (error) => {
  return error?.response?.status === 404 || error?.status === 404;
};

/**
 * Is network error
 * @param {Error|object} error
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error?.response || error.message === 'Network Error';
};

export default {
  getErrorMessage,
  isUnauthorized,
  isForbidden,
  isNotFound,
  isNetworkError,
};
