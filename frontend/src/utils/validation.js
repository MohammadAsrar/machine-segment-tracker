/**
 * Validation Utilities
 *
 * A comprehensive validation system for the Machine Segment Tracker
 */

/**
 * Time Validation Functions
 */

/**
 * Validates if a string is in HH:mm:ss format
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} - Whether the time string is valid
 */
export const isValidTimeFormat = (timeStr) => {
  if (!timeStr) return false;

  // Check if time is in HH:mm:ss format
  const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
  return regex.test(timeStr);
};

/**
 * Validates if end time is after start time
 * @param {string} startTime - Start time in HH:mm:ss format
 * @param {string} endTime - End time in HH:mm:ss format
 * @returns {boolean} - Whether end time is after start time
 */
export const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return true;
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime))
    return false;

  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  return end > start;
};

/**
 * Checks if a segment overlaps with any existing segments for the same machine
 * @param {Object} newSegment - New segment to check
 * @param {Array} existingSegments - Array of existing segments
 * @returns {boolean} - Whether there is an overlap
 */
export const hasOverlappingSegments = (newSegment, existingSegments) => {
  if (!newSegment || !existingSegments || !existingSegments.length)
    return false;

  // Filter segments for the same machine and same date
  const machineSegments = existingSegments.filter(
    (segment) =>
      segment.machineName === newSegment.machineName &&
      segment.date === newSegment.date &&
      // Exclude the segment itself if it has an ID (for updates)
      (!newSegment.id || segment.id !== newSegment.id)
  );

  if (!machineSegments.length) return false;

  const newStart = new Date(`${newSegment.date}T${newSegment.startTime}`);
  const newEnd = new Date(`${newSegment.date}T${newSegment.endTime}`);

  // Check for overlaps with existing segments
  return machineSegments.some((segment) => {
    const existingStart = new Date(`${segment.date}T${segment.startTime}`);
    const existingEnd = new Date(`${segment.date}T${segment.endTime}`);

    // Check if the new segment overlaps with this existing segment
    return (
      (newStart >= existingStart && newStart < existingEnd) || // New start is within existing segment
      (newEnd > existingStart && newEnd <= existingEnd) || // New end is within existing segment
      (newStart <= existingStart && newEnd >= existingEnd) // New segment completely contains existing segment
    );
  });
};

/**
 * Validates if a date is in the future
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} - Whether the date is in the future
 */
export const isFutureDate = (dateStr) => {
  if (!dateStr) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0); // Reset time to start of day

  return date >= today;
};

/**
 * Data Validation Functions
 */

/**
 * Validates if a field is not empty
 * @param {any} value - Value to check
 * @returns {boolean} - Whether the value is not empty
 */
export const isRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
};

/**
 * Validates machine name format
 * @param {string} name - Machine name to validate
 * @returns {boolean} - Whether the machine name is valid
 */
export const isValidMachineName = (name) => {
  if (!name) return false;

  // Machine names should be alphanumeric and may include hyphens and underscores
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(name);
};

/**
 * Validates segment type against allowed values
 * @param {string} type - Segment type to validate
 * @returns {boolean} - Whether the segment type is valid
 */
export const isValidSegmentType = (type) => {
  if (!type) return false;

  const allowedTypes = ["Uptime", "Downtime", "Idle"];
  return allowedTypes.includes(type);
};

/**
 * Validates if a date is within a valid range
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {number} rangeInDays - Number of days in the past or future to allow
 * @returns {boolean} - Whether the date is within range
 */
export const isDateInRange = (dateStr, rangeInDays = 30) => {
  if (!dateStr) return false;

  const today = new Date();
  const date = new Date(dateStr);

  const diffTime = Math.abs(date - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= rangeInDays;
};

/**
 * Form Validation
 */

/**
 * Validates a segment form
 * @param {Object} formData - Form data to validate
 * @param {Array} existingSegments - Existing segments for overlap validation
 * @returns {Object} - Validation results with errors
 */
export const validateSegmentForm = (formData, existingSegments = []) => {
  const errors = {};

  // Required fields
  if (!isRequired(formData.date)) {
    errors.date = "Date is required";
  }

  if (!isRequired(formData.startTime)) {
    errors.startTime = "Start time is required";
  } else if (!isValidTimeFormat(formData.startTime)) {
    errors.startTime = "Invalid time format (HH:mm:ss)";
  }

  if (!isRequired(formData.endTime)) {
    errors.endTime = "End time is required";
  } else if (!isValidTimeFormat(formData.endTime)) {
    errors.endTime = "Invalid time format (HH:mm:ss)";
  }

  if (!isRequired(formData.machineName)) {
    errors.machineName = "Machine name is required";
  } else if (!isValidMachineName(formData.machineName)) {
    errors.machineName = "Invalid machine name format";
  }

  if (!isRequired(formData.segmentType)) {
    errors.segmentType = "Segment type is required";
  } else if (!isValidSegmentType(formData.segmentType)) {
    errors.segmentType = "Invalid segment type";
  }

  // Advanced validations (only if basic validations pass)
  if (
    !errors.startTime &&
    !errors.endTime &&
    !isEndTimeAfterStartTime(formData.startTime, formData.endTime)
  ) {
    errors.endTime = "End time must be after start time";
  }

  if (
    !errors.date &&
    !errors.startTime &&
    !errors.endTime &&
    !errors.machineName
  ) {
    if (hasOverlappingSegments(formData, existingSegments)) {
      errors.general =
        "This segment overlaps with an existing segment for this machine";
    }
  }

  // Date range validation (optional)
  if (!errors.date && !isDateInRange(formData.date, 365)) {
    errors.date = "Date must be within 1 year from today";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Helper Functions
 */

/**
 * Formats a time string to HH:mm:ss
 * @param {string|Date} time - Time to format
 * @returns {string} - Formatted time string
 */
export const formatTimeString = (time) => {
  if (!time) return "";

  if (time instanceof Date) {
    return time.toTimeString().substring(0, 8);
  }

  // If already in correct format, return as is
  if (isValidTimeFormat(time)) {
    return time;
  }

  // Try to parse and format
  try {
    const date = new Date(`2000-01-01T${time}`);
    return date.toTimeString().substring(0, 8);
  } catch (e) {
    return "";
  }
};

/**
 * Formats a date to YYYY-MM-DD
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateString = (date) => {
  if (!date) return "";

  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }

  // If already in correct format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Try to parse and format
  try {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

/**
 * Formats a duration in minutes to a human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (minutes === undefined || minutes === null) return "";

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

export default {
  isValidTimeFormat,
  isEndTimeAfterStartTime,
  hasOverlappingSegments,
  isFutureDate,
  isRequired,
  isValidMachineName,
  isValidSegmentType,
  isDateInRange,
  validateSegmentForm,
  formatTimeString,
  formatDateString,
  formatDuration,
};
