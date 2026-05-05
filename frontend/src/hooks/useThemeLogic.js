import { useState, useCallback } from 'react';
import { getTheme, setTheme } from '../utils/storage';

/**
 * Hook for handling theme
 * @returns {object}
 */
export function useThemeLogic() {
  const [theme, setThemeState] = useState(() => getTheme());

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setThemeState(newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [theme]);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
    setThemeState('dark');
    document.documentElement.classList.add('dark-theme');
  }, []);

  const setLightTheme = useCallback(() => {
    setTheme('light');
    setThemeState('light');
    document.documentElement.classList.remove('dark-theme');
  }, []);

  return {
    theme,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    isDarkMode: theme === 'dark',
  };
}

export default useThemeLogic;
