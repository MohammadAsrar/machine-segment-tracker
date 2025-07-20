/**
 * Performance Monitoring Utilities for Backend
 * 
 * A collection of utilities for monitoring performance in the Node.js application.
 */

const { performance } = require('perf_hooks');

// Store metrics in memory
let metrics = [];

/**
 * Creates a performance marker
 * @param {string} markerName - Name of the marker
 */
const startPerformanceMarker = (markerName) => {
  performance.mark(`${markerName}-start`);
};

/**
 * Ends a performance marker and logs the duration
 * @param {string} markerName - Name of the marker to end
 * @param {boolean} logResult - Whether to log the result to console
 * @returns {number|null} - Duration in milliseconds or null if not supported
 */
const endPerformanceMarker = (markerName, logResult = true) => {
  try {
    performance.mark(`${markerName}-end`);
    performance.measure(markerName, `${markerName}-start`, `${markerName}-end`);
    
    const entries = performance.getEntriesByName(markerName);
    const duration = entries[0]?.duration;
    
    if (logResult && duration) {
      console.info(`Performance: ${markerName} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  } catch (e) {
    console.error('Error measuring performance:', e);
    return null;
  }
};

/**
 * Middleware to measure API response time
 * @returns {Function} Express middleware function
 */
const apiTimingMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    const route = `${req.method} ${req.path}`;
    
    // Add response listener to measure when the response is sent
    res.on('finish', () => {
      const duration = Date.now() - start;
      storeMetric('api', route, duration, {
        statusCode: res.statusCode,
        method: req.method,
      });
      
      // Log slow API calls
      if (duration > 1000) {
        console.warn(`Slow API: ${route} took ${duration}ms`);
      }
    });
    
    next();
  };
};

/**
 * Tracks function execution time
 * @param {string} funcName - Name of the function to track
 * @param {Function} func - Function to execute and time
 * @param {Array} args - Arguments to pass to the function
 * @returns {any} - Result of the function call
 */
const trackFunctionPerformance = (funcName, func, ...args) => {
  startPerformanceMarker(`func-${funcName}`);
  
  try {
    const result = func(...args);
    
    const duration = endPerformanceMarker(`func-${funcName}`, false);
    
    if (duration) {
      storeMetric('function', funcName, duration);
    }
    
    return result;
  } catch (error) {
    endPerformanceMarker(`func-${funcName}`, false);
    throw error;
  }
};

/**
 * Tracks async function execution time
 * @param {string} funcName - Name of the function to track
 * @param {Function} asyncFunc - Async function to execute and time
 * @param {Array} args - Arguments to pass to the function
 * @returns {Promise<any>} - Result of the async function call
 */
const trackAsyncFunctionPerformance = async (funcName, asyncFunc, ...args) => {
  startPerformanceMarker(`async-func-${funcName}`);
  
  try {
    const result = await asyncFunc(...args);
    
    const duration = endPerformanceMarker(`async-func-${funcName}`, false);
    
    if (duration) {
      storeMetric('async-function', funcName, duration);
    }
    
    return result;
  } catch (error) {
    endPerformanceMarker(`async-func-${funcName}`, false);
    throw error;
  }
};

/**
 * Store performance metrics
 * @param {string} metricType - Type of metric (e.g., 'api', 'db')
 * @param {string} name - Name of the operation
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata to store
 */
const storeMetric = (metricType, name, duration, metadata = {}) => {
  metrics.push({
    type: metricType,
    name,
    duration,
    timestamp: Date.now(),
    ...metadata,
  });
  
  // Limit stored metrics to avoid memory issues
  if (metrics.length > 1000) {
    metrics.shift();
  }
};

/**
 * Get stored performance metrics
 * @returns {Array} - Array of collected metrics
 */
const getMetrics = () => {
  return metrics;
};

/**
 * Track memory usage
 * @returns {Object} - Memory usage stats
 */
const getMemoryUsage = () => {
  const memoryUsage = process.memoryUsage();
  
  return {
    rss: memoryUsage.rss,
    heapTotal: memoryUsage.heapTotal,
    heapUsed: memoryUsage.heapUsed,
    external: memoryUsage.external,
    arrayBuffers: memoryUsage.arrayBuffers,
    timestamp: Date.now(),
  };
};

/**
 * Reports metrics to console or monitoring service
 */
const reportMetrics = () => {
  const memoryUsage = getMemoryUsage();
  
  console.info('Memory Usage:', {
    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  });
  
  // In a real app, you would send this data to a monitoring service
  // Example: sendToMonitoringService({ metrics, memoryUsage });
};

// Clear metrics (for testing or memory management)
const clearMetrics = () => {
  metrics = [];
};

module.exports = {
  startPerformanceMarker,
  endPerformanceMarker,
  apiTimingMiddleware,
  trackFunctionPerformance,
  trackAsyncFunctionPerformance,
  storeMetric,
  getMetrics,
  getMemoryUsage,
  reportMetrics,
  clearMetrics,
}; 