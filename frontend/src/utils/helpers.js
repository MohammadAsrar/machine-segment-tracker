import moment from "moment";

/**
 * Format a date using moment.js
 * @param {string|Date} date - The date to format
 * @param {string} format - The format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "YYYY-MM-DD") => {
  if (!date) return "N/A";
  return moment(date).format(format);
};

/**
 * Capitalize the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Get a color based on status
 * @param {string} status - The status string
 * @returns {string} A color code
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "operational":
      return "#4caf50"; // green
    case "inactive":
    case "maintenance":
      return "#ff9800"; // orange
    case "faulty":
    case "decommissioned":
      return "#f44336"; // red
    default:
      return "#757575"; // grey
  }
};

/**
 * Truncate a string if it's longer than maxLength
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncating
 * @returns {string} The truncated string
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return "";
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};
