const eventModel = require('../models/eventModel');

class EventsController {
  
  // 现有的方法保持不变...
  async getHomepageEvents(req, res) {
    try {
      const events = await eventModel.getUpcomingEvents();
      
      res.json({
        success: true,
        data: events,
        count: events.length,
        message: 'Upcoming events retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getHomepageEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve events',
        error: error.message
      });
    }
  }

  async searchEvents(req, res) {
    try {
      const { date, location, category } = req.query;
      
      const filters = {};
      if (date) filters.date = date;
      if (location) filters.location = location;
      if (category) filters.category = parseInt(category);

      const events = await eventModel.searchEvents(filters);
      
      res.json({
        success: true,
        data: events,
        count: events.length,
        filters: filters,
        message: 'Events search completed successfully'
      });
    } catch (error) {
      console.error('Error in searchEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search events',
        error: error.message
      });
    }
  }

  async getEventDetails(req, res) {
    try {
      const eventId = parseInt(req.params.id);
      
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      const event = await eventModel.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event,
        message: 'Event details retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getEventDetails:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve event details',
        error: error.message
      });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await eventModel.getAllCategories();
      
      res.json({
        success: true,
        data: categories,
        count: categories.length,
        message: 'Categories retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error.message
      });
    }
  }

  async getFeaturedEvents(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const events = await eventModel.getFeaturedEvents(limit);
      
      res.json({
        success: true,
        data: events,
        count: events.length,
        message: 'Featured events retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getFeaturedEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve featured events',
        error: error.message
      });
    }
  }

  async healthCheck(req, res) {
    try {
      await eventModel.getAllCategories();
      
      res.json({
        success: true,
        message: 'API is healthy and database connection is working',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'API is unhealthy - database connection failed',
        error: error.message
      });
    }
  }

  // 🔥 新增的注册相关方法 🔥

  async createRegistration(req, res) {
    try {
      const { event_id, user_name, email, phone, tickets_purchased, comments } = req.body;
      
      console.log('Creating registration with data:', req.body);
      
      // 基本验证
      if (!event_id || !user_name || !email || !tickets_purchased) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: event_id, user_name, email, tickets_purchased'
        });
      }

      // 检查事件是否存在
      const event = await eventModel.getEventById(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // 创建注册记录
      const registrationId = await eventModel.createRegistration({
        event_id,
        user_name,
        email,
        phone: phone || null,
        tickets_purchased,
        comments: comments || null,
        registration_date: new Date().toISOString().split('T')[0]
      });

      res.status(201).json({
        success: true,
        data: { id: registrationId },
        message: 'Registration created successfully'
      });
      
    } catch (error) {
      console.error('Error in createRegistration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create registration',
        error: error.message
      });
    }
  }

  async getEventRegistrations(req, res) {
    try {
        const eventId = parseInt(req.params.id);
        
        console.log(`Fetching registrations for event ID: ${eventId}`);
        
        if (!eventId || isNaN(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        const registrations = await eventModel.getRegistrationsByEventId(eventId);
        
        console.log(`Successfully retrieved ${registrations.length} registrations`);
        
        res.json({
            success: true,
            data: registrations,
            count: registrations.length,
            message: 'Event registrations retrieved successfully'
        });
        
    } catch (error) {
        console.error('Detailed error in getEventRegistrations:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve event registrations',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
}

module.exports = new EventsController();