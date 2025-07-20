import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import useFormValidation from "../hooks/useFormValidation";
import {
  validateSegmentForm,
  formatTimeString,
  formatDateString,
} from "../utils/validation";
import designSystem from "../styles/designSystem";

// Styled components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: designSystem.components.card.borderRadius,
  boxShadow: designSystem.shadows.sm,
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: designSystem.typography.fontWeight.medium,
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: designSystem.colors.button.primary.default,
  "&:hover": {
    backgroundColor: designSystem.colors.button.primary.hover,
  },
}));

/**
 * SegmentForm Component
 *
 * A form component for creating and editing machine segments with validation
 *
 * @param {Object} props - Component props
 */
const SegmentForm = ({
  initialValues = {},
  onSubmit,
  existingSegments = [],
  isSubmitting = false,
  submitError = null,
  title = "Add New Segment",
}) => {
  // Default initial values
  const defaultValues = {
    date: formatDateString(new Date()),
    startTime: formatTimeString(new Date()),
    endTime: formatTimeString(new Date(Date.now() + 60 * 60 * 1000)), // 1 hour later
    machineName: "",
    segmentType: "",
    ...initialValues,
  };

  // Use form validation hook
  const {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    hasError,
    getErrorMessage,
  } = useFormValidation(defaultValues, (formData) =>
    validateSegmentForm(formData, existingSegments)
  );

  // Segment type options
  const segmentTypes = ["Uptime", "Idle", "Downtime"];

  // Machine name options (derived from existing segments)
  const machineNames = [
    ...new Set(existingSegments.map((segment) => segment.machineName)),
  ]
    .filter(Boolean)
    .sort();

  // Handle form submission
  const submitForm = async (formData) => {
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFieldValue("date", formatDateString(date));
  };

  // Handle time change
  const handleTimeChange = (field, time) => {
    setFieldValue(field, formatTimeString(time));
  };

  // Reset form when initialValues change
  useEffect(() => {
    resetForm({
      ...defaultValues,
      ...initialValues,
    });
  }, [JSON.stringify(initialValues)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormContainer>
      <FormTitle variant="h6">{title}</FormTitle>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <form onSubmit={handleSubmit(submitForm)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                label="Date"
                value={values.date ? new Date(values.date) : null}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={hasError("date")}
                    helperText={getErrorMessage("date")}
                    onBlur={() => handleBlur("date")}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TimePicker
                label="Start Time"
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
                    error={hasError("startTime")}
                    helperText={getErrorMessage("startTime")}
                    onBlur={() => handleBlur("startTime")}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TimePicker
                label="End Time"
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
                    error={hasError("endTime")}
                    helperText={getErrorMessage("endTime")}
                    onBlur={() => handleBlur("endTime")}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={hasError("machineName")}>
                <InputLabel>Machine Name</InputLabel>
                <Select
                  value={values.machineName || ""}
                  onChange={(e) => handleChange("machineName", e.target.value)}
                  onBlur={() => handleBlur("machineName")}
                  label="Machine Name"
                >
                  <MenuItem value="">
                    <em>Select Machine</em>
                  </MenuItem>
                  {machineNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                  {/* Allow custom machine names */}
                  {!machineNames.includes("M1") && (
                    <MenuItem value="M1">M1</MenuItem>
                  )}
                  {!machineNames.includes("M2") && (
                    <MenuItem value="M2">M2</MenuItem>
                  )}
                  {!machineNames.includes("M3") && (
                    <MenuItem value="M3">M3</MenuItem>
                  )}
                </Select>
                {hasError("machineName") && (
                  <FormHelperText>
                    {getErrorMessage("machineName")}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={hasError("segmentType")}>
                <InputLabel>Segment Type</InputLabel>
                <Select
                  value={values.segmentType || ""}
                  onChange={(e) => handleChange("segmentType", e.target.value)}
                  onBlur={() => handleBlur("segmentType")}
                  label="Segment Type"
                >
                  <MenuItem value="">
                    <em>Select Type</em>
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
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  sx={{ mr: 2 }}
                  onClick={() => resetForm()}
                  disabled={isSubmitting || !isDirty}
                >
                  Reset
                </Button>
                <SubmitButton
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isValid || !isDirty}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </SubmitButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </LocalizationProvider>
    </FormContainer>
  );
};

SegmentForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  existingSegments: PropTypes.array,
  isSubmitting: PropTypes.bool,
  submitError: PropTypes.string,
  title: PropTypes.string,
};

export default SegmentForm;
