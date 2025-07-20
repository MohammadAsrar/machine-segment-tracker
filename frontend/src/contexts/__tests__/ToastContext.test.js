import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastContext';

// Test component that uses the toast context
const TestComponent = () => {
  const { showToast, showSuccess, showError, showWarning, showInfo } = useToast();
  
  return (
    <div>
      <button 
        onClick={() => showToast({ message: 'Toast message' })}
        data-testid="show-toast-btn"
      >
        Show Toast
      </button>
      <button 
        onClick={() => showSuccess('Success message')}
        data-testid="show-success-btn"
      >
        Show Success
      </button>
      <button 
        onClick={() => showError('Error message')}
        data-testid="show-error-btn"
      >
        Show Error
      </button>
      <button 
        onClick={() => showWarning('Warning message')}
        data-testid="show-warning-btn"
      >
        Show Warning
      </button>
      <button 
        onClick={() => showInfo('Info message')}
        data-testid="show-info-btn"
      >
        Show Info
      </button>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    // Clear any previous toasts
    jest.clearAllMocks();
  });

  it('provides toast functions and renders toast notification', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Initially, no toast should be visible
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    
    // Show a toast
    fireEvent.click(screen.getByTestId('show-toast-btn'));
    
    // Toast should be visible now
    expect(screen.getByText('Toast message')).toBeInTheDocument();
  });

  it('shows success toast correctly', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Show a success toast
    fireEvent.click(screen.getByTestId('show-success-btn'));
    
    // Success toast should be visible
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('shows error toast correctly', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Show an error toast
    fireEvent.click(screen.getByTestId('show-error-btn'));
    
    // Error toast should be visible
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('shows warning toast correctly', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Show a warning toast
    fireEvent.click(screen.getByTestId('show-warning-btn'));
    
    // Warning toast should be visible
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('shows info toast correctly', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Show an info toast
    fireEvent.click(screen.getByTestId('show-info-btn'));
    
    // Info toast should be visible
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('automatically hides toast after autoHideDuration', () => {
    // Mock timers for testing autoHideDuration
    jest.useFakeTimers();
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    // Show a toast
    fireEvent.click(screen.getByTestId('show-toast-btn'));
    
    // Toast should be visible
    expect(screen.getByText('Toast message')).toBeInTheDocument();
    
    // Advance timers by the default autoHideDuration (5000ms)
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Toast should be gone now
    expect(screen.queryByText('Toast message')).not.toBeInTheDocument();
    
    // Restore real timers
    jest.useRealTimers();
  });

  it('throws an error when useToast is used outside of ToastProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    // Expect an error when rendering TestComponent without ToastProvider
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    // Restore console.error
    console.error = originalError;
  });
}); 