import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for debouncing a value
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Additional options
 * @param {boolean} options.leading - Whether to trigger on leading edge
 * @param {Function} options.onChange - Callback when debounced value changes
 * @returns {any} - The debounced value
 */
const useDebounce = (value, delay = 500, options = {}) => {
  const { leading = false, onChange } = options;

  // State for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Store the latest value and timer in refs
  const previousValue = useRef(value);
  const timer = useRef(null);
  const isLeadingEdge = useRef(true);

  useEffect(() => {
    // If value hasn't changed, do nothing
    if (value === previousValue.current) {
      return;
    }

    // Update previous value
    previousValue.current = value;

    // Clear existing timer
    if (timer.current) {
      clearTimeout(timer.current);
    }

    // If leading edge and first call, update immediately
    if (leading && isLeadingEdge.current) {
      setDebouncedValue(value);
      if (onChange) onChange(value);
      isLeadingEdge.current = false;
      return;
    }

    // Set new timer
    timer.current = setTimeout(() => {
      setDebouncedValue(value);
      if (onChange) onChange(value);
      isLeadingEdge.current = true;
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [value, delay, leading, onChange]);

  return debouncedValue;
};

/**
 * Custom hook for debounced input handling
 *
 * @param {string} initialValue - Initial input value
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Additional options
 * @param {Function} options.onChange - Callback when debounced value changes
 * @returns {Object} - Input value, debounced value, and handlers
 */
export const useDebouncedInput = (
  initialValue = "",
  delay = 500,
  options = {}
) => {
  const { onChange } = options;

  // State for input value
  const [inputValue, setInputValue] = useState(initialValue);

  // Get debounced value
  const debouncedValue = useDebounce(inputValue, delay, {
    onChange,
  });

  // Handle input change
  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  // Reset input value
  const reset = () => {
    setInputValue("");
  };

  // Set input value directly
  const setValue = (value) => {
    setInputValue(value);
  };

  return {
    value: inputValue,
    debouncedValue,
    handleChange,
    reset,
    setValue,
  };
};

export default useDebounce;
