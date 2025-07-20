/**
 * Error Handling Middleware
 *
 * Provides centralized error handling for the API
 */

const logger = require('../utils/logger');

/**
 * Not Found Error Handler
 * Handles 404 errors when a route is not found
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * General Error Handler
 * Handles all other errors and sends appropriate response
 */
exports.errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`, err);

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    // Invalid MongoDB ID
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  } else if (err.code === 11000) {
    // Duplicate key error
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error',
      field: err.keyValue,
    });
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};
