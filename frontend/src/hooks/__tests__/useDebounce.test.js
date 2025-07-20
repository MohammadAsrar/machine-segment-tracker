import { renderHook, act } from '@testing-library/react';
import useDebounce, { useDebouncedInput } from '../useDebounce';

// Mock timers for debounce testing
jest.useFakeTimers();

describe('useDebounce hook', () => {
  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial value', 500));
    expect(result.current).toBe('initial value');
  });

  it('should update the value after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );
    
    // Initial value
    expect(result.current).toBe('initial value');
    
    // Update the value
    rerender({ value: 'updated value', delay: 500 });
    
    // Value should not be updated yet
    expect(result.current).toBe('initial value');
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Now the value should be updated
    expect(result.current).toBe('updated value');
  });

  it('should use the leading option correctly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay, options }) => useDebounce(value, delay, options),
      { 
        initialProps: { 
          value: 'initial value', 
          delay: 500, 
          options: { leading: true } 
        } 
      }
    );
    
    // Initial value
    expect(result.current).toBe('initial value');
    
    // Update the value
    rerender({ 
      value: 'updated value', 
      delay: 500, 
      options: { leading: true }
    });
    
    // With leading: true, the value should update immediately
    expect(result.current).toBe('updated value');
  });

  it('should call the onChange callback after delay', () => {
    const onChange = jest.fn();
    
    const { result, rerender } = renderHook(
      ({ value, delay, options }) => useDebounce(value, delay, options),
      { 
        initialProps: { 
          value: 'initial value', 
          delay: 500, 
          options: { onChange } 
        } 
      }
    );
    
    // Update the value
    rerender({ 
      value: 'updated value', 
      delay: 500, 
      options: { onChange } 
    });
    
    // Callback should not be called yet
    expect(onChange).not.toHaveBeenCalled();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Callback should be called with the updated value
    expect(onChange).toHaveBeenCalledWith('updated value');
  });
});

describe('useDebouncedInput hook', () => {
  it('should handle input changes with debounce', () => {
    const onChange = jest.fn();
    
    const { result } = renderHook(() => 
      useDebouncedInput('initial', 500, { onChange })
    );
    
    // Initial state
    expect(result.current.value).toBe('initial');
    expect(result.current.debouncedValue).toBe('initial');
    
    // Simulate input change
    act(() => {
      result.current.handleChange({ target: { value: 'new value' } });
    });
    
    // Input value should update immediately
    expect(result.current.value).toBe('new value');
    
    // Debounced value should not update yet
    expect(result.current.debouncedValue).toBe('initial');
    expect(onChange).not.toHaveBeenCalled();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Now the debounced value should update and onChange should be called
    expect(result.current.debouncedValue).toBe('new value');
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('should reset the input value', () => {
    const { result } = renderHook(() => 
      useDebouncedInput('initial', 500)
    );
    
    // Simulate input change
    act(() => {
      result.current.handleChange({ target: { value: 'new value' } });
    });
    
    expect(result.current.value).toBe('new value');
    
    // Reset the input
    act(() => {
      result.current.reset();
    });
    
    // Value should be reset to empty string
    expect(result.current.value).toBe('');
    
    // Fast-forward time to update debounced value
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current.debouncedValue).toBe('');
  });

  it('should set input value directly', () => {
    const { result } = renderHook(() => 
      useDebouncedInput('initial', 500)
    );
    
    // Set value directly
    act(() => {
      result.current.setValue('direct value');
    });
    
    expect(result.current.value).toBe('direct value');
    
    // Fast-forward time to update debounced value
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current.debouncedValue).toBe('direct value');
  });
}); 