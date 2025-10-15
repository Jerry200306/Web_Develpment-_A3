const db = require('./config/database');


async function testConnection() {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS solution');
    console.log('✅ Database connection test passed:', rows[0].solution === 2);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  db,
  testConnection
};