import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Segment API endpoints
export const segmentAPI = {
  // Get all segments with optional filtering and pagination
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/segments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a single segment by ID
  getById: async id => {
    try {
      const response = await api.get(`/segments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a new segment
  create: async segmentData => {
    try {
      const response = await api.post('/segments', segmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update an existing segment
  update: async (id, segmentData) => {
    try {
      const response = await api.put(`/segments/${id}`, segmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a segment
  delete: async id => {
    try {
      const response = await api.delete(`/segments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get timeline data for visualization
  getTimelineData: async (machineName, params = {}) => {
    try {
      const response = await api.get(`/segments/timeline/${machineName}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;
