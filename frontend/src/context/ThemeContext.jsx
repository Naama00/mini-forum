import { createContext } from 'react';
import { useThemeLogic } from '../hooks/useThemeLogic';

export const ThemeContext = createContext();

/**
 * Theme Provider component
 */
export function ThemeProvider({ children }) {
  const themeLogic = useThemeLogic();

  return (
    <ThemeContext.Provider value={themeLogic}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
