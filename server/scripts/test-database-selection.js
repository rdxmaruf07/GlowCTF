/**
 * Test script to verify database selection logic
 * Run with: node --loader tsx server/scripts/test-database-selection.js
 */

import dotenv from 'dotenv';
import { checkConnection, useMySQL } from '../database.js';

// Load environment variables
dotenv.config();

async function testDatabaseSelection() {
  console.log('Testing database selection logic...');
  
  // Check which database is being used
  console.log(`Using ${useMySQL ? 'MySQL' : 'PostgreSQL'} database`);
  
  // Check environment variables
  console.log('\nEnvironment variables:');
  console.log(`DB_HOST: ${process.env.DB_HOST || 'not set'}`);
  console.log(`DB_USER: ${process.env.DB_USER || 'not set'}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '****' : 'not set'}`);
  console.log(`DB_NAME: ${process.env.DB_NAME || 'not set'}`);
  console.log(`DB_PORT: ${process.env.DB_PORT || 'not set'}`);
  console.log(`MYSQL_DATABASE_URL: ${process.env.MYSQL_DATABASE_URL || 'not set'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL || 'not set'}`);
  
  try {
    // Test database connection
    console.log('\nTesting database connection...');
    const connected = await checkConnection();
    
    if (connected) {
      console.log('✅ Database connection successful!');
    } else {
      console.error('❌ Database connection failed!');
    }
  } catch (error) {
    console.error('❌ Error testing database connection:', error.message);
  }
}

testDatabaseSelection();