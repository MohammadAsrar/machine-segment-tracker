/**
 * Machine Segment Tracker Design System
 *
 * This file contains all design tokens and specifications extracted from Figma designs
 */

const designSystem = {
  /**
   * Color Palette
   */
  colors: {
    // Machine status colors
    status: {
      uptime: "#4CAF50", // Green - operational/active state
      idle: "#FFC107", // Yellow/amber - idle state
      downtime: "#F44336", // Red - downtime/error state
    },

    // UI colors
    ui: {
      primary: "#1976D2", // Primary brand color (PatternLab blue)
      secondary: "#03A9F4", // Secondary color
      background: {
        main: "#FFFFFF", // Main background
        paper: "#F5F5F5", // Paper/card background
        timeline: "#EEEEEE", // Timeline background (light gray)
        hover: "#F9F9F9", // Hover background
      },
      text: {
        primary: "#212121", // Primary text
        secondary: "#757575", // Secondary text
        disabled: "#9E9E9E", // Disabled text
        hint: "#BDBDBD", // Hint text
      },
      border: {
        light: "#E0E0E0", // Light borders (table cells)
        medium: "#BDBDBD", // Medium borders
        focus: "#1976D2", // Focus border
      },
      divider: "#EEEEEE", // Divider color
    },

    // Button states
    button: {
      primary: {
        default: "#1976D2",
        hover: "#1565C0",
        active: "#0D47A1",
        disabled: "#BDBDBD",
      },
      secondary: {
        default: "#FFFFFF",
        hover: "#F5F5F5",
        active: "#E0E0E0",
        disabled: "#F5F5F5",
      },
      save: {
        default: "#FFFFFF",
        hover: "#F5F5F5",
        active: "#E0E0E0",
        disabled: "#F5F5F5",
      },
    },

    // Feedback colors
    feedback: {
      success: "#4CAF50",
      warning: "#FF9800",
      error: "#F44336",
      info: "#2196F3",
    },
  },

  /**
   * Typography
   */
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

    // Font sizes
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      md: "1rem", // 16px
      lg: "1.25rem", // 20px
      xl: "1.5rem", // 24px
      xxl: "2rem", // 32px
    },

    // Font weights
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Letter spacing
    letterSpacing: {
      tight: "-0.025em",
      normal: "0",
      wide: "0.025em",
      wider: "0.05em",
    },

    // Text styles
    h1: {
      fontSize: "2rem",
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 500,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: "uppercase",
    },
    label: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.025em",
    },
  },

  /**
   * Component Specifications
   */
  components: {
    // Table styling
    table: {
      header: {
        backgroundColor: "#FFFFFF",
        fontWeight: 500,
        borderBottom: "2px solid #E0E0E0",
        height: "48px",
      },
      row: {
        height: "40px",
        borderBottom: "1px solid #E0E0E0",
        hover: {
          backgroundColor: "#F5F5F5",
        },
        selected: {
          backgroundColor: "rgba(25, 118, 210, 0.08)",
        },
      },
      cell: {
        padding: "0 16px",
        textAlign: "left",
      },
    },

    // Timeline styling
    timeline: {
      height: "24px",
      borderRadius: "12px",
      backgroundColor: "#EEEEEE",
      segments: {
        uptime: {
          backgroundColor: "#4CAF50",
        },
        idle: {
          backgroundColor: "#FFC107",
        },
        downtime: {
          backgroundColor: "#F44336",
        },
      },
      tooltip: {
        backgroundColor: "rgba(33, 33, 33, 0.9)",
        color: "#FFFFFF",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "0.75rem",
      },
    },

    // Form inputs
    input: {
      height: "40px",
      padding: "0 16px",
      borderRadius: "4px",
      border: "1px solid #BDBDBD",
      backgroundColor: "#FFFFFF",
      fontSize: "1rem",
      focus: {
        borderColor: "#1976D2",
        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
      },
      error: {
        borderColor: "#F44336",
        boxShadow: "0 0 0 2px rgba(244, 67, 54, 0.2)",
      },
      disabled: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        color: "#9E9E9E",
      },
      label: {
        fontSize: "0.75rem",
        color: "#757575",
        marginBottom: "4px",
      },
      helperText: {
        fontSize: "0.75rem",
        color: "#757575",
        marginTop: "4px",
      },
    },

    // Dropdown/Select
    select: {
      height: "40px",
      padding: "0 16px",
      borderRadius: "4px",
      border: "1px solid #BDBDBD",
      backgroundColor: "#FFFFFF",
      icon: {
        color: "#757575",
      },
      menu: {
        backgroundColor: "#FFFFFF",
        borderRadius: "4px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      option: {
        padding: "8px 16px",
        hover: {
          backgroundColor: "#F5F5F5",
        },
        selected: {
          backgroundColor: "rgba(25, 118, 210, 0.08)",
        },
      },
    },

    // Buttons
    button: {
      height: "36px",
      padding: "0 16px",
      borderRadius: "4px",
      fontSize: "0.875rem",
      fontWeight: 500,
      primary: {
        backgroundColor: "#1976D2",
        color: "#FFFFFF",
        hover: {
          backgroundColor: "#1565C0",
        },
        active: {
          backgroundColor: "#0D47A1",
        },
        disabled: {
          backgroundColor: "#BDBDBD",
          color: "#FFFFFF",
        },
      },
      secondary: {
        backgroundColor: "#FFFFFF",
        color: "#1976D2",
        border: "1px solid #1976D2",
        hover: {
          backgroundColor: "#F5F5F5",
        },
        active: {
          backgroundColor: "#E0E0E0",
        },
        disabled: {
          borderColor: "#BDBDBD",
          color: "#9E9E9E",
        },
      },
      save: {
        backgroundColor: "#FFFFFF",
        color: "#212121",
        border: "1px solid #E0E0E0",
        hover: {
          backgroundColor: "#F5F5F5",
        },
        active: {
          backgroundColor: "#E0E0E0",
        },
        disabled: {
          borderColor: "#E0E0E0",
          color: "#9E9E9E",
        },
      },
    },

    // Card styling
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: "4px",
      padding: "16px",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      header: {
        padding: "16px",
        borderBottom: "1px solid #EEEEEE",
      },
      body: {
        padding: "16px",
      },
      footer: {
        padding: "16px",
        borderTop: "1px solid #EEEEEE",
      },
    },
  },

  /**
   * Layout Guidelines
   */
  layout: {
    // Grid system
    grid: {
      columns: 12,
      gutter: "24px",
      margin: "24px",
    },

    // Spacing scale
    spacing: {
      xxs: "2px",
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
      xxl: "48px",
      xxxl: "64px",
    },

    // Container widths
    container: {
      xs: "480px",
      sm: "600px",
      md: "960px",
      lg: "1280px",
      xl: "1440px",
    },

    // Responsive breakpoints
    breakpoints: {
      xs: "0px",
      sm: "600px",
      md: "960px",
      lg: "1280px",
      xl: "1920px",
    },

    // Z-index scale
    zIndex: {
      dropdown: 1000,
      sticky: 1100,
      fixed: 1200,
      modalBackdrop: 1300,
      modal: 1400,
      popover: 1500,
      tooltip: 1600,
    },
  },

  /**
   * Interactive States
   */
  states: {
    hover: {
      opacity: 0.8,
      transition: "all 0.2s ease-in-out",
    },
    focus: {
      outline: "none",
      boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.4)",
    },
    active: {
      transform: "scale(0.98)",
    },
    loading: {
      opacity: 0.7,
    },
    disabled: {
      opacity: 0.5,
      pointerEvents: "none",
    },
    error: {
      color: "#F44336",
      backgroundColor: "rgba(244, 67, 54, 0.08)",
    },
    success: {
      color: "#4CAF50",
      backgroundColor: "rgba(76, 175, 80, 0.08)",
    },
  },

  /**
   * Shadows and Elevations
   */
  shadows: {
    none: "none",
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  /**
   * Animations and Transitions
   */
  animations: {
    // Transition durations
    duration: {
      fast: "150ms",
      normal: "250ms",
      slow: "350ms",
      slower: "500ms",
    },

    // Transition timing functions
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
    },

    // Common transitions
    transitions: {
      default: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
      button:
        "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), color 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)",
      fade: "opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)",
      transform: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    },

    // Keyframe animations
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
      },
      slideInUp: {
        from: { transform: "translateY(20px)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 },
      },
      pulse: {
        "0%": { transform: "scale(1)" },
        "50%": { transform: "scale(1.05)" },
        "100%": { transform: "scale(1)" },
      },
      spin: {
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(360deg)" },
      },
    },

    // Animation presets
    presets: {
      fadeIn: {
        animation: "fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
      fadeOut: {
        animation: "fadeOut 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
      slideInUp: {
        animation: "slideInUp 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
      pulse: {
        animation: "pulse 1.5s ease-in-out infinite",
      },
      spin: {
        animation: "spin 1s linear infinite",
      },
    },
  },
};

export default designSystem;
