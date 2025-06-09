import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/mysql-schema";

// This file provides an alternative MySQL database configuration
// By default, the application uses Neon Serverless PostgreSQL (see db.ts)
// This MySQL configuration is provided as an alternative option

// Check for required environment variables (only when actually using MySQL)
const checkEnvironmentVariables = () => {
  if (!process.env.MYSQL_DATABASE_URL && !process.env.DATABASE_URL &&
      !process.env.DB_HOST && !process.env.DB_USER && !process.env.DB_PASSWORD) {
    throw new Error(
      "MYSQL_DATABASE_URL or DATABASE_URL or MySQL config (DB_HOST, DB_USER, DB_PASSWORD) must be set. Did you forget to provision a database?",
    );
  }
};

// MySQL connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'glowctf_user',
  password: process.env.DB_PASSWORD || 'Maruf078692',
  database: process.env.DB_NAME || 'glowctf',
  port: parseInt(process.env.DB_PORT || '3306'),
  // Connection pool settings
  connectionLimit: 5, // Reduced from 10
  acquireTimeout: 30000, // Reduced from 60000
  timeout: 30000, // Reduced from 60000
  // Remove invalid options for mysql2
  // reconnect: true,
  // idleTimeout: 300000,
  // maxIdle: 5,
  // keepAliveInitialDelay: 0,
  // enableKeepAlive: true,
};

// Create a MySQL connection pool (singleton)
let pool: mysql.Pool | null = null;

const getPool = () => {
  if (!pool) {
    checkEnvironmentVariables();
    pool = mysql.createPool(poolConfig);

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('MySQL pool error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // Reconnect on connection lost
        pool = mysql.createPool(poolConfig);
      }
    });
  }
  return pool;
};

// Create a MySQL connection from pool
export const createConnection = async () => {
  checkEnvironmentVariables();
  const pool = getPool();
  return await pool.getConnection();
};

// Initialize Drizzle ORM with the MySQL connection pool
let db: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (!db) {
    const pool = getPool();
    db = drizzle(pool, { schema, mode: 'default' });
  }
  return db;
};

// Graceful shutdown
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
};