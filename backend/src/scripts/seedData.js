/**
 * Seed script to populate the database with initial data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Segment = require('../models/Segment');
const connectDB = require('../config/database');
const logger = require('../utils/logger');

// Load environment variables
dotenv.config();

// Initial segments data
const initialSegments = [
  {
    date: '2025-07-15',
    startTime: '06:00:00',
    endTime: '07:30:00',
    machineName: 'M1',
    segmentType: 'uptime',
  },
  {
    date: '2025-07-15',
    startTime: '07:30:00',
    endTime: '08:00:00',
    machineName: 'M2',
    segmentType: 'idle',
  },
  {
    date: '2025-07-15',
    startTime: '08:00:00',
    endTime: '09:15:00',
    machineName: 'M3',
    segmentType: 'downtime',
  },
  {
    date: '2025-07-15',
    startTime: '09:15:00',
    endTime: '10:45:00',
    machineName: 'M1',
    segmentType: 'uptime',
  },
  {
    date: '2025-07-15',
    startTime: '15:12:00',
    endTime: '20:16:00',
    machineName: 'M1',
    segmentType: 'idle',
  },
  {
    date: '2025-07-15',
    startTime: '16:12:00',
    endTime: '21:16:00',
    machineName: 'M1',
    segmentType: 'uptime',
  },
  {
    date: '2025-07-15',
    startTime: '17:12:00',
    endTime: '22:16:00',
    machineName: 'M1',
    segmentType: 'downtime',
  },
  {
    date: '2025-07-15',
    startTime: '18:12:00',
    endTime: '23:16:00',
    machineName: 'M2',
    segmentType: 'select',
  },
  {
    date: '2025-07-15',
    startTime: '19:12:00',
    endTime: '00:16:00',
    machineName: 'M2',
    segmentType: 'select',
  },
  {
    date: '2025-07-15',
    startTime: '20:12:00',
    endTime: '01:16:00',
    machineName: 'M3',
    segmentType: 'select',
  },
  {
    date: '2025-07-15',
    startTime: '21:12:00',
    endTime: '02:16:00',
    machineName: 'M4',
    segmentType: 'select',
  },
];

/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Segment.deleteMany({});
    logger.info('Cleared existing segments data');

    // Insert new data
    const segments = await Segment.insertMany(initialSegments);
    logger.info(`Inserted ${segments.length} segments`);

    // Close connection
    await mongoose.connection.close();
    logger.info('Database connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
