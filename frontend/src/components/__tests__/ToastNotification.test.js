import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastNotification from '../ToastNotification';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../styles/theme';

// Create a wrapper component to provide the theme
const renderWithTheme = (ui) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('ToastNotification Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    message: 'Test notification',
    severity: 'info',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    renderWithTheme(<ToastNotification {...defaultProps} />);
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    renderWithTheme(<ToastNotification {...defaultProps} open={false} />);
    
    // The toast is not in the document when open is false
    expect(screen.queryByText('Test notification')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithTheme(<ToastNotification {...defaultProps} />);
    
    // Find the close button (IconButton with aria-label="close")
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Expect onClose to have been called
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with correct severity styles', () => {
    const { rerender } = renderWithTheme(
      <ToastNotification {...defaultProps} severity="success" />
    );
    
    // Success icon should be present (we can't easily test styles, but we can check the alert role)
    const successAlert = screen.getByRole('alert');
    expect(successAlert).toBeInTheDocument();
    
    // Rerender with error severity
    rerender(
      <ThemeProvider theme={theme}>
        <ToastNotification {...defaultProps} severity="error" />
      </ThemeProvider>
    );
    
    // Error alert should be present
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
  });

  it('renders with title when provided', () => {
    renderWithTheme(
      <ToastNotification 
        {...defaultProps} 
        title="Notification Title" 
      />
    );
    
    expect(screen.getByText('Notification Title')).toBeInTheDocument();
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('renders with custom action when provided', () => {
    const customAction = <button>Custom Action</button>;
    
    renderWithTheme(
      <ToastNotification 
        {...defaultProps} 
        action={customAction}
      />
    );
    
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
    
    // Close button should not be present when custom action is provided
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders with correct position', () => {
    // We can't easily test the position styling, but we can ensure it doesn't crash
    renderWithTheme(
      <ToastNotification 
        {...defaultProps} 
        position={{ vertical: 'top', horizontal: 'left' }}
      />
    );
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });
}); 