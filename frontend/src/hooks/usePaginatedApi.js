import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Custom hook for paginated API requests
 *
 * @param {Object} options - Hook options
 * @param {string} options.endpoint - API endpoint
 * @param {Object} options.params - Additional query parameters
 * @param {number} options.initialPage - Initial page number
 * @param {number} options.initialPageSize - Initial page size
 * @param {boolean} options.executeOnMount - Whether to execute the request on mount
 * @param {Function} options.onSuccess - Callback function on success
 * @param {Function} options.onError - Callback function on error
 * @param {Object} options.initialData - Initial data
 * @returns {Object} - Paginated API state and methods
 */
const usePaginatedApi = ({
  endpoint,
  params = {},
  initialPage = 1,
  initialPageSize = 10,
  executeOnMount = true,
  onSuccess,
  onError,
  initialData = { items: [], total: 0 },
}) => {
  // State
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(initialData.total || 0);

  // Cache for requests
  const cache = useRef(new Map());

  // Cancel token source
  const cancelTokenSource = useRef(null);

  // Generate cache key
  const getCacheKey = useCallback(
    (page, pageSize, params) => {
      return `${endpoint}_${page}_${pageSize}_${JSON.stringify(params)}`;
    },
    [endpoint]
  );

  // Execute API request
  const execute = useCallback(
    async (overrideParams = {}) => {
      // Cancel previous request if exists
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Request superseded");
      }

      // Create new cancel token
      cancelTokenSource.current = axios.CancelToken.source();

      // Set loading state
      setLoading(true);
      setError(null);

      // Merge params
      const mergedParams = {
        ...params,
        ...overrideParams,
        page,
        pageSize,
      };

      // Generate cache key
      const cacheKey = getCacheKey(page, pageSize, mergedParams);

      try {
        // Check cache first
        if (cache.current.has(cacheKey)) {
          const cachedData = cache.current.get(cacheKey);
          setData(cachedData);
          setTotalCount(cachedData.total);
          setLoading(false);

          if (onSuccess) {
            onSuccess(cachedData);
          }

          return cachedData;
        }

        // Make API request
        const response = await axios.get(endpoint, {
          params: mergedParams,
          cancelToken: cancelTokenSource.current.token,
        });

        // Process response
        const responseData = {
          items: response.data.items || response.data,
          total: response.data.total || response.data.length,
        };

        // Update state
        setData(responseData);
        setTotalCount(responseData.total);

        // Cache response
        cache.current.set(cacheKey, responseData);

        // Call success callback
        if (onSuccess) {
          onSuccess(responseData);
        }

        return responseData;
      } catch (err) {
        // Ignore canceled requests
        if (axios.isCancel(err)) {
          return;
        }

        // Set error state
        setError(err);

        // Call error callback
        if (onError) {
          onError(err);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, params, page, pageSize, getCacheKey, onSuccess, onError]
  );

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    return execute();
  }, [execute]);

  // Execute on mount
  useEffect(() => {
    if (executeOnMount) {
      execute();
    }

    // Cleanup
    return () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Component unmounted");
      }
    };
  }, [executeOnMount, execute]);

  // Execute when page or pageSize changes
  useEffect(() => {
    if (!executeOnMount) {
      return;
    }

    execute();
  }, [page, pageSize, execute, executeOnMount]);

  return {
    data: data.items || [],
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    handlePageChange,
    handlePageSizeChange,
    execute,
    refresh,
    clearCache,
  };
};

export default usePaginatedApi;
