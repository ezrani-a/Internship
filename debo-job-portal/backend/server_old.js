const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import configurations
const db = require('./config/db');
const corsOptions = require('./config/corsConfig');
const initializeDatabase = require('./config/initDatabase');

const app = express();
const port = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors(corsOptions));

// Body parsing middleware with increased limits for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging middleware (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Test database connection
async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    console.log('? Database connection successful:', rows[0].solution === 2);
  } catch (error) {
    console.error('? Database connection failed:', error.message);
  }
}

// Initialize database and test connection
testConnection().then(() => {
  initializeDatabase();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Debo Job Portal API is running!',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      profile: '/api/profile', 
      jobs: '/api/jobs',
      applications: '/api/applications',
      admin: '/api/admin'
    }
  });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'API_DOCUMENTATION.md'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`?? Server is running on port: ${port}`);
  console.log(`?? API Documentation: http://localhost:${port}/api-docs`);
  console.log(`?? Health Check: http://localhost:${port}/health`);
  console.log(`?? Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
