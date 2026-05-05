import { getToken, getLoggedInUserFromToken } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';
import { getErrorMessage } from '../utils/errors';

/**
 * Axios-like API client
 */
class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    let config = {
      headers: {},
      ...options,
    };

    // Add JWT token if available
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';

    // Build final URL (remove body from GET requests)
    const url = this.baseURL + endpoint;
    
    const fetchOptions = {
      method: config.method || 'GET',
      headers: config.headers,
    };

    // Only add body for non-GET requests
    if (config.method && config.method !== 'GET' && config.body) {
      fetchOptions.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Parse response
      const data = await response.json().catch(() => ({}));

      // Check if response is ok
      if (!response.ok) {
        const error = new Error(getErrorMessage(data));
        error.status = response.status;
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * PUT request
   */
  put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * PATCH request
   */
  patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export default new APIClient();
