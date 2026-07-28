import { useEffect, useState } from 'react';

/**
 * Hook personalizado para manejar localStorage de forma reactiva
 * @param {string} key - La clave del localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[any, Function]} - [valor, función para actualizar]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);

      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
