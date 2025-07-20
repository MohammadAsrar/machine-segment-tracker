/**
 * Time Utility Functions
 *
 * Utility functions for time calculations and validations
 */

const moment = require("moment");
const logger = require("./logger");

/**
 * Calculate duration between two times in minutes
 *
 * @param {String} startTime - Start time in HH:MM:SS format
 * @param {String} endTime - End time in HH:MM:SS format
 * @param {String} date - Date in YYYY-MM-DD format (for context)
 * @returns {Number} Duration in minutes
 */
const calculateDuration = (
  startTime,
  endTime,
  date = moment().format("YYYY-MM-DD")
) => {
  try {
    if (!startTime || !endTime) {
      throw new Error("Start time and end time are required");
    }

    // Validate time format
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      throw new Error("Invalid time format. Use HH:MM:SS");
    }

    const start = moment(`${date}T${startTime}`);
    const end = moment(`${date}T${endTime}`);

    // Handle case where end time is on the next day
    if (end.isBefore(start)) {
      end.add(1, "day");
    }

    return end.diff(start, "minutes");
  } catch (error) {
    logger.error(`Error calculating duration: ${error.message}`);
    throw error;
  }
};

/**
 * Format duration in minutes to human-readable format (e.g., "1h 30m")
 *
 * @param {Number} minutes - Duration in minutes
 * @returns {String} Formatted duration string
 */
const formatDuration = (minutes) => {
  try {
    if (minutes === undefined || minutes === null || isNaN(minutes)) {
      throw new Error("Minutes must be a valid number");
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  } catch (error) {
    logger.error(`Error formatting duration: ${error.message}`);
    throw error;
  }
};

/**
 * Validate if a time range is valid (end time after start time)
 *
 * @param {String} startTime - Start time in HH:MM:SS format
 * @param {String} endTime - End time in HH:MM:SS format
 * @param {String} date - Date in YYYY-MM-DD format (for context)
 * @returns {Boolean} True if valid, throws error if invalid
 */
const validateTimeRange = (
  startTime,
  endTime,
  date = moment().format("YYYY-MM-DD")
) => {
  try {
    if (!startTime || !endTime) {
      throw new Error("Start time and end time are required");
    }

    // Validate time format
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      throw new Error("Invalid time format. Use HH:MM:SS");
    }

    const start = moment(`${date}T${startTime}`);
    const end = moment(`${date}T${endTime}`);

    // Handle case where end time is on the next day
    let endAdjusted = end.clone();
    if (end.isBefore(start)) {
      endAdjusted = end.clone().add(1, "day");
    }

    if (endAdjusted.isSameOrBefore(start)) {
      throw new Error("End time must be after start time");
    }

    return true;
  } catch (error) {
    logger.error(`Time range validation error: ${error.message}`);
    throw error;
  }
};

/**
 * Check for overlapping segments for a specific machine
 *
 * @param {Array} segments - Array of segment objects
 * @param {String} machineName - Machine name to check
 * @returns {Array} Array of overlapping segment pairs
 */
const checkOverlaps = (segments, machineName) => {
  try {
    if (!Array.isArray(segments)) {
      throw new Error("Segments must be an array");
    }

    if (!machineName) {
      throw new Error("Machine name is required");
    }

    // Filter segments for the specified machine
    const machineSegments = segments.filter(
      (segment) => segment.machineName === machineName
    );

    // Sort segments by date and start time
    const sortedSegments = sortSegmentsChronologically(machineSegments);

    const overlaps = [];

    // Check for overlaps
    for (let i = 0; i < sortedSegments.length - 1; i++) {
      const current = sortedSegments[i];
      const next = sortedSegments[i + 1];

      const currentStart = moment(`${current.date}T${current.startTime}`);
      const currentEnd = moment(`${current.date}T${current.endTime}`);
      const nextStart = moment(`${next.date}T${next.startTime}`);
      const nextEnd = moment(`${next.date}T${next.endTime}`);

      // Handle case where end time is on the next day
      if (currentEnd.isBefore(currentStart)) {
        currentEnd.add(1, "day");
      }

      if (nextEnd.isBefore(nextStart)) {
        nextEnd.add(1, "day");
      }

      // Check if segments overlap
      if (currentEnd.isAfter(nextStart)) {
        overlaps.push({
          segment1: current,
          segment2: next,
          overlapMinutes: currentEnd.diff(nextStart, "minutes"),
        });
      }
    }

    return overlaps;
  } catch (error) {
    logger.error(`Error checking overlaps: ${error.message}`);
    throw error;
  }
};

/**
 * Group segments by machine name
 *
 * @param {Array} segments - Array of segment objects
 * @returns {Object} Object with machine names as keys and arrays of segments as values
 */
const groupByMachine = (segments) => {
  try {
    if (!Array.isArray(segments)) {
      throw new Error("Segments must be an array");
    }

    return segments.reduce((grouped, segment) => {
      const machineName = segment.machineName;

      if (!grouped[machineName]) {
        grouped[machineName] = [];
      }

      grouped[machineName].push(segment);
      return grouped;
    }, {});
  } catch (error) {
    logger.error(`Error grouping segments by machine: ${error.message}`);
    throw error;
  }
};

/**
 * Calculate total durations per segment type
 *
 * @param {Array} segments - Array of segment objects
 * @returns {Object} Object with segment types as keys and total durations as values
 */
const calculateTotalDurations = (segments) => {
  try {
    if (!Array.isArray(segments)) {
      throw new Error("Segments must be an array");
    }

    const totals = {
      uptime: 0,
      downtime: 0,
      idle: 0,
    };

    segments.forEach((segment) => {
      const duration = calculateDuration(
        segment.startTime,
        segment.endTime,
        segment.date
      );

      if (segment.segmentType in totals) {
        totals[segment.segmentType] += duration;
      }
    });

    // Add formatted durations
    const result = {
      minutes: { ...totals },
      formatted: {},
    };

    Object.keys(totals).forEach((type) => {
      result.formatted[type] = formatDuration(totals[type]);
    });

    return result;
  } catch (error) {
    logger.error(`Error calculating total durations: ${error.message}`);
    throw error;
  }
};

/**
 * Sort segments chronologically by date and time
 *
 * @param {Array} segments - Array of segment objects
 * @returns {Array} Sorted array of segments
 */
const sortSegmentsChronologically = (segments) => {
  try {
    if (!Array.isArray(segments)) {
      throw new Error("Segments must be an array");
    }

    return [...segments].sort((a, b) => {
      // Compare dates
      const dateComparison = a.date.localeCompare(b.date);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      // If dates are the same, compare start times
      return a.startTime.localeCompare(b.startTime);
    });
  } catch (error) {
    logger.error(`Error sorting segments: ${error.message}`);
    throw error;
  }
};

/**
 * Helper function to validate time format (HH:MM:SS)
 *
 * @param {String} time - Time string to validate
 * @returns {Boolean} True if valid, false if invalid
 */
const isValidTimeFormat = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
};

module.exports = {
  calculateDuration,
  formatDuration,
  validateTimeRange,
  checkOverlaps,
  groupByMachine,
  calculateTotalDurations,
  sortSegmentsChronologically,
};
