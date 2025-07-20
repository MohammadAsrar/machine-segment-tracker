/**
 * Design System Usage Examples
 *
 * This file demonstrates how to use the design system in React components
 */

import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Button, Typography, TextField } from "@mui/material";
import designSystem from "./designSystem";

// Example 1: Using color constants
export const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: designSystem.colors.button.primary.default,
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: designSystem.colors.button.primary.hover,
  },
  "&:active": {
    backgroundColor: designSystem.colors.button.primary.active,
  },
}));

// Example 2: Using typography constants
export const Heading = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSize.xl,
  fontWeight: designSystem.typography.fontWeight.medium,
  lineHeight: designSystem.typography.lineHeight.tight,
  marginBottom: designSystem.layout.spacing.md,
}));

// Example 3: Using spacing units
export const ContentBox = styled(Box)(({ theme }) => ({
  padding: designSystem.layout.spacing.lg,
  margin: `${designSystem.layout.spacing.md} 0`,
}));

// Example 4: Using component style objects
export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: designSystem.components.input.height,
    borderRadius: designSystem.components.input.borderRadius,
    "& fieldset": {
      border: designSystem.components.input.border,
    },
    "&:hover fieldset": {
      borderColor: designSystem.colors.ui.border.medium,
    },
    "&.Mui-focused fieldset": {
      borderColor: designSystem.components.input.focus.borderColor,
      boxShadow: designSystem.components.input.focus.boxShadow,
    },
    "&.Mui-error fieldset": {
      borderColor: designSystem.components.input.error.borderColor,
      boxShadow: designSystem.components.input.error.boxShadow,
    },
  },
}));

// Example 5: Using breakpoint definitions
export const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    maxWidth: designSystem.layout.container.sm,
  },
  [theme.breakpoints.up("md")]: {
    maxWidth: designSystem.layout.container.md,
  },
  [theme.breakpoints.up("lg")]: {
    maxWidth: designSystem.layout.container.lg,
  },
}));

// Example 6: Using animation/transition constants
export const FadeInBox = styled(Box)(({ theme }) => ({
  animation: designSystem.animations.presets.fadeIn.animation,
}));

export const PulseButton = styled(Button)(({ theme }) => ({
  animation: designSystem.animations.presets.pulse.animation,
}));

// Example 7: Using shadows
export const CardBox = styled(Box)(({ theme }) => ({
  padding: designSystem.layout.spacing.lg,
  borderRadius: "4px",
  boxShadow: designSystem.shadows.md,
  transition: designSystem.animations.transitions.default,
  "&:hover": {
    boxShadow: designSystem.shadows.lg,
  },
}));

// Example 8: Using state styles
export const InteractiveBox = styled(Box)(({ theme }) => ({
  padding: designSystem.layout.spacing.md,
  border: `1px solid ${designSystem.colors.ui.border.light}`,
  borderRadius: "4px",
  transition: designSystem.animations.transitions.default,
  "&:hover": {
    ...designSystem.states.hover,
    borderColor: designSystem.colors.ui.border.medium,
  },
  "&:focus": {
    ...designSystem.states.focus,
  },
}));

// Example 9: Using timeline component styles
export const TimelineSegmentBar = styled(Box)(({ status }) => {
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
    height: designSystem.components.timeline.height,
    backgroundColor,
    borderRadius: designSystem.components.timeline.borderRadius,
  };
});

// Example 10: Using feedback colors
export const StatusIndicator = styled(Box)(({ status }) => {
  let backgroundColor;

  switch (status) {
    case "success":
      backgroundColor = designSystem.colors.feedback.success;
      break;
    case "warning":
      backgroundColor = designSystem.colors.feedback.warning;
      break;
    case "error":
      backgroundColor = designSystem.colors.feedback.error;
      break;
    case "info":
      backgroundColor = designSystem.colors.feedback.info;
      break;
    default:
      backgroundColor = designSystem.colors.ui.background.main;
  }

  return {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor,
    display: "inline-block",
    marginRight: designSystem.layout.spacing.sm,
  };
});
