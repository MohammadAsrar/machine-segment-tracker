const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const segmentRoutes = require('../segments');
const Segment = require('../../models/Segment');

describe('Segment API Routes', () => {
  let app;
  let mongoServer;
  
  // Set up Express app for testing
  beforeAll(async () => {
    // Create a new MongoDB in-memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/api/segments', segmentRoutes);
  });
  
  // Clear all collections after each test
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
  
  // Disconnect and close server after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  // Sample segment data for testing
  const sampleSegment = {
    date: '2023-01-15',
    machineName: 'Machine A',
    segmentType: 'Uptime',
    startTime: '08:00:00',
    endTime: '10:00:00',
  };
  
  describe('GET /api/segments', () => {
    it('should return empty array when no segments exist', async () => {
      const res = await request(app).get('/api/segments');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });
    
    it('should return all segments', async () => {
      // Create test segments
      await Segment.create(sampleSegment);
      await Segment.create({
        ...sampleSegment,
        machineName: 'Machine B',
      });
      
      const res = await request(app).get('/api/segments');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(2);
      expect(res.body[0].machineName).toEqual('Machine A');
      expect(res.body[1].machineName).toEqual('Machine B');
    });
  });
  
  describe('GET /api/segments/:id', () => {
    it('should return a segment by ID', async () => {
      // Create a test segment
      const segment = await Segment.create(sampleSegment);
      
      const res = await request(app).get(`/api/segments/${segment._id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.machineName).toEqual('Machine A');
    });
    
    it('should return 404 for non-existent segment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app).get(`/api/segments/${nonExistentId}`);
      
      expect(res.statusCode).toEqual(404);
    });
  });
  
  describe('POST /api/segments', () => {
    it('should create a new segment', async () => {
      const res = await request(app)
        .post('/api/segments')
        .send(sampleSegment);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.machineName).toEqual('Machine A');
      
      // Check that segment was saved to database
      const segments = await Segment.find();
      expect(segments.length).toEqual(1);
      expect(segments[0].machineName).toEqual('Machine A');
    });
    
    it('should return 400 for invalid data', async () => {
      const invalidSegment = {
        date: '2023-01-15',
        // Missing machineName
        segmentType: 'Uptime',
        startTime: '08:00:00',
        endTime: '10:00:00',
      };
      
      const res = await request(app)
        .post('/api/segments')
        .send(invalidSegment);
      
      expect(res.statusCode).toEqual(400);
    });
  });
  
  describe('PUT /api/segments/:id', () => {
    it('should update an existing segment', async () => {
      // Create a test segment
      const segment = await Segment.create(sampleSegment);
      
      const updateData = {
        machineName: 'Updated Machine',
        segmentType: 'Downtime',
      };
      
      const res = await request(app)
        .put(`/api/segments/${segment._id}`)
        .send(updateData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.machineName).toEqual('Updated Machine');
      expect(res.body.segmentType).toEqual('Downtime');
      expect(res.body.date).toEqual('2023-01-15'); // Unchanged field
      
      // Check that segment was updated in database
      const updatedSegment = await Segment.findById(segment._id);
      expect(updatedSegment.machineName).toEqual('Updated Machine');
    });
    
    it('should return 404 for non-existent segment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .put(`/api/segments/${nonExistentId}`)
        .send({ machineName: 'Updated Machine' });
      
      expect(res.statusCode).toEqual(404);
    });
  });
  
  describe('DELETE /api/segments/:id', () => {
    it('should delete an existing segment', async () => {
      // Create a test segment
      const segment = await Segment.create(sampleSegment);
      
      const res = await request(app).delete(`/api/segments/${segment._id}`);
      
      expect(res.statusCode).toEqual(200);
      
      // Check that segment was deleted from database
      const segments = await Segment.find();
      expect(segments.length).toEqual(0);
    });
    
    it('should return 404 for non-existent segment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app).delete(`/api/segments/${nonExistentId}`);
      
      expect(res.statusCode).toEqual(404);
    });
  });
}); 