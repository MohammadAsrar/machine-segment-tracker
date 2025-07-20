import { createTheme } from "@mui/material/styles";
import designSystem from "./designSystem";

/**
 * Material-UI theme configuration using our design system tokens
 */
const theme = createTheme({
  palette: {
    primary: {
      main: designSystem.colors.ui.primary,
    },
    secondary: {
      main: designSystem.colors.status.idle,
    },
    error: {
      main: designSystem.colors.status.downtime,
    },
    success: {
      main: designSystem.colors.status.uptime,
    },
    text: {
      primary: designSystem.colors.ui.text.primary,
      secondary: designSystem.colors.ui.text.secondary,
      disabled: designSystem.colors.ui.text.disabled,
    },
    background: {
      default: designSystem.colors.ui.background.main,
      paper: designSystem.colors.ui.background.paper,
    },
    divider: designSystem.colors.ui.divider,
  },

  typography: {
    fontFamily: designSystem.typography.fontFamily,
    fontSize: 16,
    h1: designSystem.typography.h1,
    h2: designSystem.typography.h2,
    h3: designSystem.typography.h3,
    body1: designSystem.typography.body1,
    body2: designSystem.typography.body2,
    caption: designSystem.typography.caption,
    button: designSystem.typography.button,
  },

  shape: {
    borderRadius: 4,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: designSystem.components.button.height,
          padding: designSystem.components.button.padding,
          borderRadius: designSystem.components.button.borderRadius,
          textTransform: "none",
        },
        containedPrimary: {
          backgroundColor:
            designSystem.components.button.primary.backgroundColor,
          color: designSystem.components.button.primary.color,
          "&:hover": {
            backgroundColor:
              designSystem.components.button.primary.hover.backgroundColor,
          },
        },
        outlinedPrimary: {
          backgroundColor:
            designSystem.components.button.secondary.backgroundColor,
          color: designSystem.components.button.secondary.color,
          border: designSystem.components.button.secondary.border,
          "&:hover": {
            backgroundColor:
              designSystem.components.button.secondary.hover.backgroundColor,
          },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: designSystem.components.table.header.backgroundColor,
          "& .MuiTableCell-head": {
            fontWeight: designSystem.components.table.header.fontWeight,
            borderBottom: designSystem.components.table.header.borderBottom,
            height: designSystem.components.table.header.height,
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          height: designSystem.components.table.row.height,
          borderBottom: designSystem.components.table.row.borderBottom,
          "&:hover": {
            backgroundColor:
              designSystem.components.table.row.hover.backgroundColor,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: designSystem.components.table.cell.padding,
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: designSystem.components.input.height,
          padding: designSystem.components.input.padding,
          borderRadius: designSystem.components.input.borderRadius,
          border: designSystem.components.input.border,
          "&:focus-within": {
            borderColor: designSystem.components.input.focus.borderColor,
            boxShadow: designSystem.components.input.focus.boxShadow,
          },
          "&.Mui-error": {
            borderColor: designSystem.components.input.error.borderColor,
            boxShadow: designSystem.components.input.error.boxShadow,
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          height: designSystem.components.select.height,
          padding: designSystem.components.select.padding,
          borderRadius: designSystem.components.select.borderRadius,
          border: designSystem.components.select.border,
          backgroundColor: designSystem.components.select.backgroundColor,
        },
        icon: {
          color: designSystem.components.select.icon.color,
        },
      },
    },
  },

  // Custom spacing based on our design system
  spacing: (factor) => {
    const spacingValues = {
      0: "0",
      1: designSystem.layout.spacing.xs, // 4px
      2: designSystem.layout.spacing.sm, // 8px
      3: "12px", // In-between value
      4: designSystem.layout.spacing.md, // 16px
      6: designSystem.layout.spacing.lg, // 24px
      8: designSystem.layout.spacing.xl, // 32px
      12: designSystem.layout.spacing.xxl, // 48px
    };

    return spacingValues[factor] || `${4 * factor}px`;
  },

  // Breakpoints based on our design system
  breakpoints: {
    values: {
      xs: parseInt(designSystem.layout.breakpoints.xs),
      sm: parseInt(designSystem.layout.breakpoints.sm),
      md: parseInt(designSystem.layout.breakpoints.md),
      lg: parseInt(designSystem.layout.breakpoints.lg),
      xl: parseInt(designSystem.layout.breakpoints.xl),
    },
  },

  // Shadows based on our design system
  shadows: [
    "none",
    designSystem.shadows.sm,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
  ],
});

export default theme;
