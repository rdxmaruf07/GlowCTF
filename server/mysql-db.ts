import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/mysql-schema";

// This file provides an alternative MySQL database configuration
// By default, the application uses Neon Serverless PostgreSQL (see db.ts)
// This MySQL configuration is provided as an alternative option

// Check for required environment variables
if (!process.env.MYSQL_DATABASE_URL && !process.env.DATABASE_URL) {
  throw new Error(
    "MYSQL_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use MYSQL_DATABASE_URL if available, otherwise try DATABASE_URL
const dbUrl = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;

// Create a MySQL connection
export const createConnection = async () => {
  const connection = await mysql.createConnection(dbUrl);
  return connection;
};

// Initialize Drizzle ORM with the MySQL schema
export const getDb = async () => {
  const connection = await createConnection();
  return drizzle(connection, { schema });
};