import { API_BASE_URL } from '../utils/constants';
import { getToken } from '../utils/storage';
import { getErrorMessage } from '../utils/errors';

export async function authFetch(endpoint, options = {}) {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body != null && fetchOptions.method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(getErrorMessage(data));
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}

authFetch.get = (endpoint, options = {}) => authFetch(endpoint, { ...options, method: 'GET' });
authFetch.post = (endpoint, body = {}, options = {}) => authFetch(endpoint, { ...options, method: 'POST', body });
authFetch.put = (endpoint, body = {}, options = {}) => authFetch(endpoint, { ...options, method: 'PUT', body });
authFetch.patch = (endpoint, body = {}, options = {}) => authFetch(endpoint, { ...options, method: 'PATCH', body });
authFetch.delete = (endpoint, options = {}) => authFetch(endpoint, { ...options, method: 'DELETE' });

export default authFetch;
