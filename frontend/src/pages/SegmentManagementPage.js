import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SegmentForm from "../components/SegmentForm";
import DataTable from "../components/DataTable";
import Timeline from "../components/Timeline";
import useApi from "../hooks/useApi";
import { validateSegmentForm } from "../utils/validation";
import designSystem from "../styles/designSystem";

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: designSystem.typography.fontWeight.bold,
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}));

/**
 * SegmentManagementPage Component
 *
 * Main page for managing machine segments with validation
 */
const SegmentManagementPage = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // API hooks with validation
  const segmentsApi = useApi({
    validateFn: validateSegmentForm,
  });

  // Fetch segments on mount
  useEffect(() => {
    fetchSegments();
  }, []);

  // Fetch segments from API
  const fetchSegments = async () => {
    try {
      await segmentsApi.fetchData("/api/segments");
    } catch (error) {
      showNotification("Failed to load segments", "error");
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle segment creation
  const handleCreateSegment = async (formData) => {
    try {
      const result = await segmentsApi.createData("/api/segments", formData);

      if (result.success) {
        showNotification("Segment created successfully", "success");
      } else if (result.errors) {
        return { success: false, errors: result.errors };
      } else {
        showNotification("Failed to create segment", "error");
      }

      return { success: true };
    } catch (error) {
      showNotification("Failed to create segment", "error");
      return { success: false, error: error.message };
    }
  };

  // Handle segment update
  const handleUpdateSegment = async (updatedSegment) => {
    try {
      const result = await segmentsApi.updateData(
        "/api/segments",
        updatedSegment.id,
        updatedSegment
      );

      if (result.success) {
        showNotification("Segment updated successfully", "success");
      } else if (result.errors) {
        return { success: false, errors: result.errors };
      } else {
        showNotification("Failed to update segment", "error");
      }

      return { success: true };
    } catch (error) {
      showNotification("Failed to update segment", "error");
      return { success: false, error: error.message };
    }
  };

  // Handle segment deletion
  const handleDeleteSegment = async (segment) => {
    try {
      const result = await segmentsApi.deleteData("/api/segments", segment.id);

      if (result.success) {
        showNotification("Segment deleted successfully", "success");
      } else {
        showNotification("Failed to delete segment", "error");
      }
    } catch (error) {
      showNotification("Failed to delete segment", "error");
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async (segments, segmentType) => {
    try {
      const ids = segments.map((segment) => segment.id);
      const result = await segmentsApi.bulkUpdate("/api/segments", ids, {
        segmentType,
      });

      if (result.success) {
        showNotification(
          `${ids.length} segments updated successfully`,
          "success"
        );
      } else {
        showNotification("Failed to update segments", "error");
      }
    } catch (error) {
      showNotification("Failed to update segments", "error");
    }
  };

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <PageContainer maxWidth="xl">
      <PageTitle variant="h4">Machine Segment Tracker</PageTitle>

      <TabsContainer>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="segment management tabs"
        >
          <Tab label="Form View" />
          <Tab label="Table View" />
          <Tab label="Timeline View" />
        </Tabs>
      </TabsContainer>

      {/* Form Tab */}
      {activeTab === 0 && (
        <Box>
          <SegmentForm
            onSubmit={handleCreateSegment}
            existingSegments={segmentsApi.data}
            isSubmitting={segmentsApi.loading}
            submitError={segmentsApi.error}
          />
        </Box>
      )}

      {/* Table Tab */}
      {activeTab === 1 && (
        <Box>
          {segmentsApi.loading && !segmentsApi.data.length ? (
            <Typography>Loading segments...</Typography>
          ) : (
            <DataTable
              data={segmentsApi.data}
              onSave={handleUpdateSegment}
              onDelete={handleDeleteSegment}
              onBulkUpdate={handleBulkUpdate}
              title="Machine Segments"
            />
          )}
        </Box>
      )}

      {/* Timeline Tab */}
      {activeTab === 2 && (
        <Box>
          {segmentsApi.loading && !segmentsApi.data.length ? (
            <Typography>Loading timeline...</Typography>
          ) : (
            <Timeline segments={segmentsApi.data} />
          )}
        </Box>
      )}

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default SegmentManagementPage;
