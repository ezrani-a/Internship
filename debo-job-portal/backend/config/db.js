// backend/config/db.js
const mysql = require('mysql2');

console.log("✅ Database connection initialized for user:", process.env.DB_USER);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Simple connection test
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connection verified');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

testConnection();

module.exports = promisePool;