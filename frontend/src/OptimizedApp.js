import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import {
  Container,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import "./styles/App.css";
import designSystem from "./styles/designSystem";
import PatternLabLogo from "./assets/patternlab-real-logo.png";
import { useMachines, useSegments, useCreateSegment } from "./hooks/useApi";
import { useToast } from "./contexts/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import TableSkeleton from "./components/TableSkeleton";
import ConfirmationDialog from "./components/ConfirmationDialog";

// Lazy loaded components
const EnhancedSegmentForm = lazy(() =>
  import("./components/EnhancedSegmentForm")
);
const OptimizedDataTable = lazy(() =>
  import("./components/OptimizedDataTable")
);
const MachineTimeline = lazy(() => import("./components/MachineTimeline"));
const Timeline = lazy(() => import("./components/Timeline"));

// Styled components
const AppContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  padding: theme.spacing(2),
  boxShadow: designSystem.shadows.sm,
  display: "flex",
  alignItems: "center",
}));

const Logo = styled("img")(({ theme }) => ({
  height: "40px",
}));

const MainContent = styled(Container)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: designSystem.typography.fontWeight.medium,
}));

const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  borderRadius: designSystem.components.card.borderRadius,
  boxShadow: designSystem.shadows.sm,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StatusBar = styled(Box)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  padding: theme.spacing(1),
  borderTop: `1px solid ${designSystem.colors.ui.border.light}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const ViewToggle = styled(ButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(0),
}));

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    }}
  >
    <CircularProgress />
  </Box>
);

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function OptimizedApp() {
  // State
  const [timelineView, setTimelineView] = useState("simple");
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Get toast notifications
  const { showSuccess, showError } = useToast();

  // API hooks
  const {
    data: machines,
    loading: machinesLoading,
    error: machinesError,
    execute: fetchMachines,
  } = useMachines({
    // Use sample data for now
    initialData: getSampleMachines(),
    executeOnMount: true,
  });

  const {
    data: segments,
    loading: segmentsLoading,
    error: segmentsError,
    execute: fetchSegments,
  } = useSegments({
    // Use sample data for now
    initialData: getSampleSegments(),
    executeOnMount: true,
  });

  const {
    loading: createLoading,
    error: createError,
    execute: createSegment,
  } = useCreateSegment({
    onSuccess: (data) => {
      showSuccess("Segment saved successfully");
      // Refresh data
      fetchMachines();
      fetchSegments();
    },
    onError: (err) => {
      showError(err.message || "Failed to save segment");
    },
  });

  // Toggle timeline view
  const handleToggleTimelineView = (view) => {
    setTimelineView(view);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle segment save
  const handleSaveSegment = useCallback(
    async (segment) => {
      try {
        // In a real app, this would call the API
        await createSegment(segment);

        // Update local state
        const updatedSegments = [...segments, segment];

        // Update machine timeline data
        if (segment.segmentType.toLowerCase() !== "select segment") {
          const updatedMachines = [...machines];
          const machineIndex = updatedMachines.findIndex(
            (m) => m.name === segment.machineName
          );

          if (machineIndex !== -1) {
            // Calculate duration in minutes
            const startTime = new Date(`${segment.date}T${segment.startTime}`);
            const endTime = new Date(`${segment.date}T${segment.endTime}`);
            const durationMinutes = Math.round((endTime - startTime) / 60000);

            // Add new segment to machine
            updatedMachines[machineIndex].segments.push({
              status: segment.segmentType.toLowerCase(),
              duration: durationMinutes,
              startTime: segment.startTime,
              endTime: segment.endTime,
            });
          }
        }
      } catch (error) {
        showError("Failed to save segment: " + error.message);
      }
    },
    [segments, machines, createSegment, showError]
  );

  // Handle delete segment
  const handleDeleteClick = useCallback((segment) => {
    setItemToDelete(segment);
    setDeleteDialogOpen(true);
  }, []);

  // Confirm delete segment
  const handleConfirmDelete = useCallback(() => {
    // In a real app, this would call the API
    showSuccess("Segment deleted successfully");
    setDeleteDialogOpen(false);
    setItemToDelete(null);

    // Refresh data
    fetchMachines();
    fetchSegments();
  }, [fetchMachines, fetchSegments, showSuccess]);

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page on search
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  }, []);

  // Filter segments based on search query
  const filteredSegments = useMemo(() => {
    if (!searchQuery) return segments;

    const query = searchQuery.toLowerCase();
    return segments.filter(
      (segment) =>
        segment.machineName.toLowerCase().includes(query) ||
        segment.segmentType.toLowerCase().includes(query) ||
        segment.date.includes(query)
    );
  }, [segments, searchQuery]);

  // Paginate segments
  const paginatedSegments = useMemo(() => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSegments.slice(startIndex, endIndex);
  }, [filteredSegments, page, pageSize]);

  // Table columns definition
  const columns = useMemo(
    () => [
      { field: "date", headerName: "Date", width: "15%" },
      { field: "machineName", headerName: "Machine", width: "20%" },
      { field: "segmentType", headerName: "Type", width: "15%" },
      { field: "startTime", headerName: "Start Time", width: "15%" },
      { field: "endTime", headerName: "End Time", width: "15%" },
      {
        field: "duration",
        headerName: "Duration",
        width: "10%",
        renderCell: (row) => {
          const startTime = new Date(`${row.date}T${row.startTime}`);
          const endTime = new Date(`${row.date}T${row.endTime}`);
          const durationMinutes = Math.round((endTime - startTime) / 60000);
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          return `${hours}h ${minutes}m`;
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: "10%",
        renderCell: (row) => (
          <Button
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    [handleDeleteClick]
  );

  // Show errors if any
  useEffect(() => {
    if (machinesError) {
      showError("Failed to load machines: " + machinesError.message);
    }
    if (segmentsError) {
      showError("Failed to load segments: " + segmentsError.message);
    }
  }, [machinesError, segmentsError, showError]);

  return (
    <AppContainer>
      <Header>
        <Logo src={PatternLabLogo} alt="PatternLab Logo" />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Machine Segment Tracker
        </Typography>
      </Header>

      <MainContent>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <EnhancedSegmentForm
              onSave={handleSaveSegment}
              existingSegments={segments}
              saveStatus={createLoading ? "saving" : "idle"}
            />
          </Suspense>
        </ErrorBoundary>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="data view tabs"
          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Table View" />
          <Tab label="Timeline View" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ErrorBoundary>
            <Suspense fallback={<TableSkeleton rows={10} columns={7} />}>
              <OptimizedDataTable
                data={paginatedSegments}
                columns={columns}
                title="Machine Segments"
                loading={segmentsLoading}
                onSearch={handleSearch}
                page={page}
                pageSize={pageSize}
                totalCount={filteredSegments.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </Suspense>
          </ErrorBoundary>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ContentBox>
            <Box
              sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
            >
              <SectionTitle variant="h6">Timeline View</SectionTitle>
              <ViewToggle>
                <Button
                  variant={timelineView === "simple" ? "contained" : "outlined"}
                  onClick={() => handleToggleTimelineView("simple")}
                >
                  Simple
                </Button>
                <Button
                  variant={
                    timelineView === "advanced" ? "contained" : "outlined"
                  }
                  onClick={() => handleToggleTimelineView("advanced")}
                >
                  Advanced
                </Button>
              </ViewToggle>
            </Box>

            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                {timelineView === "simple" ? (
                  <MachineTimeline
                    machines={machines}
                    loading={machinesLoading}
                  />
                ) : (
                  <Timeline
                    machines={machines}
                    segments={segments}
                    loading={machinesLoading || segmentsLoading}
                  />
                )}
              </Suspense>
            </ErrorBoundary>
          </ContentBox>
        </TabPanel>
      </MainContent>

      <StatusBar>
        <Typography variant="body2" color="textSecondary">
          {`${filteredSegments.length} segments`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {`${machines.length} machines`}
        </Typography>
      </StatusBar>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Segment"
        message={`Are you sure you want to delete this segment for ${
          itemToDelete?.machineName || "this machine"
        }?`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="danger"
      />
    </AppContainer>
  );
}

// Sample data functions
function getSampleMachines() {
  return [
    {
      id: 1,
      name: "Machine A",
      type: "CNC",
      status: "active",
      segments: [
        {
          status: "uptime",
          duration: 120, // 2 hours
          startTime: "08:00:00",
          endTime: "10:00:00",
        },
        {
          status: "downtime",
          duration: 60, // 1 hour
          startTime: "10:00:00",
          endTime: "11:00:00",
        },
        {
          status: "uptime",
          duration: 240, // 4 hours
          startTime: "11:00:00",
          endTime: "15:00:00",
        },
        {
          status: "idle",
          duration: 60, // 1 hour
          startTime: "15:00:00",
          endTime: "16:00:00",
        },
      ],
    },
    {
      id: 2,
      name: "Machine B",
      type: "Lathe",
      status: "inactive",
      segments: [
        {
          status: "uptime",
          duration: 180, // 3 hours
          startTime: "08:00:00",
          endTime: "11:00:00",
        },
        {
          status: "idle",
          duration: 60, // 1 hour
          startTime: "11:00:00",
          endTime: "12:00:00",
        },
        {
          status: "downtime",
          duration: 120, // 2 hours
          startTime: "12:00:00",
          endTime: "14:00:00",
        },
        {
          status: "uptime",
          duration: 120, // 2 hours
          startTime: "14:00:00",
          endTime: "16:00:00",
        },
      ],
    },
    {
      id: 3,
      name: "Machine C",
      type: "Mill",
      status: "active",
      segments: [
        {
          status: "uptime",
          duration: 240, // 4 hours
          startTime: "08:00:00",
          endTime: "12:00:00",
        },
        {
          status: "idle",
          duration: 60, // 1 hour
          startTime: "12:00:00",
          endTime: "13:00:00",
        },
        {
          status: "uptime",
          duration: 180, // 3 hours
          startTime: "13:00:00",
          endTime: "16:00:00",
        },
      ],
    },
    {
      id: 4,
      name: "Machine D",
      type: "Router",
      status: "maintenance",
      segments: [
        {
          status: "uptime",
          duration: 120, // 2 hours
          startTime: "08:00:00",
          endTime: "10:00:00",
        },
        {
          status: "downtime",
          duration: 360, // 6 hours
          startTime: "10:00:00",
          endTime: "16:00:00",
        },
      ],
    },
    {
      id: 5,
      name: "Machine E",
      type: "Drill",
      status: "active",
      segments: [
        {
          status: "idle",
          duration: 60, // 1 hour
          startTime: "08:00:00",
          endTime: "09:00:00",
        },
        {
          status: "uptime",
          duration: 420, // 7 hours
          startTime: "09:00:00",
          endTime: "16:00:00",
        },
      ],
    },
  ];
}

function getSampleSegments() {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: 1,
      date: today,
      machineName: "Machine A",
      segmentType: "Uptime",
      startTime: "08:00:00",
      endTime: "10:00:00",
    },
    {
      id: 2,
      date: today,
      machineName: "Machine A",
      segmentType: "Downtime",
      startTime: "10:00:00",
      endTime: "11:00:00",
    },
    {
      id: 3,
      date: today,
      machineName: "Machine A",
      segmentType: "Uptime",
      startTime: "11:00:00",
      endTime: "15:00:00",
    },
    {
      id: 4,
      date: today,
      machineName: "Machine A",
      segmentType: "Idle",
      startTime: "15:00:00",
      endTime: "16:00:00",
    },
    {
      id: 5,
      date: today,
      machineName: "Machine B",
      segmentType: "Uptime",
      startTime: "08:00:00",
      endTime: "11:00:00",
    },
    {
      id: 6,
      date: today,
      machineName: "Machine B",
      segmentType: "Idle",
      startTime: "11:00:00",
      endTime: "12:00:00",
    },
    {
      id: 7,
      date: today,
      machineName: "Machine B",
      segmentType: "Downtime",
      startTime: "12:00:00",
      endTime: "14:00:00",
    },
    {
      id: 8,
      date: today,
      machineName: "Machine B",
      segmentType: "Uptime",
      startTime: "14:00:00",
      endTime: "16:00:00",
    },
    {
      id: 9,
      date: today,
      machineName: "Machine C",
      segmentType: "Uptime",
      startTime: "08:00:00",
      endTime: "12:00:00",
    },
    {
      id: 10,
      date: today,
      machineName: "Machine C",
      segmentType: "Idle",
      startTime: "12:00:00",
      endTime: "13:00:00",
    },
    {
      id: 11,
      date: today,
      machineName: "Machine C",
      segmentType: "Uptime",
      startTime: "13:00:00",
      endTime: "16:00:00",
    },
    {
      id: 12,
      date: today,
      machineName: "Machine D",
      segmentType: "Uptime",
      startTime: "08:00:00",
      endTime: "10:00:00",
    },
    {
      id: 13,
      date: today,
      machineName: "Machine D",
      segmentType: "Downtime",
      startTime: "10:00:00",
      endTime: "16:00:00",
    },
    {
      id: 14,
      date: today,
      machineName: "Machine E",
      segmentType: "Idle",
      startTime: "08:00:00",
      endTime: "09:00:00",
    },
    {
      id: 15,
      date: today,
      machineName: "Machine E",
      segmentType: "Uptime",
      startTime: "09:00:00",
      endTime: "16:00:00",
    },
  ];
}

export default OptimizedApp;
