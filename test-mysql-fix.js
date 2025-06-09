/**
 * Simple script to test if our MySQL connection fix works
 * Run with: node --loader tsx test-mysql-fix.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function testMySQLConnection() {
  console.log('Testing MySQL connection with the new .env configuration...');
  
  // Get MySQL configuration from environment variables
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'glowctf';
  const port = parseInt(process.env.DB_PORT || '3306');
  
  console.log(`Connection details:
  - Host: ${host}
  - User: ${user}
  - Database: ${database}
  - Port: ${port}
  - Password: ${password ? '[REDACTED]' : '[NOT SET]'}
  `);
  
  if (!password) {
    console.error('❌ Error: DB_PASSWORD environment variable is not set');
    console.log('Please check your .env file and make sure DB_PASSWORD is set');
    process.exit(1);
  }
  
  // Connection configuration
  const config = {
    host,
    user,
    password,
    database,
    port
  };
  
  try {
    console.log(`Attempting to connect to MySQL at ${host}:${port}...`);
    
    // Create connection
    const connection = await mysql.createConnection(config);
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    
    if (rows && rows.length > 0 && rows[0].test === 1) {
      console.log('✅ MySQL connection successful!');
      console.log('The fix has been applied correctly.');
      
      // Get MySQL version
      const [versionRows] = await connection.execute('SELECT VERSION() as version');
      if (versionRows && versionRows.length > 0) {
        console.log(`MySQL Version: ${versionRows[0].version}`);
      }
    } else {
      console.error('❌ Connection test failed');
    }
    
    // Close connection
    await connection.end();
    
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Check if MySQL server is running');
    console.log('2. Verify your database credentials in .env file');
    console.log('3. Make sure the database exists');
    console.log('4. Check if your MySQL user has sufficient privileges');
    process.exit(1);
  }
}

testMySQLConnection();