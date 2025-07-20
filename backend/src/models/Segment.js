const mongoose = require('mongoose');
const moment = require('moment');

/**
 * Segment Schema
 *
 * Represents a time segment for a machine with its operational status
 */
const segmentSchema = new mongoose.Schema(
  {
    // Date of the segment
    date: {
      type: String,
      required: [true, 'Date is required'],
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid date format! Use YYYY-MM-DD`,
      },
      index: true,
    },

    // Start time of the segment (HH:MM:SS)
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(v);
        },
        message: (props) => `${props.value} is not a valid time format! Use HH:MM:SS`,
      },
    },

    // End time of the segment (HH:MM:SS)
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(v);
        },
        message: (props) => `${props.value} is not a valid time format! Use HH:MM:SS`,
      },
    },

    // Name of the machine
    machineName: {
      type: String,
      required: [true, 'Machine name is required'],
      trim: true,
      index: true,
    },

    // Type of segment (uptime, downtime, idle, select)
    segmentType: {
      type: String,
      required: [true, 'Segment type is required'],
      enum: {
        values: ['uptime', 'downtime', 'idle', 'select'],
        message: '{VALUE} is not a valid segment type',
      },
      default: 'select',
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field for calculating duration in minutes
 */
segmentSchema.virtual('durationMinutes').get(function () {
  const start = moment(`${this.date}T${this.startTime}`);
  const end = moment(`${this.date}T${this.endTime}`);

  // Handle case where end time is on the next day
  if (end.isBefore(start)) {
    end.add(1, 'day');
  }

  return end.diff(start, 'minutes');
});

/**
 * Virtual field for calculating duration in hours
 */
segmentSchema.virtual('durationHours').get(function () {
  return this.durationMinutes / 60;
});

/**
 * Virtual field for formatted duration (HH:MM:SS)
 */
segmentSchema.virtual('durationFormatted').get(function () {
  const minutes = this.durationMinutes;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`;
});

/**
 * Compound index for querying segments by machine and date
 */
segmentSchema.index({ machineName: 1, date: 1 });

/**
 * Pre-save hook to validate that end time is after start time
 */
segmentSchema.pre('save', function (next) {
  const start = moment(`${this.date}T${this.startTime}`);
  const end = moment(`${this.date}T${this.endTime}`);

  // Handle case where end time is on the next day
  if (end.isBefore(start) && end.hour() < start.hour()) {
    end.add(1, 'day');
  }

  if (end.isSameOrBefore(start)) {
    return next(new Error('End time must be after start time'));
  }

  // Format machine name to always start with uppercase 'M'
  if (this.machineName) {
    if (this.machineName.toLowerCase().startsWith('m')) {
      this.machineName = 'M' + this.machineName.substring(1);
    }
  }

  next();
});

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;
