const { db } = require('../event_db');

class EventModel {
  
  // 现有的方法保持不变...
  async getUpcomingEvents() {
    const query = `
      SELECT 
        e.*,
        c.name as category_name,
        o.name as organization_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.date >= CURDATE() AND e.is_active = TRUE
      ORDER BY e.date ASC, e.time ASC
    `;
    
    try {
      const [rows] = await db.execute(query);
      
      const eventsWithImages = rows.map((event, index) => {
        const imageNumber = (index % 7) + 1;
        return {
          ...event,
          image_url: `/images/events/${imageNumber}.jpg`
        };
      });
      return eventsWithImages;
    } catch (error) {
      throw new Error(`Error fetching upcoming events: ${error.message}`);
    }
  }

  async searchEvents(filters = {}) {
    let query = `
      SELECT 
        e.*,
        c.name as category_name,
        o.name as organization_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.is_active = TRUE
    `;
    
    const params = [];
    const conditions = [];

    if (filters.date) {
      conditions.push('e.date = ?');
      params.push(filters.date);
    }

    if (filters.location) {
      conditions.push('(e.location LIKE ? OR e.venue_name LIKE ?)');
      params.push(`%${filters.location}%`, `%${filters.location}%`);
    }

    if (filters.category) {
      conditions.push('e.category_id = ?');
      params.push(filters.category);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY e.date ASC, e.time ASC';

    try {
      const [rows] = await db.execute(query, params);
      const eventsWithImages = rows.map((event, index) => {
        const imageNumber = (index % 7) + 1;
        return {
          ...event,
          image_url: `/images/events/${imageNumber}.jpg`
        };
      });
      
      return eventsWithImages;
    } catch (error) {
      throw new Error(`Error searching events: ${error.message}`);
    }
  }

  async getEventById(eventId) {
    const query = `
      SELECT 
        e.*,
        c.name as category_name,
        o.name as organization_name,
        o.contact_email,
        o.contact_phone,
        o.address as organization_address
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.id = ? AND e.is_active = TRUE
    `;
    
    try {
      const [rows] = await db.execute(query, [eventId]);
      if (rows.length > 0) {
        const event = rows[0];
        const imageNumber = (event.id % 7) || 1; 
        return {
          ...event,
          image_url: `/images/events/${imageNumber}.jpg`
        };
      }
      return null;
    } catch (error) {
      throw new Error(`Error fetching event ${eventId}: ${error.message}`);
    }
  }

  async getAllCategories() {
    const query = `
      SELECT * FROM categories 
      ORDER BY name ASC
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }
  
  async getFeaturedEvents(limit = 6) {
    const query = `
      SELECT 
        e.*,
        c.name as category_name,
        o.name as organization_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.date >= CURDATE() AND e.is_active = TRUE
      ORDER BY e.date ASC, e.goal_amount DESC
      LIMIT ?
    `;
    
    try {
      const [rows] = await db.execute(query, [limit]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching featured events: ${error.message}`);
    }
  }

  // 🔥 新增的注册相关数据库方法 🔥

  async createRegistration(registrationData) {
    const query = `
      INSERT INTO registrations 
      (event_id, user_name, email, phone, tickets_purchased, registration_date, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      registrationData.event_id,
      registrationData.user_name,
      registrationData.email,
      registrationData.phone,
      registrationData.tickets_purchased,
      registrationData.registration_date,
      registrationData.comments
    ];
    
    try {
      const [result] = await db.execute(query, params);
      console.log('Registration created with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating registration: ${error.message}`);
    }
  }

  async getRegistrationsByEventId(eventId) {
    const query = `
      SELECT * FROM registrations 
      WHERE event_id = ? 
      ORDER BY registration_date DESC, created_at DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [eventId]);
      console.log(`Found ${rows.length} registrations for event ${eventId}`);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching registrations for event ${eventId}: ${error.message}`);
    }
  }
}

module.exports = new EventModel();