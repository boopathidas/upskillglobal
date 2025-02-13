const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');

// Enhanced Error Handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Robust CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'https://my-upskill-global.azurewebsites.net',
    'https://my-upskill-global-backend.azurewebsites.net',
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Comprehensive Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Azure-Specific Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend is running successfully',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    mongoConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Database Connection with Enhanced Error Handling
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB connection string is not defined');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Initialize Database Connection
connectDB();

// Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  const statusCode = err.status || 500;
  const errorResponse = {
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
});

// Server Initialization with Graceful Startup
function startServer() {
  const server = http.createServer(app);
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful Shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  return server;
}

// Start the server
const server = startServer();

// Export for Azure Functions compatibility
module.exports = app;
