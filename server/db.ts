import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pooling for Supabase PostgreSQL
// const poolConfig = {
//   connectionString: process.env.DATABASE_URL,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 5000,
//   ssl: {
//     rejectUnauthorized: false // Allow self-signed certificates for development
//   }
// };

// Create a connection pool
export const pool = new Pool(poolConfig);

// Connection management
let connectedPool = false;
pool.on('connect', () => {
  connectedPool = true;
  console.log('Connected to PostgreSQL');
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
      console.log('Reconnected to PostgreSQL');
    } catch (err) {
      console.error('Failed to reconnect to PostgreSQL', err);
      throw err;
    }
  }
  return connectedPool;
};

// Initialize Drizzle ORM with the PostgreSQL schema
export const db = drizzle(pool, { schema });

// Graceful shutdown
const closePool = async () => {
  try {
    console.log('Closing PostgreSQL connection pool');
    await pool.end();
  } catch (err) {
    console.error('Error closing PostgreSQL connection pool', err);
  }
};

process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);