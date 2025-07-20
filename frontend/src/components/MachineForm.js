import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import { machineApi } from "../services/api";

const initialFormData = {
  name: "",
  serialNumber: "",
  type: "",
  status: "active",
  location: "",
};

const MachineForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required";
    }

    if (!formData.type.trim()) {
      newErrors.type = "Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await machineApi.create(formData);
      setSubmitSuccess(true);
      setFormData(initialFormData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          "Failed to create machine. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Machine
      </Typography>

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Machine created successfully!
        </Alert>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Machine Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Serial Number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              error={!!errors.serialNumber}
              helperText={errors.serialNumber}
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Machine Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={!!errors.type}
              helperText={errors.type}
              required
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="decommissioned">Decommissioned</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                sx={{ mr: 1 }}
                onClick={() => setFormData(initialFormData)}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Add Machine"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default MachineForm;
