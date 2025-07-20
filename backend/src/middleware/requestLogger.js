/**
 * Request Logger Middleware
 *
 * Logs details about incoming HTTP requests
 */

const logger = require('../utils/logger');

/**
 * Middleware to log HTTP requests
 */
const requestLogger = (req, res, next) => {
  // Start time of request
  const start = Date.now();

  // Log request details
  logger.request(req);

  // Log response details when the response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.debug(logMessage);
    }
  });

  next();
};

module.exports = requestLogger;
