# Machine Segment Tracker - Deployment Guide

This document provides step-by-step instructions for deploying the Machine Segment Tracker application to a production environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Docker Deployment](#docker-deployment)
6. [CI/CD Setup](#cicd-setup)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)
- Access to a cloud provider (AWS, Azure, Google Cloud, etc.)
- Domain name (optional)

## Environment Configuration

### Backend Environment Variables

Create a `.env.production` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://your-mongodb-uri/machine-segment-tracker
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=error
```

### Frontend Environment Variables

Create a `.env.production` file in the frontend directory:

```
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
```

## Backend Deployment

### Option 1: Traditional Server Deployment

1. **Prepare the backend code**:

```bash
cd backend
npm install --production
```

2. **Build the backend**:

```bash
npm run build
```

3. **Set up a process manager (PM2)**:

```bash
npm install -g pm2
pm2 ecosystem
```

4. **Configure ecosystem.config.js**:

```javascript
module.exports = {
  apps: [
    {
      name: "machine-segment-tracker-api",
      script: "src/server.js",
      instances: "max",
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
```

5. **Start the application**:

```bash
pm2 start ecosystem.config.js --env production
```

6. **Configure Nginx as a reverse proxy**:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Set up SSL with Let's Encrypt**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Serverless Deployment (AWS Lambda)

1. **Install serverless framework**:

```bash
npm install -g serverless
```

2. **Create serverless.yml**:

```yaml
service: machine-segment-tracker-api

provider:
  name: aws
  runtime: nodejs14.x
  stage: ${opt:stage, 'prod'}
  region: ${opt:region, 'us-east-1'}
  environment:
    MONGODB_URI: ${env:MONGODB_URI}
    NODE_ENV: production

functions:
  api:
    handler: src/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: any
          cors: true
```

3. **Create lambda.js adapter**:

```javascript
const serverless = require("serverless-http");
const app = require("./server");

module.exports.handler = serverless(app);
```

4. **Deploy to AWS Lambda**:

```bash
serverless deploy --stage prod
```

## Frontend Deployment

### Option 1: Static Hosting (AWS S3 + CloudFront)

1. **Build the frontend**:

```bash
cd frontend
npm install
npm run build
```

2. **Create S3 bucket and configure for static website hosting**:

```bash
aws s3 mb s3://machine-segment-tracker-frontend
aws s3 website s3://machine-segment-tracker-frontend --index-document index.html --error-document index.html
```

3. **Upload build files to S3**:

```bash
aws s3 sync build/ s3://machine-segment-tracker-frontend --acl public-read
```

4. **Set up CloudFront distribution**:

- Create a CloudFront distribution pointing to your S3 bucket
- Configure SSL certificate using AWS Certificate Manager
- Set up custom domain

### Option 2: Netlify/Vercel Deployment

1. **Install Netlify CLI**:

```bash
npm install -g netlify-cli
```

2. **Create netlify.toml**:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Deploy to Netlify**:

```bash
netlify deploy --prod
```

## Docker Deployment

### Docker Configuration

1. **Create a Dockerfile for the backend**:

```dockerfile
FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

2. **Create a Dockerfile for the frontend**:

```dockerfile
FROM node:14-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

3. **Create docker-compose.yml**:

```yaml
version: "3"

services:
  mongodb:
    image: mongo:4
    volumes:
      - mongodb_data:/data/db
    restart: always
    networks:
      - app-network

  backend:
    build: ./backend
    restart: always
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/machine-segment-tracker
      - NODE_ENV=production
      - PORT=5000
      - CORS_ORIGIN=https://your-frontend-domain.com
    networks:
      - app-network

  frontend:
    build: ./frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
      - "443:443"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
```

4. **Deploy with Docker Compose**:

```bash
docker-compose -f docker-compose.yml up -d
```

## CI/CD Setup

### GitHub Actions

1. **Create .github/workflows/deploy.yml**:

```yaml
name: Deploy Machine Segment Tracker

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "14"

      - name: Install Backend Dependencies
        run: |
          cd backend
          npm ci

      - name: Run Backend Tests
        run: |
          cd backend
          npm test

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci

      - name: Run Frontend Tests
        run: |
          cd frontend
          npm test

      - name: Build Frontend
        run: |
          cd frontend
          npm run build

      - name: Deploy to Production
        if: success()
        run: |
          # Add deployment commands here
          # For example, using AWS CLI, Netlify, or custom deployment scripts
```

## Monitoring and Maintenance

### Health Check Endpoints

Add a health check endpoint to the backend:

```javascript
// In server.js or a separate route file
app.get("/health", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    dbConnection:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  };
  res.status(200).json(healthcheck);
});
```

### Monitoring Setup

1. **Set up Application Monitoring**:

   - Use services like New Relic, Datadog, or AWS CloudWatch
   - Monitor API response times, error rates, and resource usage

2. **Database Monitoring**:

   - Set up MongoDB Atlas monitoring
   - Configure alerts for high CPU/memory usage
   - Monitor query performance

3. **Log Management**:
   - Use a centralized logging solution like ELK Stack or Loggly
   - Configure log rotation and retention policies

### Backup Strategy

1. **Database Backups**:

   - Set up automated MongoDB backups
   - Store backups in a secure location
   - Test restoration process regularly

2. **Application Backups**:
   - Backup configuration files
   - Backup environment variables
   - Document restoration procedures

## Security Considerations

1. **Enable HTTPS**:

   - Use SSL certificates for all endpoints
   - Configure HSTS headers

2. **Implement Rate Limiting**:

   - Protect API endpoints from abuse
   - Configure appropriate rate limits

3. **Security Headers**:

   - Set Content-Security-Policy
   - Set X-XSS-Protection
   - Set X-Content-Type-Options

4. **Regular Updates**:
   - Keep dependencies updated
   - Apply security patches promptly

## Performance Optimization

1. **Enable Compression**:

   - Use gzip/brotli compression for API responses
   - Compress static assets

2. **Implement Caching**:

   - Set appropriate cache headers
   - Use Redis for API response caching

3. **CDN Integration**:
   - Serve static assets through a CDN
   - Configure proper cache invalidation

---

This deployment guide provides a comprehensive approach to deploying the Machine Segment Tracker application. Adjust the steps according to your specific infrastructure and requirements.
