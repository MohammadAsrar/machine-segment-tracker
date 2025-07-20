/**
 * Segment Controller
 *
 * Handles all segment-related operations
 */

const Segment = require("../models/Segment");
const logger = require("../utils/logger");

/**
 * Get all segments
 * @route GET /api/segments
 * @access Public
 */
exports.getAllSegments = async (req, res) => {
  try {
    // Parse query parameters for filtering
    const { machineName, segmentType, date, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};

    if (machineName) {
      filter.machineName = machineName;
    }

    if (segmentType) {
      filter.segmentType = segmentType;
    }

    if (date) {
      filter.date = date;
    } else if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const segments = await Segment.find(filter)
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Segment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: segments.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: segments,
    });
  } catch (error) {
    logger.error("Error fetching segments", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get segment by ID
 * @route GET /api/segments/:id
 * @access Public
 */
exports.getSegmentById = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Segment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: segment,
    });
  } catch (error) {
    logger.error(`Error fetching segment with id ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Create new segment
 * @route POST /api/segments
 * @access Public
 */
exports.createSegment = async (req, res) => {
  try {
    const segment = new Segment(req.body);
    const newSegment = await segment.save();

    logger.info(`Created new segment with id ${newSegment._id}`);

    res.status(201).json({
      success: true,
      data: newSegment,
    });
  } catch (error) {
    logger.error("Error creating segment", error);

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Update segment
 * @route PUT /api/segments/:id
 * @access Public
 */
exports.updateSegment = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Segment not found",
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      segment[key] = req.body[key];
    });

    // Save updated segment
    const updatedSegment = await segment.save();

    logger.info(`Updated segment with id ${updatedSegment._id}`);

    res.status(200).json({
      success: true,
      data: updatedSegment,
    });
  } catch (error) {
    logger.error(`Error updating segment with id ${req.params.id}`, error);

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Delete segment
 * @route DELETE /api/segments/:id
 * @access Public
 */
exports.deleteSegment = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Segment not found",
      });
    }

    await segment.deleteOne();

    logger.info(`Deleted segment with id ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "Segment deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting segment with id ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get segment analytics
 * @route GET /api/segments/analytics
 * @access Public
 */
exports.getSegmentAnalytics = async (req, res) => {
  try {
    const { machineName, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};

    if (machineName) {
      filter.machineName = machineName;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    // Get counts by segment type
    const analytics = await Segment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            machineName: "$machineName",
            segmentType: "$segmentType",
          },
          count: { $sum: 1 },
          totalDuration: {
            $sum: {
              $let: {
                vars: {
                  startDateTime: { $concat: ["$date", "T", "$startTime"] },
                  endDateTime: { $concat: ["$date", "T", "$endTime"] },
                },
                in: {
                  $divide: [
                    {
                      $subtract: [
                        { $toDate: "$$endDateTime" },
                        { $toDate: "$$startDateTime" },
                      ],
                    },
                    60000, // Convert milliseconds to minutes
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.machineName",
          segments: {
            $push: {
              type: "$_id.segmentType",
              count: "$count",
              totalDuration: "$totalDuration",
              formattedDuration: {
                $concat: [
                  {
                    $toString: { $floor: { $divide: ["$totalDuration", 60] } },
                  },
                  ":",
                  {
                    $toString: {
                      $cond: {
                        if: { $lt: [{ $mod: ["$totalDuration", 60] }, 10] },
                        then: {
                          $concat: [
                            "0",
                            { $toString: { $mod: ["$totalDuration", 60] } },
                          ],
                        },
                        else: { $toString: { $mod: ["$totalDuration", 60] } },
                      },
                    },
                  },
                  ":00",
                ],
              },
            },
          },
          totalSegments: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error("Error fetching segment analytics", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get timeline data for visualization
 * @route GET /api/segments/timeline/:machineName
 * @access Public
 */
exports.getTimelineData = async (req, res) => {
  try {
    const { machineName } = req.params;
    const { startDate, endDate } = req.query;

    logger.info(`Fetching timeline data for machine: ${machineName}`);

    // Build filter object
    const filter = { machineName };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    // Get segments sorted by date and time
    const segments = await Segment.find(filter)
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Transform data for timeline visualization
    const timelineData = segments.map((segment) => {
      const startDateTime = new Date(`${segment.date}T${segment.startTime}`);
      const endDateTime = new Date(`${segment.date}T${segment.endTime}`);

      // Handle case where end time is on the next day
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      return {
        id: segment._id,
        start: startDateTime,
        end: endDateTime,
        type: segment.segmentType,
        machine: segment.machineName,
        duration: {
          minutes: Math.round((endDateTime - startDateTime) / 60000),
          formatted: segment.durationFormatted,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: timelineData.length,
      data: timelineData,
    });
  } catch (error) {
    logger.error(`Error fetching timeline data: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get summary statistics
 * @route GET /api/segments/stats
 * @access Public
 */
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    logger.info("Fetching segment statistics");

    // Build filter object
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    // Get overall statistics
    const stats = await Segment.aggregate([
      { $match: filter },
      {
        $facet: {
          // Count by segment type
          byType: [
            {
              $group: {
                _id: "$segmentType",
                count: { $sum: 1 },
                totalDuration: {
                  $sum: {
                    $let: {
                      vars: {
                        startDateTime: {
                          $concat: ["$date", "T", "$startTime"],
                        },
                        endDateTime: { $concat: ["$date", "T", "$endTime"] },
                      },
                      in: {
                        $divide: [
                          {
                            $subtract: [
                              { $toDate: "$$endDateTime" },
                              { $toDate: "$$startDateTime" },
                            ],
                          },
                          60000, // Convert milliseconds to minutes
                        ],
                      },
                    },
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
          ],

          // Count by machine
          byMachine: [
            {
              $group: {
                _id: "$machineName",
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],

          // Count by date
          byDate: [
            {
              $group: {
                _id: "$date",
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],

          // Overall totals
          totals: [
            {
              $group: {
                _id: null,
                totalSegments: { $sum: 1 },
                uniqueMachines: { $addToSet: "$machineName" },
                uniqueDates: { $addToSet: "$date" },
              },
            },
            {
              $project: {
                _id: 0,
                totalSegments: 1,
                uniqueMachineCount: { $size: "$uniqueMachines" },
                uniqueDateCount: { $size: "$uniqueDates" },
              },
            },
          ],
        },
      },
    ]);

    // Calculate percentages for segment types
    const segmentTypes = stats[0].byType;
    const totalDuration = segmentTypes.reduce(
      (acc, type) => acc + type.totalDuration,
      0
    );

    const segmentTypesWithPercentages = segmentTypes.map((type) => ({
      ...type,
      percentage: Math.round((type.totalDuration / totalDuration) * 100),
      formattedDuration: formatDuration(type.totalDuration),
    }));

    // Format the final response
    const formattedStats = {
      byType: segmentTypesWithPercentages,
      byMachine: stats[0].byMachine,
      byDate: stats[0].byDate,
      totals: stats[0].totals[0] || {
        totalSegments: 0,
        uniqueMachineCount: 0,
        uniqueDateCount: 0,
      },
    };

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    logger.error(`Error fetching segment statistics: ${error.message}`, error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Helper function to format duration in minutes to HH:MM:SS
 * @param {Number} minutes - Duration in minutes
 * @returns {String} Formatted duration string
 */
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
};
