import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  FormHelperText,
  Alert,
  Collapse,
  Fade,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  LocalizationProvider,
  TimePicker,
  DatePicker,
} from "@mui/x-date-pickers";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import designSystem from "../styles/designSystem";
import useRealTimeValidation from "../hooks/useRealTimeValidation";
import {
  validateSegmentForm,
  formatTimeString,
  formatDateString,
} from "../utils/validation";

// Styled components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: designSystem.shadows.sm,
  borderRadius: designSystem.components.card.borderRadius,
  position: "relative",
  overflow: "hidden",
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: designSystem.typography.fontWeight.medium,
}));

const SaveButton = styled(Button)(({ theme, status }) => {
  let backgroundColor = designSystem.colors.button.save.default;
  let color = designSystem.colors.ui.text.primary;
  let borderColor = designSystem.colors.ui.border.light;

  if (status === "saving") {
    backgroundColor = designSystem.colors.ui.background.hover;
    borderColor = designSystem.colors.ui.border.medium;
  }

  return {
    backgroundColor,
    color,
    border: `1px solid ${borderColor}`,
    minWidth: "120px",
    "&:hover": {
      backgroundColor: designSystem.colors.button.save.hover,
    },
  };
});

const ValidationIndicator = styled(Box)(({ theme, status }) => ({
  display: "flex",
  alignItems: "center",
  marginLeft: theme.spacing(1),
  color:
    status === "valid"
      ? theme.palette.success.main
      : status === "error"
      ? theme.palette.error.main
      : theme.palette.grey[400],
}));

const FormLoadingOverlay = styled(Box)(({ theme, show }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  display: show ? "flex" : "none",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
}));

/**
 * EnhancedSegmentForm Component
 *
 * Form for adding and editing machine segments with advanced validation
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSave - Callback function when form is saved
 * @param {Array} props.existingSegments - Array of existing segments for validation
 * @param {String} props.saveStatus - Current save status ('idle', 'saving', 'success', 'error')
 */
const EnhancedSegmentForm = ({
  onSave,
  existingSegments = [],
  saveStatus = "idle",
}) => {
  // Initialize form with empty values
  const initialValues = {
    date: formatDateString(new Date()),
    startTime: formatTimeString(new Date()),
    endTime: formatTimeString(new Date(Date.now() + 60 * 60 * 1000)), // 1 hour later
    machineName: "",
    segmentType: "",
  };

  // Use real-time validation hook
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isValidating,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    hasError,
    getErrorMessage,
    getFieldStatus,
    isFieldValidating,
    isFieldValid,
  } = useRealTimeValidation(
    initialValues,
    (formData) => validateSegmentForm(formData, existingSegments),
    { existingSegments },
    { validateOnChange: true, validateOnBlur: true, debounceMs: 300 }
  );

  // Segment type options
  const segmentTypes = ["Uptime", "Idle", "Downtime"];

  // Machine name options (derived from existing segments)
  const machineNames = useMemo(() => {
    return [...new Set(existingSegments.map((segment) => segment.machineName))]
      .filter(Boolean)
      .sort();
  }, [existingSegments]);

  // Handle form submission
  const submitForm = async (formData) => {
    if (onSave) {
      await onSave(formData);
      resetForm();
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    handleChange("date", formatDateString(date));
  };

  // Handle time change
  const handleTimeChange = (field, time) => {
    handleChange(field, formatTimeString(time));
  };

  // Render validation indicator
  const renderValidationIndicator = (field) => {
    const status = getFieldStatus(field);

    if (status === "validating") {
      return (
        <ValidationIndicator status={status}>
          <CircularProgress size={16} />
        </ValidationIndicator>
      );
    }

    if (status === "valid" && touched[field]) {
      return (
        <ValidationIndicator status={status}>
          <CheckCircleIcon fontSize="small" />
        </ValidationIndicator>
      );
    }

    if (status === "error" && touched[field]) {
      return (
        <ValidationIndicator status={status}>
          <ErrorIcon fontSize="small" />
        </ValidationIndicator>
      );
    }

    return null;
  };

  return (
    <FormContainer>
      <FormLoadingOverlay show={saveStatus === "saving"}>
        <CircularProgress />
      </FormLoadingOverlay>

      <FormTitle variant="h6">Add Machine Segment</FormTitle>

      {errors.general && (
        <Collapse in={Boolean(errors.general)}>
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Tooltip title="Segments cannot overlap for the same machine on the same date">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            {errors.general}
          </Alert>
        </Collapse>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <form onSubmit={handleSubmit(submitForm)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <DatePicker
                  label="Date"
                  value={values.date ? new Date(values.date) : null}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      error={hasError("date")}
                      helperText={getErrorMessage("date")}
                      onBlur={() => handleBlur("date")}
                      sx={{ flexGrow: 1 }}
                    />
                  )}
                />
                {renderValidationIndicator("date")}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <TimePicker
                  label="Start time"
                  value={
                    values.startTime
                      ? new Date(`2000-01-01T${values.startTime}`)
                      : null
                  }
                  onChange={(time) => handleTimeChange("startTime", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      error={hasError("startTime")}
                      helperText={getErrorMessage("startTime")}
                      onBlur={() => handleBlur("startTime")}
                      sx={{ flexGrow: 1 }}
                    />
                  )}
                />
                {renderValidationIndicator("startTime")}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <TimePicker
                  label="End time"
                  value={
                    values.endTime
                      ? new Date(`2000-01-01T${values.endTime}`)
                      : null
                  }
                  onChange={(time) => handleTimeChange("endTime", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      error={hasError("endTime")}
                      helperText={getErrorMessage("endTime")}
                      onBlur={() => handleBlur("endTime")}
                      sx={{ flexGrow: 1 }}
                    />
                  )}
                />
                {renderValidationIndicator("endTime")}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <FormControl
                  fullWidth
                  size="small"
                  error={hasError("machineName")}
                >
                  <InputLabel id="machine-name-label">Machine</InputLabel>
                  <Select
                    labelId="machine-name-label"
                    id="machine-name"
                    value={values.machineName}
                    label="Machine"
                    onChange={(e) =>
                      handleChange("machineName", e.target.value)
                    }
                    onBlur={() => handleBlur("machineName")}
                  >
                    <MenuItem value="">
                      <em>Select machine</em>
                    </MenuItem>
                    {machineNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                  {hasError("machineName") && (
                    <FormHelperText>
                      {getErrorMessage("machineName")}
                    </FormHelperText>
                  )}
                </FormControl>
                {renderValidationIndicator("machineName")}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <FormControl
                  fullWidth
                  size="small"
                  error={hasError("segmentType")}
                >
                  <InputLabel id="segment-type-label">Segment Type</InputLabel>
                  <Select
                    labelId="segment-type-label"
                    id="segment-type"
                    value={values.segmentType}
                    label="Segment Type"
                    onChange={(e) =>
                      handleChange("segmentType", e.target.value)
                    }
                    onBlur={() => handleBlur("segmentType")}
                  >
                    <MenuItem value="">
                      <em>Select type</em>
                    </MenuItem>
                    {segmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {hasError("segmentType") && (
                    <FormHelperText>
                      {getErrorMessage("segmentType")}
                    </FormHelperText>
                  )}
                </FormControl>
                {renderValidationIndicator("segmentType")}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <SaveButton
                variant="contained"
                type="submit"
                disabled={
                  !isValid ||
                  isSubmitting ||
                  saveStatus === "saving" ||
                  isValidating
                }
                status={saveStatus}
                startIcon={
                  saveStatus === "saving" && (
                    <CircularProgress size={16} color="inherit" />
                  )
                }
              >
                {saveStatus === "saving" ? "Saving..." : "Save Segment"}
              </SaveButton>
            </Grid>
          </Grid>
        </form>
      </LocalizationProvider>
    </FormContainer>
  );
};

EnhancedSegmentForm.propTypes = {
  onSave: PropTypes.func.isRequired,
  existingSegments: PropTypes.array,
  saveStatus: PropTypes.oneOf(["idle", "saving", "success", "error"]),
};

export default EnhancedSegmentForm;
