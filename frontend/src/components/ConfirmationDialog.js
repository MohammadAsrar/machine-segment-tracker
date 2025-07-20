import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import designSystem from "../styles/designSystem";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: designSystem.components.card.borderRadius,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme, severity }) => ({
  display: "flex",
  alignItems: "center",
  color:
    severity === "danger"
      ? theme.palette.error.main
      : theme.palette.primary.main,
  paddingBottom: theme.spacing(1),
}));

const TitleIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: "flex",
  alignItems: "center",
}));

const ActionButton = styled(Button)(({ theme, severity }) => ({
  color: severity === "danger" ? theme.palette.error.main : undefined,
  borderColor: severity === "danger" ? theme.palette.error.main : undefined,
  "&:hover": {
    backgroundColor:
      severity === "danger" ? "rgba(211, 47, 47, 0.04)" : undefined,
  },
}));

/**
 * ConfirmationDialog Component
 *
 * Displays a confirmation dialog for destructive actions
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onConfirm - Function to call when action is confirmed
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.severity - Severity of the action (default, danger)
 * @param {boolean} props.loading - Whether the action is loading
 */
const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "default",
  loading = false,
}) => {
  // Handle confirm action
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <StyledDialogTitle id="confirmation-dialog-title" severity={severity}>
        <TitleIcon>
          {severity === "danger" ? (
            <WarningIcon color="error" />
          ) : (
            <WarningIcon color="primary" />
          )}
        </TitleIcon>
        <Typography variant="h6">{title}</Typography>
      </StyledDialogTitle>

      <Divider />

      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="text">
          {cancelText}
        </Button>
        <ActionButton
          onClick={handleConfirm}
          variant="contained"
          severity={severity}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : severity === "danger" ? (
              <DeleteIcon />
            ) : null
          }
        >
          {loading ? "Processing..." : confirmText}
        </ActionButton>
      </DialogActions>
    </StyledDialog>
  );
};

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  severity: PropTypes.oneOf(["default", "danger"]),
  loading: PropTypes.bool,
};

export default ConfirmationDialog;
