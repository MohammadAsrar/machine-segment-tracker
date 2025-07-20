const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import middleware
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const connectDB = require('./config/database');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(
    morgan('combined', {
      skip: (req, res) => res.statusCode < 400,
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
} else {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Connect to MongoDB
connectDB()
  .then(() => {
    logger.info('Database connection established');
  })
  .catch((err) => {
    logger.error('Database connection failed:', err);
    process.exit(1);
  });

// Import routes
const machineRoutes = require('./routes/machine.routes');
const segmentRoutes = require('./routes/segment.routes');

// Use routes
app.use('/api/machines', machineRoutes);
app.use('/api/segments', segmentRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Machine Segment Tracker API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
  res.status(200).json(healthcheck);
});

// Rate limiting for production
if (process.env.NODE_ENV === 'production') {
  const rateLimit = require('express-rate-limit');

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
  });

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  shutDown();
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Shutting down gracefully...');
  shutDown();
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // Application should continue running despite unhandled promise rejections
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutDown();
});

/**
 * Graceful shutdown function
 */
const shutDown = () => {
  logger.info('Closing HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed.');

    // Close database connection
    logger.info('Closing database connection...');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });

    // If database connection doesn't close in time, force exit
    setTimeout(() => {
      logger.error('Could not close database connection in time, forcing shutdown...');
      process.exit(1);
    }, 5000);
  });

  // If server doesn't close in time, force exit
  setTimeout(() => {
    logger.error('Could not close server in time, forcing shutdown...');
    process.exit(1);
  }, 10000);
};

module.exports = app;
