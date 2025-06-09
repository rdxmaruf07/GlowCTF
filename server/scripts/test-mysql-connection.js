/**
 * Simple script to test MySQL database connection
 * Run with: node --loader tsx server/scripts/test-mysql-connection.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMySQLConnection() {
  console.log('Testing MySQL connection...');
  
  // Check if MySQL configuration is available
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'glowctf';
  const port = parseInt(process.env.DB_PORT || '3306');
  
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
      
      // Get MySQL version
      const [versionRows] = await connection.execute('SELECT VERSION() as version');
      if (versionRows && versionRows.length > 0) {
        console.log(`MySQL Version: ${versionRows[0].version}`);
      }
      
      // Check if tables exist
      const [tables] = await connection.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [database]);
      
      if (tables && tables.length > 0) {
        console.log(`\nDatabase '${database}' contains ${tables.length} tables:`);
        tables.forEach((table, index) => {
          console.log(`${index + 1}. ${table.TABLE_NAME || table.table_name}`);
        });
      } else {
        console.log(`\nDatabase '${database}' exists but contains no tables.`);
        console.log('You may need to run migrations: npm run db:push or ./mysql-migrate.sh');
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