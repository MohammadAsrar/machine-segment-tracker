/**
 * Calculates the duration between two time strings in minutes
 * @param {string} startTime - Start time in format "HH:MM:SS"
 * @param {string} endTime - End time in format "HH:MM:SS"
 * @returns {number} - Duration in minutes
 */
export const calculateDurationInMinutes = (startTime, endTime) => {
  // Parse time strings to Date objects for easier calculation
  const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
  const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);
  
  let startTotalMinutes = startHours * 60 + startMinutes + startSeconds / 60;
  let endTotalMinutes = endHours * 60 + endMinutes + endSeconds / 60;
  
  // Handle cases where end time is on the next day
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Add 24 hours in minutes
  }
  
  return endTotalMinutes - startTotalMinutes;
};

/**
 * Formats a duration in minutes to a readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string (HH:MM:SS)
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.round((minutes % 1) * 60);
  
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');
  
  return `${paddedHours}:${paddedMins}:${paddedSecs}`;
};

/**
 * Formats a date string to display format (DD-MM-YYYY)
 * @param {string} dateString - Date in format "YYYY-MM-DD"
 * @returns {string} - Formatted date string (DD-MM-YYYY)
 */
export const formatDateForDisplay = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

/**
 * Calculates the width percentage for a time segment
 * @param {string} startTime - Start time in format "HH:MM:SS"
 * @param {string} endTime - End time in format "HH:MM:SS"
 * @param {number} totalMinutes - Total minutes in the timeline (default: 24 hours)
 * @returns {number} - Width percentage (0-100)
 */
export const calculateSegmentWidth = (startTime, endTime, totalMinutes = 24 * 60) => {
  const durationMinutes = calculateDurationInMinutes(startTime, endTime);
  return (durationMinutes / totalMinutes) * 100;
};

/**
 * Calculates the left position percentage for a time segment
 * @param {string} startTime - Start time in format "HH:MM:SS"
 * @param {string} dayStartTime - Day start time in format "HH:MM:SS" (default: "00:00:00")
 * @param {number} totalMinutes - Total minutes in the timeline (default: 24 hours)
 * @returns {number} - Left position percentage (0-100)
 */
export const calculateSegmentPosition = (startTime, dayStartTime = "00:00:00", totalMinutes = 24 * 60) => {
  const offsetMinutes = calculateDurationInMinutes(dayStartTime, startTime);
  return (offsetMinutes / totalMinutes) * 100;
};

/**
 * Calculates downtime analytics for a machine
 * @param {Array} segments - Array of segments for the machine
 * @returns {Object} - Downtime analytics object
 */
export const calculateDowntimeAnalytics = (segments) => {
  let unplannedDowntime = 0;
  let plannedDeviated = 0;
  
  segments.forEach(segment => {
    const duration = calculateDurationInMinutes(segment.startTime, segment.endTime);
    if (segment.segmentType === 'downtime') {
      unplannedDowntime += duration;
    } else if (segment.segmentType === 'idle') {
      plannedDeviated += duration;
    }
  });
  
  return {
    unplannedDowntime: formatDuration(unplannedDowntime),
    plannedDeviated: formatDuration(plannedDeviated)
  };
};

/**
 * Groups segments by machine name
 * @param {Array} segments - Array of all segments
 * @returns {Object} - Object with machine names as keys and arrays of segments as values
 */
export const groupSegmentsByMachine = (segments) => {
  return segments.reduce((acc, segment) => {
    if (!acc[segment.machineName]) {
      acc[segment.machineName] = [];
    }
    acc[segment.machineName].push(segment);
    return acc;
  }, {});
}; 