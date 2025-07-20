import { useState, useCallback, useEffect, useRef } from "react";
import apiService from "../services/apiService";

/**
 * Custom hook for API integration with validation support
 *
 * @param {Object} options - Hook options
 * @param {Function} options.validateFn - Function to validate data before submission
 * @param {Object} options.validationContext - Additional context for validation
 * @returns {Object} - API state and handlers
 */
const useApi = (options = {}) => {
  const { validateFn, validationContext = {} } = options;

  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  // Refs
  const isMounted = useRef(true);

  // Reset mounted state on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Validate data before submission
  const validateData = useCallback(
    (dataToValidate) => {
      if (!validateFn) return { isValid: true, errors: {} };

      const validationResult = validateFn(dataToValidate, validationContext);

      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors || {});
      } else {
        setValidationErrors({});
      }

      return validationResult;
    },
    [validateFn, validationContext]
  );

  // Fetch data from API
  const fetchData = useCallback(async (endpoint, params = {}) => {
    setLoading(true);
    setStatus("loading");
    setError(null);

    try {
      const response = await apiService.get(endpoint, params);

      if (isMounted.current) {
        setData(response.data || []);
        setStatus("success");
      }

      return response.data;
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || "An error occurred while fetching data");
        setStatus("error");
      }

      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Create data via API
  const createData = useCallback(
    async (endpoint, newData) => {
      // Validate data before submission if validation function is provided
      if (validateFn) {
        const { isValid, errors } = validateData(newData);

        if (!isValid) {
          return { success: false, errors };
        }
      }

      setLoading(true);
      setStatus("loading");
      setError(null);

      try {
        const response = await apiService.post(endpoint, newData);

        if (isMounted.current) {
          setData((prevData) => [...prevData, response.data]);
          setStatus("success");
        }

        return { success: true, data: response.data };
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || "An error occurred while creating data");
          setStatus("error");
        }

        return { success: false, error: err.message };
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [validateFn, validateData]
  );

  // Update data via API
  const updateData = useCallback(
    async (endpoint, id, updatedData) => {
      // Validate data before submission if validation function is provided
      if (validateFn) {
        const { isValid, errors } = validateData(updatedData);

        if (!isValid) {
          return { success: false, errors };
        }
      }

      setLoading(true);
      setStatus("loading");
      setError(null);

      try {
        const response = await apiService.put(`${endpoint}/${id}`, updatedData);

        if (isMounted.current) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === id ? { ...item, ...response.data } : item
            )
          );
          setStatus("success");
        }

        return { success: true, data: response.data };
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || "An error occurred while updating data");
          setStatus("error");
        }

        return { success: false, error: err.message };
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [validateFn, validateData]
  );

  // Delete data via API
  const deleteData = useCallback(async (endpoint, id) => {
    setLoading(true);
    setStatus("loading");
    setError(null);

    try {
      await apiService.delete(`${endpoint}/${id}`);

      if (isMounted.current) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        setStatus("success");
      }

      return { success: true };
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || "An error occurred while deleting data");
        setStatus("error");
      }

      return { success: false, error: err.message };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Bulk update data via API
  const bulkUpdate = useCallback(async (endpoint, ids, updateData) => {
    setLoading(true);
    setStatus("loading");
    setError(null);

    try {
      const response = await apiService.post(`${endpoint}/bulk`, {
        ids,
        data: updateData,
      });

      if (isMounted.current) {
        setData((prevData) =>
          prevData.map((item) =>
            ids.includes(item.id) ? { ...item, ...updateData } : item
          )
        );
        setStatus("success");
      }

      return { success: true, data: response.data };
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || "An error occurred during bulk update");
        setStatus("error");
      }

      return { success: false, error: err.message };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  // Reset status
  const resetStatus = useCallback(() => {
    setStatus("idle");
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setValidationErrors({});
    setStatus("idle");
  }, []);

  return {
    data,
    loading,
    error,
    validationErrors,
    status,
    fetchData,
    createData,
    updateData,
    deleteData,
    bulkUpdate,
    resetError,
    resetStatus,
    reset,
    validateData,
  };
};

/**
 * Hook for fetching all segments
 */
export const useSegments = (options = {}) => {
  return useApi(apiService.fetchSegments, [], {
    ...options,
    cacheKey: "segments",
  });
};

/**
 * Hook for creating a segment
 */
export const useCreateSegment = (options = {}) => {
  return useApi(apiService.createSegment, [], {
    executeOnMount: false,
    ...options,
  });
};

/**
 * Hook for updating a segment
 */
export const useUpdateSegment = (id, options = {}) => {
  return useApi((data) => apiService.updateSegment(id, data), [id], {
    executeOnMount: false,
    ...options,
  });
};

/**
 * Hook for deleting a segment
 */
export const useDeleteSegment = (id, options = {}) => {
  return useApi(() => apiService.deleteSegment(id), [id], {
    executeOnMount: false,
    ...options,
  });
};

/**
 * Hook for fetching timeline data for a machine
 */
export const useTimelineData = (machineName, options = {}) => {
  return useApi(() => apiService.getTimelineData(machineName), [machineName], {
    ...options,
    cacheKey: `timeline_${machineName}`,
  });
};

/**
 * Hook for fetching statistics
 */
export const useStatistics = (options = {}) => {
  return useApi(apiService.getStatistics, [], {
    ...options,
    cacheKey: "statistics",
  });
};

/**
 * Hook for fetching all machines
 */
export const useMachines = (options = {}) => {
  return useApi(apiService.getMachines, [], {
    ...options,
    cacheKey: "machines",
  });
};

/**
 * Hook for fetching a single machine
 */
export const useMachine = (id, options = {}) => {
  return useApi(() => apiService.getMachine(id), [id], {
    ...options,
    cacheKey: `machine_${id}`,
  });
};

export default useApi;
