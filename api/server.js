const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const { testConnection } = require('./event_db');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static('.')); 

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 修复：确保路由正确挂载
app.use('/api/events', eventRoutes);  // 修改这里！
app.use('/images', express.static(path.join(__dirname, '../client/images')));

// API根路由
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

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// 错误处理
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
      console.log('✅ Server is ready to accept requests');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Server terminated');
  process.exit(0);
});

startServer();