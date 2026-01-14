import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook para manejar el modo oscuro
 * @returns {[boolean, Function]} - [isDarkMode, toggleDarkMode]
 */
export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return [isDarkMode, toggleDarkMode];
};
