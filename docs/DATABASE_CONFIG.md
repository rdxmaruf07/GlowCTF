# GlowCTF Arena - Database Configuration Guide

## Overview

GlowCTF Arena is designed to work with multiple database backends:

1. **PostgreSQL (Neon Serverless)** - Primary database configuration
2. **MySQL** - Alternative database configuration

This document explains how the database configuration works and how to switch between database providers if needed.

## Current Configuration

The project is currently configured to use **Neon Serverless PostgreSQL** as the primary database. This is the recommended configuration and should not be changed unless necessary.

## Neon Serverless PostgreSQL Optimizations

The application has been optimized for Neon Serverless PostgreSQL with the following features:

1. **Connection Pooling**: Optimized connection pool settings for serverless environments:
   - Maximum connections: 10
   - Connection timeout: 5 seconds
   - Idle timeout: 30 seconds
   - Maximum connection uses: 100
   - Keep-alive enabled with 10-second initial delay

2. **Connection Management**:
   - Connection reuse across serverless function invocations
   - Automatic connection health checks
   - Graceful connection handling with proper error management
   - Connection event monitoring

3. **Session Store Optimization**:
   - Optimized PostgreSQL session store configuration
   - Efficient session pruning (every 15 minutes)
   - Custom error logging for session-related issues

4. **Query Optimization**:
   - Optimized complex queries using JOINs instead of multiple queries
   - Efficient use of Common Table Expressions (CTEs) for complex data retrieval
   - Proper use of indexes and query planning

5. **Graceful Shutdown**:
   - Proper connection pool cleanup on application termination
   - Signal handling for SIGINT and SIGTERM

## Database Connection Files

The project includes separate files for each database type:

- **PostgreSQL**: 
  - `server/db.ts` - Connection setup for Neon Serverless PostgreSQL
  - `shared/schema.ts` - Database schema for PostgreSQL
  - `server/storage.ts` - Storage implementation for PostgreSQL

- **MySQL**:
  - `server/mysql-db.ts` - Connection setup for MySQL
  - `shared/mysql-schema.ts` - Database schema for MySQL
  - `server/mysql-storage.ts` - Storage implementation for MySQL

## Environment Variables

The following environment variables are used for database configuration:

- `DATABASE_URL` - Connection string for PostgreSQL (Neon Serverless)
- `MYSQL_DATABASE_URL` - Connection string for MySQL

The application will automatically detect which database to use based on these environment variables:
- If `MYSQL_DATABASE_URL` is set, MySQL will be used
- If only `DATABASE_URL` is set, PostgreSQL will be used
- If neither is set, an error will be thrown

### Neon Serverless PostgreSQL Connection String Format

For Neon Serverless PostgreSQL, the connection string should be in the following format:

```
postgresql://username:password@endpoint.neon.tech/database_name
```

## How to Switch Database Providers

> **Note**: The project is designed to work with Neon Serverless PostgreSQL by default. Switching to MySQL is not recommended unless you have specific requirements.

If you need to switch to MySQL, follow these steps:

1. Modify `server/routes.ts` to import the MySQL storage implementation:

```typescript
// Change this line:
import { storage } from "./storage";

// To this:
import { storage } from "./mysql-storage";
```

2. Set the `MYSQL_DATABASE_URL` environment variable in your `.env` file:

```
MYSQL_DATABASE_URL=mysql://username:password@localhost:3306/glowctf
```

3. Run the MySQL migration script to set up the database schema:

```bash
./mysql-migrate.sh
```

## Database Schema

The database schema is defined in:

- `shared/schema.ts` for PostgreSQL
- `shared/mysql-schema.ts` for MySQL

Both schema files define the same tables and relationships, but use different syntax for their respective database types.

## Storage Interface

The storage interface is implemented in:

- `server/storage.ts` for PostgreSQL
- `server/mysql-storage.ts` for MySQL

Both implementations provide the same API, allowing the application to work with either database backend.

## Session Storage

The application uses different session storage mechanisms depending on the database:

- PostgreSQL: Uses `connect-pg-simple` for session storage in the PostgreSQL database
- MySQL: Uses in-memory session storage via `memorystore`

## Testing Database Connection

To test the database connection, you can use one of the following scripts:

1. To test the connection to the currently configured database (PostgreSQL or MySQL):

```bash
npm run test:db-connection
```

This script will:
1. Detect which database is configured based on environment variables
2. Verify the connection to the database
3. Run a simple query to check functionality
4. Test connection latency
5. Report any errors if the connection fails

2. To specifically test the connection to Neon Serverless PostgreSQL:

```bash
npm run test:pg-connection
```

You can also use the alias:

```bash
npm run db:health
```

## Troubleshooting

### Connection Issues

If you encounter database connection issues:

1. Check that the `DATABASE_URL` environment variable is correctly set
2. Verify that the database server is running and accessible
3. Check for any network restrictions that might prevent connections
4. Ensure the required database client packages are installed:
   - For PostgreSQL: Make sure `pg` and `@neondatabase/serverless` packages are installed
   - For MySQL: Make sure `mysql2` package is installed

### Schema Issues

If you encounter schema-related errors:

1. Run the appropriate migration script to update the database schema
2. Check the console for specific error messages that might indicate the issue

### Neon Serverless PostgreSQL Specific Issues

If you encounter issues specific to Neon Serverless PostgreSQL:

1. Verify that your connection string is in the correct format
2. Check that your Neon project is active and the database is running
3. Ensure that your IP address is allowed in Neon's network access settings
4. Check that the WebSocket connection is working properly (required for Neon serverless)