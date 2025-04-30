import { defineConfig } from "drizzle-kit";

// Check which database environment variables are available
const hasMysqlUrl = !!process.env.MYSQL_DATABASE_URL;
const hasPostgresUrl = !!process.env.DATABASE_URL;

// If neither database URL is set, throw an error with clear instructions
if (!hasMysqlUrl && !hasPostgresUrl) {
  throw new Error(
    "Neither DATABASE_URL nor MYSQL_DATABASE_URL is set. Please set one of these environment variables to connect to a database."
  );
}

// Determine which database to use
// Prefer MySQL if MYSQL_DATABASE_URL is set, otherwise use PostgreSQL
const useMySQL = hasMysqlUrl;

// Configure Drizzle based on the selected database type
export default defineConfig({
  out: "./migrations",
  // Use the appropriate schema file based on database type
  schema: useMySQL ? "./shared/mysql-schema.ts" : "./shared/schema.ts",
  // Set the dialect based on database type
  dialect: useMySQL ? "mysql2" : "postgresql",
  // Set the database credentials
  dbCredentials: useMySQL 
    ? { url: process.env.MYSQL_DATABASE_URL }
    : { 
        url: process.env.DATABASE_URL,
        // Configure SSL options for PostgreSQL
        ssl: {
          // For development, you can set rejectUnauthorized to false
          // This allows connections to servers with self-signed certificates
          rejectUnauthorized: false,
        },
      },
});
