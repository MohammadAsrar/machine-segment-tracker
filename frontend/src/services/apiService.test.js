/**
 * API Service Usage Examples
 *
 * This file demonstrates how to use the API service for various operations.
 * It's not an actual test file but serves as documentation.
 */

import apiService from "./apiService";
import {
  useSegments,
  useCreateSegment,
  useTimelineData,
} from "../hooks/useApi";

/**
 * Example 1: Basic API calls
 */
async function basicApiCalls() {
  try {
    // Fetch all segments
    const segments = await apiService.fetchSegments();
    console.log("Segments:", segments);

    // Create a new segment
    const newSegment = {
      machineId: "123",
      status: "uptime",
      startTime: "2023-01-01T08:00:00",
      endTime: "2023-01-01T12:00:00",
      notes: "Regular operation",
    };
    const createdSegment = await apiService.createSegment(newSegment);
    console.log("Created segment:", createdSegment);

    // Update a segment
    const updatedSegment = {
      ...createdSegment,
      notes: "Updated notes",
    };
    const result = await apiService.updateSegment(
      createdSegment.id,
      updatedSegment
    );
    console.log("Updated segment:", result);

    // Delete a segment
    const deleteResult = await apiService.deleteSegment(createdSegment.id);
    console.log("Delete result:", deleteResult);

    // Get timeline data for a machine
    const timelineData = await apiService.getTimelineData("M1");
    console.log("Timeline data:", timelineData);

    // Get statistics
    const statistics = await apiService.getStatistics();
    console.log("Statistics:", statistics);
  } catch (error) {
    console.error("API error:", error.message);
    // Access user-friendly message
    console.error("User message:", error.message);
    // Access original error if needed
    if (error.originalError) {
      console.error("Original error:", error.originalError);
    }
  }
}

/**
 * Example 2: Using cache control
 */
async function cacheControlExample() {
  // First call - will fetch from API
  const segments1 = await apiService.fetchSegments();

  // Second call - will use cached data
  const segments2 = await apiService.fetchSegments();

  // Force refresh by disabling cache
  const segments3 = await apiService.fetchSegments({ useCache: false });

  // Manually clear cache
  apiService.clearCache("segments");

  // Will fetch from API again
  const segments4 = await apiService.fetchSegments();
}

/**
 * Example 3: Request cancellation
 */
async function cancellationExample() {
  // Start a request
  const promise = apiService.getTimelineData("M1", {
    cancelKey: "timeline_request",
  });

  // Cancel the request
  apiService.cancelRequest("timeline_request");

  try {
    // This will throw a cancellation error
    await promise;
  } catch (error) {
    console.log("Request was cancelled:", error.type === "cancel");
  }

  // Cancel all pending requests
  apiService.cancelAllRequests();
}

/**
 * Example 4: Using with React hooks
 */
function ReactComponentExample() {
  // In a React component

  // 1. Fetch segments on mount
  const {
    data: segments,
    loading: segmentsLoading,
    error: segmentsError,
    execute: refreshSegments,
  } = useSegments();

  // 2. Create segment on demand
  const {
    loading: createLoading,
    error: createError,
    execute: createSegment,
  } = useCreateSegment({
    executeOnMount: false,
    onSuccess: (data) => {
      console.log("Segment created:", data);
      // Refresh segments
      refreshSegments();
    },
  });

  // 3. Get timeline data for a specific machine
  const { data: timelineData, loading: timelineLoading } =
    useTimelineData("M1");

  // Example handler
  const handleCreateSegment = async (formData) => {
    try {
      await createSegment(formData);
    } catch (error) {
      console.error("Failed to create segment:", error.message);
    }
  };

  // JSX would go here...
}

/**
 * Example 5: Retry mechanism
 */
async function retryExample() {
  try {
    // This will automatically retry up to 3 times with exponential backoff
    // if the server returns 5xx errors
    const data = await apiService.fetchSegments();
    return data;
  } catch (error) {
    // This will only be called after all retries have failed
    console.error("All retries failed:", error.message);
    throw error;
  }
}

/**
 * Example 6: Error handling
 */
async function errorHandlingExample() {
  try {
    await apiService.getTimelineData("non-existent-machine");
  } catch (error) {
    // Different error types
    switch (error.type) {
      case "network":
        console.error("Network error - check your connection");
        break;
      case "http":
        console.error(`HTTP ${error.status} error: ${error.message}`);
        break;
      case "cancel":
        console.log("Request was cancelled");
        break;
      default:
        console.error("Unknown error:", error.message);
    }
  }
}

// Export examples for documentation purposes
export {
  basicApiCalls,
  cacheControlExample,
  cancellationExample,
  ReactComponentExample,
  retryExample,
  errorHandlingExample,
};
