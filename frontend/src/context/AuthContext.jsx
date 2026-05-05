import { createContext } from 'react';
import { useAuthLogic } from '../hooks/useAuthLogic';

export const AuthContext = createContext();

/**
 * Auth Provider component
 */
export function AuthProvider({ children }) {
  const authLogic = useAuthLogic();

  return (
    <AuthContext.Provider value={authLogic}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
