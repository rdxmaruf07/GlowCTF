// Test script to verify database connection for both PostgreSQL and MySQL
import { Pool, neonConfig } from '@neondatabase/serverless';
import mysql from 'mysql2/promise';
import ws from 'ws';

// Configure Neon serverless to use WebSockets
neonConfig.webSocketConstructor = ws;

// Check which database environment variables are available
const hasMysqlUrl = !!process.env.MYSQL_DATABASE_URL;
const hasPostgresUrl = !!process.env.DATABASE_URL;

// If neither database URL is set, show an error
if (!hasMysqlUrl && !hasPostgresUrl) {
  console.error("ERROR: Neither DATABASE_URL nor MYSQL_DATABASE_URL environment variable is set");
  console.error("Please set one of these environment variables to connect to a database");
  console.error("For PostgreSQL: DATABASE_URL=postgresql://username:password@endpoint.neon.tech/database_name");
  console.error("For MySQL: MYSQL_DATABASE_URL=mysql://username:password@localhost:3306/database_name");
  process.exit(1);
}

// Determine which database to test
// Prefer MySQL if MYSQL_DATABASE_URL is set, otherwise use PostgreSQL
const useMySQL = hasMysqlUrl;

async function testPostgresConnection() {
  console.log("Testing PostgreSQL connection...");
  
  try {
    // Create a connection pool with optimized settings for Neon serverless
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      maxUses: 100,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      // SSL configuration
      ssl: {
        rejectUnauthorized: false, // Allow self-signed certificates for development
      },
    });
    
    // Test the connection
    const client = await pool.connect();
    console.log("✅ PostgreSQL connection successful!");
    
    // Run a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`Current database time: ${result.rows[0].current_time}`);
    
    // Test connection latency
    console.log("Testing connection latency...");
    const start = Date.now();
    await client.query('SELECT 1');
    const end = Date.now();
    console.log(`Connection latency: ${end - start}ms`);
    
    // Release the client
    client.release();
    
    // Close the pool
    await pool.end();
    
    console.log("PostgreSQL connection test completed successfully.");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed!");
    console.error("Error details:", error.message);
    return false;
  }
}

async function testMySQLConnection() {
  console.log("Testing MySQL connection...");
  
  try {
    // Get the MySQL connection URL
    const dbUrl = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;
    
    // Create a connection
    const connection = await mysql.createConnection(dbUrl);
    console.log("✅ MySQL connection successful!");
    
    // Run a simple query
    const [rows] = await connection.execute('SELECT NOW() as current_time');
    console.log(`Current database time: ${rows[0].current_time}`);
    
    // Test connection latency
    console.log("Testing connection latency...");
    const start = Date.now();
    await connection.execute('SELECT 1');
    const end = Date.now();
    console.log(`Connection latency: ${end - start}ms`);
    
    // Close the connection
    await connection.end();
    
    console.log("MySQL connection test completed successfully.");
    return true;
  } catch (error) {
    console.error("❌ MySQL connection failed!");
    console.error("Error details:", error.message);
    return false;
  }
}

async function testConnection() {
  if (useMySQL) {
    console.log("Using MySQL database (MYSQL_DATABASE_URL is set)");
    await testMySQLConnection();
  } else {
    console.log("Using PostgreSQL database (DATABASE_URL is set)");
    await testPostgresConnection();
  }
}

testConnection();