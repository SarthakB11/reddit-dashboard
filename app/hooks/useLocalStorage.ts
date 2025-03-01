'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook that handles localStorage with a fallback
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [storedValue, setValue] - State and setter
 */
const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  // Get the initial value from localStorage or use the provided initialValue
  const readValue = (): T => {
    // SSR check
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key]);

  return [storedValue, setValue];
};

export default useLocalStorage; 