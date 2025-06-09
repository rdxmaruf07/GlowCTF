import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import * as pgSchema from "@shared/schema";
import * as mysqlSchema from "@shared/mysql-schema";

// Check which database environment variables are available
const hasMysqlUrl = !!process.env.MYSQL_DATABASE_URL;
const hasMysqlConfig = !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD);
const hasPostgresUrl = !!process.env.DATABASE_URL;

// Determine which database to use
// Prefer MySQL if MYSQL_DATABASE_URL or MySQL config is set, otherwise use PostgreSQL
export const useMySQL = hasMysqlUrl || hasMysqlConfig;

// Database connection variables
let pgPool;
let mysqlConnection;
let db;
let connectedPool = false;

// PostgreSQL connection setup
if (!useMySQL && hasPostgresUrl) {
  // Configure connection pooling for PostgreSQL
  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false // Allow self-signed certificates for development
    }
  };

  // Create a connection pool
  pgPool = new Pool(poolConfig);

  // Connection management
  pgPool.on('connect', () => {
    connectedPool = true;
    console.log('Connected to PostgreSQL');
  });

  pgPool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    connectedPool = false;
  });

  // Initialize Drizzle ORM with the PostgreSQL schema
  db = drizzlePg(pgPool, { schema: pgSchema });
}

// MySQL connection setup
if (useMySQL) {
  // MySQL connection configuration
  const dbConfig = hasMysqlUrl 
    ? process.env.MYSQL_DATABASE_URL 
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'glowctf_user',
        password: process.env.DB_PASSWORD || 'Maruf078692',
        database: process.env.DB_NAME || 'glowctf',
        port: parseInt(process.env.DB_PORT || '3306')
      };

  console.log('Using MySQL database configuration');
}

// Implement connection health check
export const checkConnection = async () => {
  if (useMySQL) {
    try {
      // MySQL connection configuration
      const dbConfig = hasMysqlUrl 
        ? process.env.MYSQL_DATABASE_URL 
        : {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'glowctf_user',
            password: process.env.DB_PASSWORD || 'Maruf078692',
            database: process.env.DB_NAME || 'glowctf',
            port: parseInt(process.env.DB_PORT || '3306')
          };

      // Create a MySQL connection
      mysqlConnection = await mysql.createConnection(dbConfig);
      
      // Test the connection
      await mysqlConnection.execute('SELECT 1');
      
      // Initialize Drizzle ORM with the MySQL schema if not already initialized
      if (!db) {
        db = drizzleMysql(mysqlConnection, { schema: mysqlSchema, mode: 'default' });
      }
      
      console.log('Connected to MySQL');
      return true;
    } catch (err) {
      console.error('Failed to connect to MySQL', err);
      throw err;
    }
  } else if (pgPool) {
    if (!connectedPool) {
      try {
        const client = await pgPool.connect();
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
  } else {
    throw new Error('No database configuration available');
  }
};

// Export the database instance
export { db };

// Graceful shutdown
const closeConnections = async () => {
  try {
    if (pgPool) {
      console.log('Closing PostgreSQL connection pool');
      await pgPool.end();
    }
    if (mysqlConnection) {
      console.log('Closing MySQL connection');
      await mysqlConnection.end();
    }
  } catch (err) {
    console.error('Error closing database connections', err);
  }
};

process.on('SIGINT', closeConnections);
process.on('SIGTERM', closeConnections);