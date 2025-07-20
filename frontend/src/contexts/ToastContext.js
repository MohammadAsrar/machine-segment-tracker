import React, { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import ToastNotification from "../components/ToastNotification";

// Create context
const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

/**
 * Toast Provider Component
 *
 * Provides toast notification functionality to the entire app
 */
export const ToastProvider = ({ children }) => {
  // State for toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: 5000,
    title: "",
    position: { vertical: "bottom", horizontal: "right" },
  });

  // Show toast
  const showToast = useCallback(
    ({
      message,
      severity = "info",
      autoHideDuration = 5000,
      title = "",
      position = { vertical: "bottom", horizontal: "right" },
    }) => {
      setToast({
        open: true,
        message,
        severity,
        autoHideDuration,
        title,
        position,
      });
    },
    []
  );

  // Hide toast
  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  // Success toast shorthand
  const showSuccess = useCallback(
    (message, options = {}) => {
      showToast({
        message,
        severity: "success",
        ...options,
      });
    },
    [showToast]
  );

  // Error toast shorthand
  const showError = useCallback(
    (message, options = {}) => {
      showToast({
        message,
        severity: "error",
        ...options,
      });
    },
    [showToast]
  );

  // Warning toast shorthand
  const showWarning = useCallback(
    (message, options = {}) => {
      showToast({
        message,
        severity: "warning",
        ...options,
      });
    },
    [showToast]
  );

  // Info toast shorthand
  const showInfo = useCallback(
    (message, options = {}) => {
      showToast({
        message,
        severity: "info",
        ...options,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastNotification
        open={toast.open}
        onClose={hideToast}
        message={toast.message}
        severity={toast.severity}
        autoHideDuration={toast.autoHideDuration}
        position={toast.position}
        title={toast.title}
      />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to use toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

export default ToastContext;
