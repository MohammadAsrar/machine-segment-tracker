import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormHelperText,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  LocalizationProvider,
  TimePicker,
  DatePicker,
} from "@mui/x-date-pickers";
import designSystem from "../styles/designSystem";
import useFormValidation from "../hooks/useFormValidation";
import {
  validateSegmentForm,
  formatTimeString,
  formatDateString,
} from "../utils/validation";

// Styled components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(0),
  boxShadow: "none",
}));

const TableContainerStyled = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(0),
  maxHeight: "400px",
  overflow: "auto",
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
    minWidth: "60px",
    "&:hover": {
      backgroundColor: designSystem.colors.button.save.hover,
    },
  };
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: designSystem.typography.fontSize.sm,
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontWeight: designSystem.typography.fontWeight.medium,
  backgroundColor: designSystem.colors.ui.background.paper,
  fontSize: designSystem.typography.fontSize.sm,
}));

/**
 * MachineSegmentForm Component
 *
 * Form for adding and editing machine segments with time tracking
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSave - Callback function when form is saved
 * @param {Array} props.existingSegments - Array of existing segments for the table
 * @param {String} props.saveStatus - Current save status ('idle', 'saving', 'success', 'error')
 */
const MachineSegmentForm = ({
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

  // Use form validation hook
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    hasError,
    getErrorMessage,
  } = useFormValidation(initialValues, (formData) =>
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

  return (
    <FormContainer>
      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <form onSubmit={handleSubmit(submitForm)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
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
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
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
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
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
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl
                fullWidth
                size="small"
                error={hasError("machineName")}
              >
                <InputLabel>Machine Name</InputLabel>
                <Select
                  value={values.machineName}
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
                  {!machineNames.includes("M4") && (
                    <MenuItem value="M4">M4</MenuItem>
                  )}
                  {!machineNames.includes("M5") && (
                    <MenuItem value="M5">M5</MenuItem>
                  )}
                </Select>
                {hasError("machineName") && (
                  <FormHelperText>
                    {getErrorMessage("machineName")}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                size="small"
                error={hasError("segmentType")}
              >
                <InputLabel>Segment type</InputLabel>
                <Select
                  value={values.segmentType}
                  onChange={(e) => handleChange("segmentType", e.target.value)}
                  onBlur={() => handleBlur("segmentType")}
                  label="Segment type"
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

            <Grid item xs={12} sm={6} md={1}>
              <Box
                sx={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SaveButton
                  variant="outlined"
                  type="submit"
                  status={saveStatus}
                  disabled={saveStatus === "saving" || isSubmitting || !isValid}
                >
                  {saveStatus === "saving" || isSubmitting ? (
                    <CircularProgress size={20} thickness={4} />
                  ) : (
                    "Save"
                  )}
                </SaveButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </LocalizationProvider>

      <TableContainerStyled>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>Date</StyledTableHeaderCell>
              <StyledTableHeaderCell>Start time</StyledTableHeaderCell>
              <StyledTableHeaderCell>End time</StyledTableHeaderCell>
              <StyledTableHeaderCell>Machine Name</StyledTableHeaderCell>
              <StyledTableHeaderCell>Segment type</StyledTableHeaderCell>
              <StyledTableHeaderCell>Save</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {existingSegments.map((segment, index) => (
              <TableRow key={index}>
                <StyledTableCell>
                  {formatDateToDisplay(segment.date)}
                </StyledTableCell>
                <StyledTableCell>{segment.startTime}</StyledTableCell>
                <StyledTableCell>{segment.endTime}</StyledTableCell>
                <StyledTableCell>{segment.machineName}</StyledTableCell>
                <StyledTableCell>{segment.segmentType}</StyledTableCell>
                <StyledTableCell>
                  <SaveButton variant="outlined" size="small">
                    Save
                  </SaveButton>
                </StyledTableCell>
              </TableRow>
            ))}

            {existingSegments.length === 0 && (
              <TableRow>
                <StyledTableCell colSpan={6} align="center">
                  No segments available
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainerStyled>
    </FormContainer>
  );
};

// Helper function to format date for display
const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return "";

  try {
    // Handle both YYYY-MM-DD and DD-MM-YYYY formats
    let date;
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        date = new Date(dateStr);
      } else {
        // DD-MM-YYYY format
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else {
      date = new Date(dateStr);
    }

    return date.toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
};

MachineSegmentForm.propTypes = {
  onSave: PropTypes.func,
  existingSegments: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      machineName: PropTypes.string,
      segmentType: PropTypes.string,
    })
  ),
  saveStatus: PropTypes.oneOf(["idle", "saving", "success", "error"]),
};

export default MachineSegmentForm;
