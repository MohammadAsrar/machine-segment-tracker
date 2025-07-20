import axios from "axios";

// API Base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Cache storage
const cache = {
  data: new Map(),
  timestamp: new Map(),
  ttl: 60000, // 1 minute TTL (time to live)
};

// Request cancellation tokens
const cancelTokens = new Map();

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Base delay in ms

/**
 * Error transformation helper
 * Converts API errors to user-friendly messages
 */
const transformError = (error) => {
  if (axios.isCancel(error)) {
    return {
      message: "Request was cancelled",
      type: "cancel",
      originalError: error,
    };
  }

  // Network errors
  if (!error.response) {
    return {
      message: "Network error. Please check your connection.",
      type: "network",
      originalError: error,
    };
  }

  // HTTP error responses
  const { status, data } = error.response;
  let message = "";

  switch (status) {
    case 400:
      message = data.message || "Invalid request. Please check your data.";
      break;
    case 401:
      message = "Authentication required. Please log in again.";
      break;
    case 403:
      message = "You do not have permission to perform this action.";
      break;
    case 404:
      message = "The requested resource was not found.";
      break;
    case 409:
      message = "Conflict with current state. Please refresh and try again.";
      break;
    case 422:
      message = data.message || "Validation error. Please check your input.";
      break;
    case 429:
      message = "Too many requests. Please try again later.";
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = "Server error. Please try again later.";
      break;
    default:
      message = data.message || "An unexpected error occurred.";
  }

  return {
    message,
    type: "http",
    status,
    data: error.response.data,
    originalError: error,
  };
};

/**
 * Exponential backoff retry mechanism
 * @param {Function} fn - The function to retry
 * @param {Number} retries - Number of retries left
 * @param {Number} delay - Current delay in ms
 */
const retryWithBackoff = async (
  fn,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
) => {
  try {
    return await fn();
  } catch (error) {
    // Don't retry on these status codes
    if (
      error.response &&
      [400, 401, 403, 404, 422].includes(error.response.status)
    ) {
      throw error;
    }

    if (retries <= 0) {
      throw error;
    }

    // Wait with exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry with increased delay (exponential backoff)
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

/**
 * Check if data in cache is valid
 * @param {String} key - Cache key
 * @returns {Boolean} - Whether cache is valid
 */
const isCacheValid = (key) => {
  if (!cache.data.has(key) || !cache.timestamp.has(key)) {
    return false;
  }

  const timestamp = cache.timestamp.get(key);
  return Date.now() - timestamp < cache.ttl;
};

/**
 * Set data in cache
 * @param {String} key - Cache key
 * @param {*} data - Data to cache
 */
const setCacheData = (key, data) => {
  cache.data.set(key, data);
  cache.timestamp.set(key, Date.now());
};

/**
 * Clear specific cache entry
 * @param {String} key - Cache key to clear
 */
const clearCache = (key) => {
  if (key) {
    cache.data.delete(key);
    cache.timestamp.delete(key);
  } else {
    // Clear all cache
    cache.data.clear();
    cache.timestamp.clear();
  }
};

/**
 * Create a cancel token for a request
 * @param {String} key - Request identifier
 * @returns {CancelToken} - Axios cancel token
 */
const createCancelToken = (key) => {
  // Cancel previous request with same key if exists
  if (cancelTokens.has(key)) {
    cancelTokens.get(key).cancel("Operation canceled due to new request");
  }

  // Create new cancel token
  const source = axios.CancelToken.source();
  cancelTokens.set(key, source);
  return source.token;
};

/**
 * Remove cancel token after request completes
 * @param {String} key - Request identifier
 */
const removeCancelToken = (key) => {
  cancelTokens.delete(key);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Successful response
    return response;
  },
  (error) => {
    // Transform error for better handling
    const transformedError = transformError(error);
    return Promise.reject(transformedError);
  }
);

/**
 * API Service with caching, retry, and error handling
 */
const apiService = {
  /**
   * Fetch all segments
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with segments data
   */
  async fetchSegments(options = {}) {
    const { useCache = true, cancelKey = "fetchSegments" } = options;

    const cacheKey = "segments";

    // Return cached data if valid
    if (useCache && isCacheValid(cacheKey)) {
      return cache.data.get(cacheKey);
    }

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.get("/segments", { cancelToken })
      );

      // Cache the response
      setCacheData(cacheKey, response.data);

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Update a segment
   * @param {String} id - Segment ID
   * @param {Object} data - Segment data
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with updated segment
   */
  async updateSegment(id, data, options = {}) {
    const { cancelKey = `updateSegment_${id}` } = options;

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.put(`/segments/${id}`, data, { cancelToken })
      );

      // Clear cache as data has changed
      clearCache("segments");
      clearCache(`segment_${id}`);
      clearCache("statistics");

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Create a new segment
   * @param {Object} data - Segment data
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with created segment
   */
  async createSegment(data, options = {}) {
    const { cancelKey = "createSegment" } = options;

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.post("/segments", data, { cancelToken })
      );

      // Clear cache as data has changed
      clearCache("segments");
      clearCache("statistics");

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Delete a segment
   * @param {String} id - Segment ID
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with delete result
   */
  async deleteSegment(id, options = {}) {
    const { cancelKey = `deleteSegment_${id}` } = options;

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.delete(`/segments/${id}`, { cancelToken })
      );

      // Clear cache as data has changed
      clearCache("segments");
      clearCache(`segment_${id}`);
      clearCache("statistics");

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Get timeline data for a specific machine
   * @param {String} machineName - Machine name
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with timeline data
   */
  async getTimelineData(machineName, options = {}) {
    const { useCache = true, cancelKey = `timeline_${machineName}` } = options;

    const cacheKey = `timeline_${machineName}`;

    // Return cached data if valid
    if (useCache && isCacheValid(cacheKey)) {
      return cache.data.get(cacheKey);
    }

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.get(`/timeline/${machineName}`, { cancelToken })
      );

      // Cache the response
      setCacheData(cacheKey, response.data);

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Get summary statistics
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with statistics data
   */
  async getStatistics(options = {}) {
    const { useCache = true, cancelKey = "statistics" } = options;

    const cacheKey = "statistics";

    // Return cached data if valid
    if (useCache && isCacheValid(cacheKey)) {
      return cache.data.get(cacheKey);
    }

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.get("/statistics", { cancelToken })
      );

      // Cache the response
      setCacheData(cacheKey, response.data);

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Get machine data by ID
   * @param {String} id - Machine ID
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with machine data
   */
  async getMachine(id, options = {}) {
    const { useCache = true, cancelKey = `machine_${id}` } = options;

    const cacheKey = `machine_${id}`;

    // Return cached data if valid
    if (useCache && isCacheValid(cacheKey)) {
      return cache.data.get(cacheKey);
    }

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.get(`/machines/${id}`, { cancelToken })
      );

      // Cache the response
      setCacheData(cacheKey, response.data);

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Get all machines
   * @param {Object} options - Request options
   * @returns {Promise} - Promise with machines data
   */
  async getMachines(options = {}) {
    const { useCache = true, cancelKey = "machines" } = options;

    const cacheKey = "machines";

    // Return cached data if valid
    if (useCache && isCacheValid(cacheKey)) {
      return cache.data.get(cacheKey);
    }

    try {
      // Create cancel token
      const cancelToken = createCancelToken(cancelKey);

      // Make request with retry
      const response = await retryWithBackoff(() =>
        api.get("/machines", { cancelToken })
      );

      // Cache the response
      setCacheData(cacheKey, response.data);

      // Cleanup
      removeCancelToken(cancelKey);

      return response.data;
    } catch (error) {
      // Cleanup
      removeCancelToken(cancelKey);
      throw error;
    }
  },

  /**
   * Manually clear cache
   * @param {String} key - Specific cache key to clear (optional)
   */
  clearCache,

  /**
   * Cancel all pending requests
   */
  cancelAllRequests() {
    for (const source of cancelTokens.values()) {
      source.cancel("Operation canceled by user");
    }
    cancelTokens.clear();
  },

  /**
   * Cancel a specific request
   * @param {String} key - Request identifier
   */
  cancelRequest(key) {
    if (cancelTokens.has(key)) {
      cancelTokens.get(key).cancel("Operation canceled by user");
      cancelTokens.delete(key);
    }
  },
};

export default apiService;
