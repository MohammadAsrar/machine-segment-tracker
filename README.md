# Machine Segment Tracker

A web application for tracking machine segments with timeline visualization and downtime analytics.

## Project Overview

The Machine Segment Tracker is a full-stack web application that allows users to:

- Track machine operational segments (uptime, downtime, idle)
- Visualize machine timelines with color-coded segments
- Analyze downtime statistics
- Create and manage machine segments with real-time database persistence

## Features

- **Form Table with Dynamic Row Creation**

  - Add new rows with auto-filled current date/time
  - Select segment types (uptime, downtime, idle)
  - Save segments to database
  - Machine name auto-formatting (m/M → M)
  - Pagination for multiple rows

- **Machine Timeline Visualization**

  - Color-coded timeline bars (green: uptime, yellow: idle, red: downtime)
  - Downtime analytics for each machine
  - Real-time updates when segments are modified

- **Database Integration**
  - MongoDB for data persistence
  - Real-time synchronization between frontend and backend
  - Data persistence across page reloads

## Tech Stack

### Frontend

- React.js
- Tailwind CSS
- Axios for API calls
- React-Paginate for pagination

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- RESTful API

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/MohammadAsrar/machine-segment-tracker.git
cd machine-segment-tracker
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/machine-segment-tracker
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Running the Application

1. Start MongoDB (if not running as a service):

```bash
mongod
```

2. Seed the database with initial data:

```bash
cd backend
npm run seed
```

3. Start the backend server:

```bash
npm run dev
```

4. In a new terminal, start the frontend development server:

```bash
cd frontend
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Segments

- `GET /api/segments` - Get all segments (with optional filtering)
- `GET /api/segments/:id` - Get segment by ID
- `POST /api/segments` - Create a new segment
- `PUT /api/segments/:id` - Update an existing segment
- `DELETE /api/segments/:id` - Delete a segment

## Project Structure

```
machine-segment-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## License

MIT
