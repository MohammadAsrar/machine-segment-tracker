import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
  Snackbar,
  Alert,
  Typography,
  Box,
  IconButton,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";

// Custom slide transition
const SlideTransition = forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ToastNotification Component
 *
 * Displays toast notifications for user feedback
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the notification is open
 * @param {Function} props.onClose - Function to call when notification is closed
 * @param {string} props.message - Message to display
 * @param {string} props.severity - Severity of the notification (success, error, warning, info)
 * @param {number} props.autoHideDuration - Duration in ms before auto-hiding
 * @param {string} props.position - Position of the notification
 * @param {boolean} props.showIcon - Whether to show the icon
 * @param {string} props.title - Optional title for the notification
 * @param {Function} props.action - Optional action button
 */
const ToastNotification = ({
  open,
  onClose,
  message,
  severity = "info",
  autoHideDuration = 5000,
  position = { vertical: "bottom", horizontal: "right" },
  showIcon = true,
  title,
  action,
}) => {
  // Get the appropriate icon based on severity
  const getIcon = () => {
    switch (severity) {
      case "success":
        return <CheckCircleIcon fontSize="small" />;
      case "error":
        return <ErrorIcon fontSize="small" />;
      case "warning":
        return <WarningIcon fontSize="small" />;
      case "info":
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        icon={showIcon ? getIcon() : null}
        sx={{
          width: "100%",
          boxShadow: 3,
          alignItems: "flex-start",
        }}
        action={
          action || (
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        <Box>
          {title && (
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", mb: 0.5 }}
            >
              {title}
            </Typography>
          )}
          <Typography variant="body2">{message}</Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

ToastNotification.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["success", "error", "warning", "info"]),
  autoHideDuration: PropTypes.number,
  position: PropTypes.shape({
    vertical: PropTypes.oneOf(["top", "bottom"]),
    horizontal: PropTypes.oneOf(["left", "center", "right"]),
  }),
  showIcon: PropTypes.bool,
  title: PropTypes.string,
  action: PropTypes.node,
};

export default ToastNotification;
