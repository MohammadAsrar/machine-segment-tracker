/**
 * Performance Monitoring Utilities
 * 
 * A collection of utilities for monitoring performance in the application.
 */

/**
 * Measures component render time
 * @param {string} componentName - Name of the component to measure
 * @param {Function} callback - Function to measure (usually a render function)
 * @returns {any} - The result of the callback function
 */
export const measureRenderTime = (componentName, callback) => {
  if (process.env.NODE_ENV !== 'production') {
    const startTime = performance.now();
    const result = callback();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log if render time is too long (over 16ms which is ~60fps)
    if (duration > 16) {
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms to render`);
    }
    
    return result;
  }
  
  return callback();
};

/**
 * Creates a performance marker
 * @param {string} markerName - Name of the marker
 */
export const startPerformanceMarker = (markerName) => {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${markerName}-start`);
  }
};

/**
 * Ends a performance marker and logs the duration
 * @param {string} markerName - Name of the marker to end
 * @param {boolean} logResult - Whether to log the result to console
 * @returns {number|null} - Duration in milliseconds or null if not supported
 */
export const endPerformanceMarker = (markerName, logResult = true) => {
  if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
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
    }
  }
  
  return null;
};

/**
 * Tracks API response time
 * @param {string} apiName - Name of the API endpoint
 * @param {Function} apiCall - The API call function to measure
 * @returns {Promise<any>} - The result of the API call
 */
export const trackApiPerformance = async (apiName, apiCall) => {
  startPerformanceMarker(`api-${apiName}`);
  
  try {
    const result = await apiCall();
    
    const duration = endPerformanceMarker(`api-${apiName}`, false);
    
    if (duration) {
      // Log slow API calls
      if (duration > 1000) {
        console.warn(`Slow API: ${apiName} took ${duration.toFixed(2)}ms`);
      }
      
      // Store metrics for later analysis
      storeMetric('api', apiName, duration);
    }
    
    return result;
  } catch (error) {
    endPerformanceMarker(`api-${apiName}`, false);
    throw error;
  }
};

/**
 * Store performance metrics
 * @param {string} metricType - Type of metric (e.g., 'api', 'render')
 * @param {string} name - Name of the operation
 * @param {number} duration - Duration in milliseconds
 */
export const storeMetric = (metricType, name, duration) => {
  // In a real app, this might send data to a monitoring service
  if (!window.__performanceMetrics) {
    window.__performanceMetrics = [];
  }
  
  window.__performanceMetrics.push({
    type: metricType,
    name,
    duration,
    timestamp: Date.now(),
  });
  
  // Limit stored metrics to avoid memory issues
  if (window.__performanceMetrics.length > 100) {
    window.__performanceMetrics.shift();
  }
};

/**
 * Get stored performance metrics
 * @returns {Array} - Array of collected metrics
 */
export const getMetrics = () => {
  return window.__performanceMetrics || [];
};

/**
 * Track memory usage
 * @returns {Object|null} - Memory usage stats or null if not supported
 */
export const getMemoryUsage = () => {
  if (performance && performance.memory) {
    return {
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };
  }
  
  return null;
};

/**
 * Reports metrics to console or monitoring service
 */
export const reportMetrics = () => {
  const metrics = getMetrics();
  const memory = getMemoryUsage();
  
  console.info('Performance Metrics:', metrics);
  
  if (memory) {
    console.info('Memory Usage:', memory);
  }
  
  // In a real app, you would send this data to a monitoring service
  // Example: sendToAnalyticsService({ metrics, memory });
};

// Export as default object
export default {
  measureRenderTime,
  startPerformanceMarker,
  endPerformanceMarker,
  trackApiPerformance,
  getMetrics,
  getMemoryUsage,
  reportMetrics,
}; 