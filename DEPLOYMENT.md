# Upskill Global: Deployment Guide

## Prerequisites
- Docker
- Docker Compose
- Hostinger Account
- MongoDB Atlas Account

## Local Development
1. Clone the repository
2. Create `.env` files in backend and frontend
3. Run `docker-compose up`

## Deployment Options

### 1. Render Deployment
1. Create a Render account
2. Create two web services:
   - Backend: Node.js service
   - Frontend: Static site

### 2. Hostinger Deployment

#### Backend Deployment
1. SSH into Hostinger server
2. Install Node.js and npm
3. Clone repository
4. Install dependencies: `npm install`
5. Set environment variables
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   pm2 startup
   ```

#### Frontend Deployment
1. Build React app: `npm run build`
2. Use Nginx to serve static files
3. Configure Nginx:
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       root /path/to/build;
       try_files $uri /index.html;
     }
     
     location /api {
       proxy_pass http://localhost:5000;
     }
   }
   ```

## Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `PORT`: Backend port (default 5000)

## Database Migration
1. Use MongoDB Atlas
2. Create a new cluster
3. Whitelist your deployment IP
4. Create a new database user

## Security Recommendations
- Use strong, unique passwords
- Enable SSL/TLS
- Implement rate limiting
- Use environment-specific configurations
