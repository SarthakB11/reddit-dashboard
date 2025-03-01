'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 