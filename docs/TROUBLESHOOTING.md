# Troubleshooting Guide

## Database Connection Issues

### Error: There was an error establishing an SSL connection

**Error Message:**
```
Error: There was an error establishing an SSL connection
    at /path/to/node_modules/pg-pool/index.js:45:11
```

**Cause:**
This error occurs when the PostgreSQL client is unable to establish a secure SSL connection to the database server. This can happen due to:
1. Missing SSL configuration
2. Invalid SSL certificates
3. Self-signed certificates that are not trusted

**Solution:**
1. Update your drizzle.config.ts to include SSL configuration:
   ```typescript
   dbCredentials: {
     url: process.env.DATABASE_URL,
     ssl: {
       rejectUnauthorized: false, // For development only
     },
   },
   ```

2. For production environments, use proper SSL certificates and set `rejectUnauthorized: true`.

3. For more details, see the [Database SSL Configuration Guide](./DATABASE_SSL_CONFIG.md).

4. Run the connection test to verify PostgreSQL connectivity:
   ```bash
   npm run test:pg-connection
   ```

### Error: Cannot read properties of undefined (reading 'handleEmptyQuery')

**Error Message:**
```
TypeError: Cannot read properties of undefined (reading 'handleEmptyQuery')
    at Client._handleEmptyQuery (/path/to/node_modules/pg/lib/client.js:376:22)
```

**Cause:**
This error occurs when running `npm run db:push` with drizzle-kit when the PostgreSQL client dependency (`pg`) is missing from your project.

**Solution:**
1. Install the PostgreSQL client dependency:
   ```bash
   npm install pg
   ```

2. Verify your database connection string is correct in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

3. Run the connection test to verify PostgreSQL connectivity:
   ```bash
   npm run test:pg-connection
   ```

4. Try running the drizzle-kit push command again:
   ```bash
   npm run db:push
   ```

### Using MySQL Instead of PostgreSQL

If you prefer to use MySQL instead of PostgreSQL, follow these steps:

1. Update your drizzle.config.ts file to use MySQL:
   ```typescript
   import { defineConfig } from "drizzle-kit";

   if (!process.env.MYSQL_DATABASE_URL && !process.env.DATABASE_URL) {
     throw new Error("MYSQL_DATABASE_URL or DATABASE_URL must be set");
   }

   const dbUrl = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;

   export default defineConfig({
     out: "./migrations",
     schema: "./shared/mysql-schema.ts",
     dialect: "mysql2",
     dbCredentials: {
       url: dbUrl,
     },
   });
   ```

2. Set the MYSQL_DATABASE_URL environment variable in your `.env` file:
   ```
   MYSQL_DATABASE_URL=mysql://username:password@localhost:3306/database_name
   ```

3. Follow the steps in [DATABASE_CONFIG.md](./DATABASE_CONFIG.md) to switch to MySQL.

## Other Common Issues

### Missing Environment Variables

**Error Message:**
```
Error: DATABASE_URL, ensure the database is provisioned
```

**Solution:**
Make sure you have set up your `.env` file with the required environment variables as described in the README.md.

### Database Not Running

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Make sure your PostgreSQL server is running
2. Verify the connection details in your DATABASE_URL are correct
3. Check if the database exists and is accessible

### Permission Issues

**Error Message:**
```
Error: permission denied for database "database_name"
```

**Solution:**
1. Make sure the user specified in your DATABASE_URL has the necessary permissions
2. Try connecting to the database using a command-line client to verify credentials