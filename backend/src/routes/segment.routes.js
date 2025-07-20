/**
 * Segment Routes
 *
 * API routes for segment operations
 */

const express = require("express");
const router = express.Router();
const segmentController = require("../controllers/segment.controller");
const {
  validateCreateSegment,
  validateUpdateSegment,
  validateSegmentId,
  validateTimelineParams,
  validateSegmentFilters,
} = require("../middleware/validation");

// Get all segments with filtering and pagination
// GET /api/segments
router.get("/", validateSegmentFilters, segmentController.getAllSegments);

// Get segment analytics
// GET /api/segments/analytics
router.get(
  "/analytics",
  validateSegmentFilters,
  segmentController.getSegmentAnalytics
);

// Get timeline data for visualization
// GET /api/segments/timeline/:machineName
router.get(
  "/timeline/:machineName",
  validateTimelineParams,
  segmentController.getTimelineData
);

// Get summary statistics
// GET /api/segments/stats
router.get("/stats", validateSegmentFilters, segmentController.getStats);

// Get segment by ID
// GET /api/segments/:id
router.get("/:id", validateSegmentId, segmentController.getSegmentById);

// Create new segment
// POST /api/segments
router.post("/", validateCreateSegment, segmentController.createSegment);

// Update segment
// PUT /api/segments/:id
router.put("/:id", validateUpdateSegment, segmentController.updateSegment);

// Delete segment
// DELETE /api/segments/:id
router.delete("/:id", validateSegmentId, segmentController.deleteSegment);

module.exports = router;
