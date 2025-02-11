const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const http = require('http');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://upskillglobal-frontend.up.railway.app', 
    'https://upskillglobal-backend.up.railway.app',
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Routes
app.use('/api', (req, res, next) => {
  next();
});
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  // Determine the appropriate status code
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = http.createServer(app);

function startServer() {
  server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is already in use. Trying another port...`);
      server.listen(0, HOST); // Let the OS assign a random available port
    } else {
      console.error('Server error:', error);
    }
  });

  server.on('listening', () => {
    const address = server.address();
    console.log(`Server is running on port ${address.port}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

startServer();
