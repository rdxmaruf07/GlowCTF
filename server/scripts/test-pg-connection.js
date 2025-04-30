// Test script to verify Neon Serverless PostgreSQL connection
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon serverless to use WebSockets
neonConfig.webSocketConstructor = ws;

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  console.error("Please set DATABASE_URL to a valid Neon Serverless PostgreSQL connection string");
  console.error("Example: postgresql://username:password@endpoint.neon.tech/database_name");
  process.exit(1);
}

async function testConnection() {
  console.log("Testing Neon Serverless PostgreSQL connection...");
  
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
    console.log("✅ Connection successful!");
    
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
    
    console.log("Connection test completed successfully.");
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

testConnection();