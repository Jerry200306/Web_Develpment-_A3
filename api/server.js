const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const { testConnection } = require('./event_db');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

// Static file service
app.use(express.static('.')); 

// Middleware
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Fix: Ensure routes are correctly mounted
app.use('/api/events', eventRoutes);  // Modified here!
app.use('/images', express.static(path.join(__dirname, '../client/images')));

// API root route
app.get('/api', (req, res) => {
  res.json({
    message: 'Charity Events API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/events/health',
      events: 'GET /api/events',
      featured: 'GET /api/events/featured',
      search: 'GET /api/events/search',
      eventDetails: 'GET /api/events/:id',
      categories: 'GET /api/events/categories'
    },
    documentation: 'See README for API documentation'
  });
});

// 🔥 New: Frontend route support - Handle AngularJS routing
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// 404 handling - Modified to exclude API routes
app.use('*', (req, res, next) => {
  // If it's an API route, return JSON format 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.originalUrl} not found`
    });
  }
  
  // For non-API routes, if it's admin path, return index.html (frontend routing)
  if (req.path.startsWith('/admin/')) {
    return res.sendFile(path.join(__dirname, '../admin/index.html'));
  }
  
  // Other cases return generic 404
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Charity Events API Server running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📊 Events API: http://localhost:${PORT}/api/events`);
      console.log(`🔧 Health check: http://localhost:${PORT}/api/events/health`);
      console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
      console.log('✅ Server is ready to accept requests');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Server terminated');
  process.exit(0);
});

startServer();
