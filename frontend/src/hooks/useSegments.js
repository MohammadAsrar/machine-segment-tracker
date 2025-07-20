import { useState, useEffect } from 'react';
import { segmentAPI } from '../services/api';
import { defaultFormRows } from '../data';
import moment from 'moment';

/**
 * Custom hook for managing segments with API integration
 */
const useSegments = () => {
  // State for segments data
  const [segments, setSegments] = useState([]);

  // State for form rows
  const [formRows, setFormRows] = useState([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch segments from API
  const fetchSegments = async () => {
    try {
      setIsLoading(true);
      const response = await segmentAPI.getAll();

      // Map API data to our format
      const apiSegments = response.data.map(segment => ({
        id: segment._id,
        date: segment.date,
        startTime: segment.startTime,
        endTime: segment.endTime,
        machineName: segment.machineName,
        segmentType: segment.segmentType,
      }));

      setSegments(apiSegments);

      // If no form rows exist yet, use the API data for form rows
      if (formRows.length === 0) {
        setFormRows(apiSegments.length > 0 ? apiSegments : defaultFormRows);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching segments:', err);
      setError('Failed to load segments. Please try again later.');
      // Use default data if API fails
      setFormRows(defaultFormRows);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle segment type change in form
  const handleSegmentTypeChange = (rowId, segmentType) => {
    setFormRows(prevRows =>
      prevRows.map(row => (row.id === rowId ? { ...row, segmentType } : row))
    );
  };

  // Handle save button click
  const handleSave = async row => {
    try {
      setIsSaving(true);

      // Format machine name to ensure it starts with uppercase 'M'
      const formattedMachineName = row.machineName.toLowerCase().startsWith('m')
        ? 'M' + row.machineName.substring(1)
        : row.machineName;

      const segmentData = {
        ...row,
        machineName: formattedMachineName,
      };

      let savedSegment;

      // Check if segment already exists in segments array (has a MongoDB _id)
      const existingSegment = segments.find(segment => segment.id === row.id);

      if (existingSegment) {
        // Update existing segment
        const response = await segmentAPI.update(row.id, segmentData);
        savedSegment = {
          id: response.data._id,
          date: response.data.date,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
          machineName: response.data.machineName,
          segmentType: response.data.segmentType,
        };

        // Update segments state
        setSegments(prevSegments =>
          prevSegments.map(segment => (segment.id === savedSegment.id ? savedSegment : segment))
        );
      } else {
        // Create new segment
        const response = await segmentAPI.create(segmentData);
        savedSegment = {
          id: response.data._id,
          date: response.data.date,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
          machineName: response.data.machineName,
          segmentType: response.data.segmentType,
        };

        // Add to segments state
        setSegments(prevSegments => [...prevSegments, savedSegment]);
      }

      // Update form rows with saved data
      setFormRows(prevRows =>
        prevRows.map(row => (row.id === savedSegment.id ? savedSegment : row))
      );

      setError(null);
    } catch (err) {
      console.error('Error saving segment:', err);
      setError('Failed to save segment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch segments on component mount
  useEffect(() => {
    fetchSegments();
  }, []);

  return {
    segments,
    formRows,
    isLoading,
    isSaving,
    error,
    handleSegmentTypeChange,
    handleSave,
    fetchSegments,
  };
};

export default useSegments;
