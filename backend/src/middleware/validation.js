/**
 * Validation Middleware
 *
 * Provides request validation for API endpoints
 */

const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Process validation results and return errors if any
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map((err) => ({ field: err.param, message: err.msg })),
    });
  }
  next();
};

/**
 * Validate segment ID parameter
 */
exports.validateSegmentId = [
  param('id')
    .notEmpty()
    .withMessage('Segment ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid segment ID format');
      }
      return true;
    }),
  validateRequest,
];

/**
 * Validate create segment request
 */
exports.validateCreateSegment = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM:SS format'),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM:SS format'),

  body('machineName').notEmpty().withMessage('Machine name is required').trim(),

  body('segmentType')
    .notEmpty()
    .withMessage('Segment type is required')
    .isIn(['uptime', 'downtime', 'idle', 'select'])
    .withMessage('Segment type must be one of: uptime, downtime, idle, select'),

  validateRequest,
];

/**
 * Validate update segment request
 */
exports.validateUpdateSegment = [
  param('id')
    .notEmpty()
    .withMessage('Segment ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid segment ID format');
      }
      return true;
    }),

  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),

  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM:SS format'),

  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM:SS format'),

  body('machineName').optional().trim(),

  body('segmentType')
    .optional()
    .isIn(['uptime', 'downtime', 'idle', 'select'])
    .withMessage('Segment type must be one of: uptime, downtime, idle, select'),

  validateRequest,
];

/**
 * Validate timeline parameters
 */
exports.validateTimelineParams = [
  param('machineName').notEmpty().withMessage('Machine name is required').trim(),

  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),

  query('startDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date must be in YYYY-MM-DD format'),

  query('endDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date must be in YYYY-MM-DD format'),

  validateRequest,
];

/**
 * Validate segment filters
 */
exports.validateSegmentFilters = [
  query('machineName').optional().trim(),

  query('segmentType')
    .optional()
    .isIn(['uptime', 'downtime', 'idle', 'select', ''])
    .withMessage('Segment type must be one of: uptime, downtime, idle, select'),

  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),

  query('startDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date must be in YYYY-MM-DD format'),

  query('endDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date must be in YYYY-MM-DD format'),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  validateRequest,
];
