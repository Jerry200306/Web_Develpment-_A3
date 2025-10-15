const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// 注意：这些路由现在相对于 /api/events
// 所以完整路径是 /api/events/health, /api/events/, 等

// @route   GET /api/events/health
// @desc    Health check endpoint
// @access  Public
router.get('/health', eventsController.healthCheck);

// @route   GET /api/events
// @desc    Get all upcoming events for homepage
// @access  Public
router.get('/', eventsController.getHomepageEvents);

// @route   GET /api/events/categories  ← 把这个移到上面！
// @desc    Get all event categories
// @access  Public
router.get('/categories', eventsController.getCategories);

// @route   GET /api/events/featured
// @desc    Get featured events (optional endpoint)
// @access  Public
router.get('/featured', eventsController.getFeaturedEvents);

// @route   GET /api/events/search
// @desc    Search events by criteria
// @access  Public
router.get('/search', eventsController.searchEvents);

// @route   GET /api/events/:id  ← 这个动态路由在最后！
// @desc    Get event details by ID
// @access  Public
router.get('/:id', eventsController.getEventDetails);

// 新增注册相关路由
// @route   POST /api/events/registrations
// @desc    Create a new registration
// @access  Public
router.post('/registrations', eventsController.createRegistration);

// @route   GET /api/events/:id/registrations
// @desc    Get registrations for a specific event
// @access  Public
router.get('/:id/registrations', eventsController.getEventRegistrations);

module.exports = router;