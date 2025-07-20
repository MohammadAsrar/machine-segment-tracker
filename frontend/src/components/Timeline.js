import React, { useState, useRef, useEffect, memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Tooltip,
  Paper,
  Grid,
  Zoom,
  IconButton,
  Slider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import InfoIcon from "@mui/icons-material/Info";
import designSystem from "../styles/designSystem";

// Styled components
const TimelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
}));

const TimelineHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const TimelineControls = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const TimelineScroller = styled(Box)(({ theme }) => ({
  overflowX: "auto",
  overflowY: "hidden",
  position: "relative",
  "&::-webkit-scrollbar": {
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.default,
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.divider,
    borderRadius: "4px",
  },
}));

const TimelineContent = styled(Box)(({ theme, zoom }) => ({
  position: "relative",
  width: `${zoom * 100}%`,
  minWidth: "100%",
  transition: "width 0.3s ease",
}));

const TimeScale = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "20px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1),
}));

const TimeMarker = styled(Box)(({ theme }) => ({
  position: "relative",
  flex: 1,
  borderRight: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderRight: "none",
  },
}));

const TimeMarkerLabel = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  fontSize: "0.7rem",
  color: theme.palette.text.secondary,
}));

const MachineGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "&:last-child": {
    marginBottom: 0,
  },
}));

const MachineHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(1),
}));

const MachineTitle = styled(Typography)(({ theme }) => ({
  fontWeight: designSystem.typography.fontWeight.medium,
  marginRight: theme.spacing(2),
}));

const MachineStats = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSize.xs,
  color: theme.palette.text.secondary,
}));

const SegmentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: designSystem.components.timeline.height,
  borderRadius: designSystem.components.timeline.borderRadius,
  backgroundColor: designSystem.components.timeline.backgroundColor,
  overflow: "hidden",
  position: "relative",
}));

const TimelineSegment = styled(Box)(({ status, theme, interactive }) => {
  let backgroundColor;

  switch (status) {
    case "uptime":
      backgroundColor =
        designSystem.components.timeline.segments.uptime.backgroundColor;
      break;
    case "idle":
      backgroundColor =
        designSystem.components.timeline.segments.idle.backgroundColor;
      break;
    case "downtime":
      backgroundColor =
        designSystem.components.timeline.segments.downtime.backgroundColor;
      break;
    default:
      backgroundColor = designSystem.components.timeline.backgroundColor;
  }

  return {
    height: "100%",
    backgroundColor,
    transition: "all 0.3s ease",
    position: "relative",
    cursor: interactive ? "pointer" : "default",
    "&:hover": interactive
      ? {
          opacity: 0.9,
          transform: "scaleY(1.05)",
        }
      : {},
  };
});

const SegmentLabel = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "#FFFFFF",
  fontSize: "0.75rem",
  fontWeight: designSystem.typography.fontWeight.medium,
  whiteSpace: "nowrap",
  textShadow: "0px 0px 2px rgba(0,0,0,0.7)",
  userSelect: "none",
  pointerEvents: "none",
}));

const LegendContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const LegendColor = styled(Box)(({ color, theme }) => ({
  width: "16px",
  height: "16px",
  backgroundColor: color,
  borderRadius: "4px",
}));

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: "rgba(33, 33, 33, 0.95)",
    padding: theme.spacing(1.5),
    maxWidth: "300px",
    border: `1px solid ${theme.palette.divider}`,
  },
}));

// Helper function to format duration
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

// Tooltip content component
const SegmentTooltipContent = memo(({ segment }) => {
  const { status, startTime, endTime, duration, notes } = segment;

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, textTransform: "capitalize" }}
      >
        {status}
      </Typography>

      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">
            Start:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="caption">{startTime || "N/A"}</Typography>
        </Grid>

        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">
            End:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="caption">{endTime || "N/A"}</Typography>
        </Grid>

        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">
            Duration:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="caption">{formatDuration(duration)}</Typography>
        </Grid>
      </Grid>

      {notes && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {notes}
        </Typography>
      )}
    </Box>
  );
});

SegmentTooltipContent.propTypes = {
  segment: PropTypes.object.isRequired,
};

/**
 * Timeline Component
 *
 * Advanced timeline visualization for machine segments
 *
 * @param {Object} props - Component props
 * @param {Array} props.machines - Array of machine data with segments
 * @param {Object} props.options - Configuration options
 */
const Timeline = ({ machines = [], options = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const scrollRef = useRef(null);

  // State
  const [zoom, setZoom] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [timeScale, setTimeScale] = useState("hourly");

  // Default options
  const defaultOptions = {
    showLegend: true,
    showTimeScale: true,
    interactive: true,
    showLabels: true,
    showControls: true,
    minZoom: 1,
    maxZoom: 3,
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  // Calculate total timeline duration across all machines
  const calculateTotalDuration = () => {
    let maxDuration = 0;

    machines.forEach((machine) => {
      const machineDuration = machine.segments.reduce(
        (total, segment) => total + segment.duration,
        0
      );
      maxDuration = Math.max(maxDuration, machineDuration);
    });

    return maxDuration;
  };

  const totalDuration = calculateTotalDuration();

  // Generate time markers based on total duration
  const generateTimeMarkers = () => {
    const markers = [];
    const hourInMinutes = 60;
    const totalHours = Math.ceil(totalDuration / hourInMinutes);

    for (let i = 0; i <= totalHours; i++) {
      markers.push({
        time: i * hourInMinutes,
        label: `${i}h`,
      });
    }

    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, mergedOptions.maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, mergedOptions.minZoom));
  };

  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
  };

  // Calculate machine statistics
  const calculateMachineStats = (machine) => {
    const totalDuration = machine.segments.reduce(
      (total, segment) => total + segment.duration,
      0
    );
    const uptimeDuration = machine.segments
      .filter((segment) => segment.status === "uptime")
      .reduce((total, segment) => total + segment.duration, 0);
    const downtimeDuration = machine.segments
      .filter((segment) => segment.status === "downtime")
      .reduce((total, segment) => total + segment.duration, 0);
    const idleDuration = machine.segments
      .filter((segment) => segment.status === "idle")
      .reduce((total, segment) => total + segment.duration, 0);

    const uptimePercentage =
      totalDuration > 0
        ? Math.round((uptimeDuration / totalDuration) * 100)
        : 0;

    return {
      totalDuration: formatDuration(totalDuration),
      uptime: formatDuration(uptimeDuration),
      downtime: formatDuration(downtimeDuration),
      idle: formatDuration(idleDuration),
      uptimePercentage,
    };
  };

  // Render segment with tooltip
  const renderSegment = (segment, machine, totalMachineDuration) => {
    const widthPercentage = (segment.duration / totalMachineDuration) * 100;
    const showLabel = mergedOptions.showLabels && widthPercentage > 10;

    return (
      <CustomTooltip
        key={segment.id || `${segment.status}-${segment.duration}`}
        title={<SegmentTooltipContent segment={segment} />}
        arrow
        TransitionComponent={Zoom}
        placement="top"
        enterDelay={100}
        leaveDelay={200}
      >
        <TimelineSegment
          status={segment.status}
          sx={{ width: `${widthPercentage}%` }}
          interactive={mergedOptions.interactive}
          aria-label={`${segment.status} segment for ${
            machine.name
          }, duration: ${formatDuration(segment.duration)}`}
        >
          {showLabel && (
            <SegmentLabel>{formatDuration(segment.duration)}</SegmentLabel>
          )}
        </TimelineSegment>
      </CustomTooltip>
    );
  };

  return (
    <TimelineContainer>
      <TimelineHeader>
        <Typography variant="h6">Machine Timeline</Typography>

        {mergedOptions.showControls && (
          <TimelineControls>
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoom <= mergedOptions.minZoom}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>

            {!isMobile && (
              <Slider
                value={zoom}
                min={mergedOptions.minZoom}
                max={mergedOptions.maxZoom}
                step={0.25}
                onChange={handleZoomChange}
                aria-label="Zoom level"
                sx={{ width: 100, mx: 1 }}
              />
            )}

            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoom >= mergedOptions.maxZoom}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>

            <Tooltip title="Timeline shows machine status over time. Hover over segments for details.">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </TimelineControls>
        )}
      </TimelineHeader>

      <TimelineScroller ref={scrollRef}>
        <TimelineContent zoom={zoom}>
          {mergedOptions.showTimeScale && (
            <TimeScale>
              {timeMarkers.map((marker, index) => (
                <TimeMarker key={index}>
                  <TimeMarkerLabel>{marker.label}</TimeMarkerLabel>
                </TimeMarker>
              ))}
            </TimeScale>
          )}

          {machines.map((machine) => {
            const machineDuration = machine.segments.reduce(
              (total, segment) => total + segment.duration,
              0
            );
            const stats = calculateMachineStats(machine);

            return (
              <MachineGroup key={machine.id || machine.name}>
                <MachineHeader>
                  <MachineTitle variant="body1">{machine.name}</MachineTitle>
                  <MachineStats>
                    Uptime: {stats.uptime} ({stats.uptimePercentage}%) |
                    Downtime: {stats.downtime} | Idle: {stats.idle}
                  </MachineStats>
                </MachineHeader>

                <SegmentContainer>
                  {machine.segments.map((segment) =>
                    renderSegment(segment, machine, machineDuration)
                  )}
                </SegmentContainer>
              </MachineGroup>
            );
          })}
        </TimelineContent>
      </TimelineScroller>

      {mergedOptions.showLegend && (
        <LegendContainer>
          <LegendItem>
            <LegendColor
              color={
                designSystem.components.timeline.segments.uptime.backgroundColor
              }
            />
            <Typography variant="caption">Uptime</Typography>
          </LegendItem>

          <LegendItem>
            <LegendColor
              color={
                designSystem.components.timeline.segments.downtime
                  .backgroundColor
              }
            />
            <Typography variant="caption">Downtime</Typography>
          </LegendItem>

          <LegendItem>
            <LegendColor
              color={
                designSystem.components.timeline.segments.idle.backgroundColor
              }
            />
            <Typography variant="caption">Idle</Typography>
          </LegendItem>
        </LegendContainer>
      )}
    </TimelineContainer>
  );
};

Timeline.propTypes = {
  machines: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      segments: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          status: PropTypes.oneOf(["uptime", "idle", "downtime"]).isRequired,
          duration: PropTypes.number.isRequired, // in minutes
          startTime: PropTypes.string,
          endTime: PropTypes.string,
          notes: PropTypes.string,
        })
      ).isRequired,
    })
  ),
  options: PropTypes.shape({
    showLegend: PropTypes.bool,
    showTimeScale: PropTypes.bool,
    interactive: PropTypes.bool,
    showLabels: PropTypes.bool,
    showControls: PropTypes.bool,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
  }),
};

export default Timeline;
