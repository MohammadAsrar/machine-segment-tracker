const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Increase timeout for slow operations
jest.setTimeout(30000);

// MongoDB connection string for the in-memory server
let mongoServer;

// Connect to the in-memory database before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect and stop the server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global error handler mocking
global.console = {
  ...console,
  // Mock console.error to avoid noise in test output
  error: jest.fn(),
  // Keep console.log for debugging during test development
  log: process.env.DEBUG ? console.log : jest.fn(),
  // Mock console.warn to avoid noise in test output
  warn: jest.fn(),
  // Keep console.info for important test information
  info: console.info,
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 5001; // Use a different port for tests 