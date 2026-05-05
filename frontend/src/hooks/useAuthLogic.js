import { useState, useCallback } from 'react';
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/storage';
import { authService } from '../services/authService';
import { getErrorMessage } from '../utils/errors';

/**
 * Hook for handling user authentication
 * @returns {object}
 */
export function useAuthLogic() {
  const [user, setUserState] = useState(() => {
    try {
      return getUser();
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.token) {
        setToken(response.token);
        const userData = response.user || { userId: response.userId };
        setUser(userData);
        setUserState(userData);
      }
      return response;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(formData);
      if (response.token) {
        setToken(response.token);
        const userData = response.user || { userId: response.userId };
        setUser(userData);
        setUserState(userData);
      }
      return response;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (credential) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.googleLogin(credential);
      if (response.token) {
        setToken(response.token);
        const userData = response.user || { userId: response.userId };
        setUser(userData);
        setUserState(userData);
      }
      return response;
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setUserState(null);
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user && !!getToken(),
  };
}

export default useAuthLogic;
