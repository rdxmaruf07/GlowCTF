# Database SSL Configuration

This document explains how SSL is configured for database connections in this project.

## PostgreSQL SSL Configuration

When connecting to PostgreSQL databases, SSL is used by default for security. The project has been configured to handle SSL connections properly, with options for both production and development environments.

### SSL Configuration in drizzle.config.ts

The `drizzle.config.ts` file has been updated to include SSL configuration for PostgreSQL connections:

```typescript
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
```

### SSL Configuration in server/db.ts

The main database connection pool in `server/db.ts` has also been updated with SSL configuration:

```typescript
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // ... other options ...
  // SSL configuration
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certificates for development
  },
};
```

### SSL Configuration in Test Scripts

The database connection test scripts have been updated to use the same SSL configuration:

- `server/scripts/test-pg-connection.js`
- `server/scripts/test-db-connection.js`

## Production Considerations

For production environments, you should consider the following:

1. **SSL Certificate Verification**: In production, you should set `rejectUnauthorized: true` to ensure that only valid, trusted SSL certificates are accepted.

2. **Custom CA Certificates**: If you're using a custom Certificate Authority (CA), you can provide the CA certificate:

```typescript
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('/path/to/ca/certificate').toString(),
}
```

3. **Environment-Specific Configuration**: You can use environment variables to control SSL settings:

```typescript
ssl: {
  rejectUnauthorized: process.env.NODE_ENV === 'production',
}
```

## Troubleshooting SSL Connections

If you encounter SSL connection issues:

1. **Test the connection**: Use the provided test scripts to verify your connection:
   ```
   npm run test:db-connection
   ```

2. **Check SSL requirements**: Some database providers require SSL connections. Check your provider's documentation.

3. **Verify connection string**: Ensure your connection string is correct and includes any required SSL parameters.

4. **Check certificates**: If using custom certificates, verify they are valid and accessible to the application.

## MySQL SSL Configuration

MySQL connections can also use SSL. If you need to configure SSL for MySQL connections, you can modify the MySQL connection creation in `server/mysql-db.ts` to include SSL options:

```typescript
const connection = await mysql.createConnection({
  uri: dbUrl,
  ssl: {
    // MySQL SSL options
  }
});
```

## References

- [Node.js PostgreSQL SSL Documentation](https://node-postgres.com/features/ssl)
- [MySQL SSL Connection Documentation](https://www.npmjs.com/package/mysql2#ssl-options)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)