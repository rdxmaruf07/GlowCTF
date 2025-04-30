import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon serverless to use WebSockets
neonConfig.webSocketConstructor = ws;

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimize connection pooling for Neon Serverless PostgreSQL
// These settings are optimized for serverless environments
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a connection can be idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection
  maxUses: 100, // How many times a connection can be used before being closed
  // Neon-specific optimizations
  keepAlive: true, // Keep connections alive
  keepAliveInitialDelayMillis: 10000, // Initial delay before sending keep-alive packets
  // SSL configuration
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certificates for development
  },
};

// Create a connection pool to the Neon Serverless PostgreSQL database
// This is the primary database configuration used by the application
export const pool = new Pool(poolConfig);

// Connection management for serverless environments
// This helps with connection reuse across function invocations
let connectedPool = false;
pool.on('connect', () => {
  connectedPool = true;
  console.log('Connected to Neon Serverless PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  connectedPool = false;
});

// Implement connection health check
export const checkConnection = async () => {
  if (!connectedPool) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      connectedPool = true;
      console.log('Reconnected to Neon Serverless PostgreSQL');
    } catch (err) {
      console.error('Failed to reconnect to Neon Serverless PostgreSQL', err);
      throw err;
    }
  }
  return connectedPool;
};

// Initialize Drizzle ORM with the PostgreSQL schema
export const db = drizzle({ client: pool, schema });

// Graceful shutdown function to close pool when the application terminates
const closePool = async () => {
  try {
    console.log('Closing Neon Serverless PostgreSQL connection pool');
    await pool.end();
  } catch (err) {
    console.error('Error closing Neon Serverless PostgreSQL connection pool', err);
  }
};

// Register shutdown handlers
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);
