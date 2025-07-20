# Machine Segment Tracker API Documentation

This document provides detailed information about the API endpoints available in the Machine Segment Tracker application.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication via a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses are in JSON format. Successful responses have the following structure:

```json
{
  "success": true,
  "data": { /* Response data */ }
}
```

Error responses have the following structure:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Server Error

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## Endpoints

### Machines

#### GET /api/machines

Get all machines.

**Query Parameters:**
- `limit` - Number of results to return (default: 50)
- `page` - Page number for pagination (default: 1)
- `sort` - Field to sort by (default: name)
- `order` - Sort order: 'asc' or 'desc' (default: 'asc')
- `search` - Search term for machine name

**Response:**
```json
{
  "success": true,
  "data": {
    "machines": [
      {
        "id": "1",
        "name": "Machine A",
        "type": "CNC",
        "status": "active",
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-01-15T00:00:00.000Z"
      },
      {
        "id": "2",
        "name": "Machine B",
        "type": "Lathe",
        "status": "inactive",
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-01-15T00:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "totalPages": 1
  }
}
```

#### GET /api/machines/:id

Get a specific machine by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Machine A",
    "type": "CNC",
    "status": "active",
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z"
  }
}
```

#### POST /api/machines

Create a new machine.

**Request Body:**
```json
{
  "name": "Machine C",
  "type": "Mill",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "name": "Machine C",
    "type": "Mill",
    "status": "active",
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z"
  }
}
```

#### PUT /api/machines/:id

Update a machine.

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Machine A",
    "type": "CNC",
    "status": "inactive",
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z"
  }
}
```

#### DELETE /api/machines/:id

Delete a machine.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Machine deleted successfully"
  }
}
```

### Segments

#### GET /api/segments

Get all segments.

**Query Parameters:**
- `limit` - Number of results to return (default: 50)
- `page` - Page number for pagination (default: 1)
- `sort` - Field to sort by (default: date)
- `order` - Sort order: 'asc' or 'desc' (default: 'desc')
- `machineName` - Filter by machine name
- `segmentType` - Filter by segment type
- `date` - Filter by date (YYYY-MM-DD)
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "segments": [
      {
        "id": "1",
        "date": "2023-01-15",
        "machineName": "Machine A",
        "segmentType": "Uptime",
        "startTime": "08:00:00",
        "endTime": "10:00:00",
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-01-15T00:00:00.000Z"
      },
      {
        "id": "2",
        "date": "2023-01-15",
        "machineName": "Machine A",
        "segmentType": "Downtime",
        "startTime": "10:00:00",
        "endTime": "11:00:00",
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-01-15T00:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "totalPages": 1
  }
}
```

#### GET /api/segments/:id

Get a specific segment by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "date": "2023-01-15",
    "machineName": "Machine A",
    "segmentType": "Uptime",
    "startTime": "08:00:00",
    "endTime": "10:00:00",
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z"
  }
}
```

#### POST /api/segments

Create a new segment.

**Request Body:**
```json
{
  "date": "2023-01-15",
  "machineName": "Machine A",
  "segmentType": "Idle",
  "startTime": "15:00:00",
  "endTime": "16:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "date": "2023-01-15",
    "machineName": "Machine A",
    "segmentType": "Idle",
    "startTime": "15:00:00",
    "endTime": "16:00:00",
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z"
  }
}
```

#### PUT /api/segments/:id

Update a segment.

**Request Body:**
```json
{
  "endTime": "17:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "date": "2023-01-15",
    "machineName": "Machine A",
    "segmentType": "Idle",
    "startTime": "15:00:00",
    "endTime": "17:00:00",
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z"
  }
}
```

#### DELETE /api/segments/:id

Delete a segment.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Segment deleted successfully"
  }
}
```

### Analytics

#### GET /api/analytics/machines/:machineName

Get analytics for a specific machine.

**Query Parameters:**
- `startDate` - Start date for analytics (YYYY-MM-DD)
- `endDate` - End date for analytics (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "machineName": "Machine A",
    "totalUptime": 360,
    "totalDowntime": 60,
    "totalIdle": 60,
    "uptimePercentage": 75,
    "downtimePercentage": 12.5,
    "idlePercentage": 12.5,
    "segments": [
      {
        "date": "2023-01-15",
        "uptime": 360,
        "downtime": 60,
        "idle": 60
      }
    ]
  }
}
```

#### GET /api/analytics/overview

Get overview analytics for all machines.

**Query Parameters:**
- `startDate` - Start date for analytics (YYYY-MM-DD)
- `endDate` - End date for analytics (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMachines": 5,
    "activeMachines": 3,
    "totalUptime": 1440,
    "totalDowntime": 480,
    "totalIdle": 180,
    "averageUptimePercentage": 68.57,
    "averageDowntimePercentage": 22.86,
    "averageIdlePercentage": 8.57,
    "machineStats": [
      {
        "machineName": "Machine A",
        "uptimePercentage": 75,
        "downtimePercentage": 12.5,
        "idlePercentage": 12.5
      },
      {
        "machineName": "Machine B",
        "uptimePercentage": 62.5,
        "downtimePercentage": 25,
        "idlePercentage": 12.5
      }
    ]
  }
}
```

## Websocket API

The application also provides real-time updates via WebSockets.

### Connection

Connect to the WebSocket server at `/api/ws`.

### Events

#### machine.update

Triggered when a machine is updated.

```json
{
  "event": "machine.update",
  "data": {
    "id": "1",
    "name": "Machine A",
    "type": "CNC",
    "status": "inactive"
  }
}
```

#### segment.create

Triggered when a new segment is created.

```json
{
  "event": "segment.create",
  "data": {
    "id": "3",
    "date": "2023-01-15",
    "machineName": "Machine A",
    "segmentType": "Idle",
    "startTime": "15:00:00",
    "endTime": "16:00:00"
  }
}
```

## Rate Limits & Throttling

- API requests are limited to 100 requests per minute per IP
- Failed login attempts are limited to 5 per hour per IP

## Versioning

API versioning is included in the URI path:

Example: `/api/v1/machines`

Current API version: v1 