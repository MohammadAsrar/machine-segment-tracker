/**
 * Logger Utility
 *
 * Provides consistent logging functionality throughout the application
 */

/**
 * Simple logger with different log levels
 */
const logger = {
  /**
   * Log informational message
   * @param {string} message - The message to log
   */
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },

  /**
   * Log warning message
   * @param {string} message - The message to log
   */
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },

  /**
   * Log error message
   * @param {string} message - The error message
   * @param {Error} [error] - Optional error object
   */
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error(error);
    }
  },

  /**
   * Log debug message (only in development)
   * @param {string} message - The message to log
   */
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  },

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {string} message - Additional message
   */
  request: (req, message = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} ${message}`
      );
    }
  },
};

module.exports = logger;
