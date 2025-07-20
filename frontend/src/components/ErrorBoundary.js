import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Divider,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import ReplayIcon from "@mui/icons-material/Replay";
import designSystem from "../styles/designSystem";

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and displays a fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({ errorInfo });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Log to monitoring service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: designSystem.components.card.borderRadius,
              border: `1px solid ${designSystem.colors.ui.border.light}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                color: "error.main",
              }}
            >
              <ErrorIcon fontSize="large" sx={{ mr: 2 }} />
              <Typography variant="h5" component="h2">
                Something went wrong
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ mb: 2 }}>
              {this.props.fallbackMessage ||
                "The application encountered an unexpected error. Please try again."}
            </Typography>

            {this.props.showErrorDetails && this.state.error && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  Error details:
                </Typography>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ReplayIcon />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>

              {this.props.resetButton && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    this.handleReset();
                    if (this.props.onReset) {
                      this.props.onReset();
                    }
                  }}
                >
                  {this.props.resetButtonText || "Reset Application"}
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackMessage: PropTypes.string,
  resetButton: PropTypes.bool,
  resetButtonText: PropTypes.string,
  showErrorDetails: PropTypes.bool,
  onError: PropTypes.func,
  onReset: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  fallbackMessage:
    "The application encountered an unexpected error. Please try again.",
  resetButton: true,
  resetButtonText: "Reset Application",
  showErrorDetails: false,
};

export default ErrorBoundary;
