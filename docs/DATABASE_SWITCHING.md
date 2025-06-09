# Database Switching Guide for GlowCTF

GlowCTF supports multiple database configurations including local and cloud-hosted MySQL and PostgreSQL databases. This guide explains how to switch between different database configurations easily.

## Available Database Configurations

### 1. Local MySQL (`mysql-local`)
- **Host**: localhost
- **Port**: 3306
- **Database**: glowctf
- **User**: glowctf_user
- **Use Case**: Local development and testing

### 2. Aiven MySQL (`mysql-aiven`)
- **Host**: mysql-1a05c8be-glowctf.l.aivencloud.com
- **Port**: 20393
- **Database**: defaultdb
- **User**: avnadmin
- **Use Case**: Remote MySQL hosting via Aiven cloud service

### 3. Local PostgreSQL (`postgres-local`)
- **Host**: localhost
- **Port**: 5432
- **Database**: glowctf
- **User**: glowctf_user
- **Use Case**: Local development with PostgreSQL

### 4. Aiven PostgreSQL (`postgres-aiven`)
- **Host**: pg-12c2c285-glowctf.l.aivencloud.com
- **Port**: 20393
- **Database**: defaultdb
- **User**: avnadmin
- **Use Case**: Remote PostgreSQL hosting via Aiven cloud service

## Quick Start Commands

### Switch to Specific Database
```bash
# Switch to local MySQL
npm run db:switch:mysql-local

# Switch to Aiven MySQL
npm run db:switch:mysql-aiven

# Switch to local PostgreSQL
npm run db:switch:postgres-local

# Switch to Aiven PostgreSQL
npm run db:switch:postgres-aiven
```

### Interactive Database Switching
```bash
# Launch interactive menu
npm run db:switch
```

### View Current Configuration
```bash
# Show current database configuration
npm run db:config
```

### Test Database Connection
```bash
# Test current database connection
npm run test:db-selection
```

## Detailed Usage

### 1. Interactive Mode (Recommended)
The interactive mode provides a user-friendly menu to switch between databases:

```bash
npm run db:switch
```

This will show:
```
🗄️  GlowCTF Database Configuration Switcher
==========================================

Select a database configuration:

1. Local MySQL
   MySQL running on localhost:3306

2. Aiven MySQL (Remote)
   MySQL hosted on Aiven cloud

3. Local PostgreSQL
   PostgreSQL running on localhost:5432

4. Aiven PostgreSQL (Remote)
   PostgreSQL hosted on Aiven cloud

0. Show current configuration
q. Quit

📊 Current: Local MySQL

Enter your choice:
```

### 2. Direct Command Line Switching
For automation or quick switches, use the direct commands:

```bash
# Examples
npm run db:switch:mysql-local
npm run db:switch:mysql-aiven
npm run db:switch:postgres-local
npm run db:switch:postgres-aiven
```

### 3. Manual Script Execution
You can also run the scripts directly:

```bash
# Interactive mode
node server/scripts/interactive-db-switch.js

# Direct switching
node server/scripts/switch-database.js mysql-local
node server/scripts/switch-database.js mysql-aiven
node server/scripts/switch-database.js postgres-local
node server/scripts/switch-database.js postgres-aiven

# Show current config
node server/scripts/switch-database.js
```

## What Happens During a Switch

1. **Backup Creation**: Your current `.env` file is automatically backed up with a timestamp
2. **Configuration Update**: Database-related environment variables are updated
3. **Preservation**: Non-database environment variables (API keys, etc.) are preserved
4. **Validation**: The script validates the configuration before applying changes

## Environment Variable Management

The switching utility intelligently manages your environment variables:

### Database Variables (Managed)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `MYSQL_DATABASE_URL`
- `DATABASE_URL`

### Non-Database Variables (Preserved)
- `GEMINI_API_KEY`
- `XAI_API_KEY`
- Any other custom environment variables

## Database Priority

GlowCTF automatically chooses the database based on environment variables:

1. **MySQL** (if `MYSQL_DATABASE_URL` or MySQL config variables are set)
2. **PostgreSQL** (if `DATABASE_URL` is set)

## Testing Your Configuration

After switching databases, always test the connection:

```bash
npm run test:db-selection
```

This will:
- Detect which database configuration is active
- Test the connection
- Report any issues

## Backup and Recovery

### Automatic Backups
Every time you switch databases, the current `.env` file is automatically backed up to:
```
.env.backup.YYYY-MM-DDTHH-MM-SS-sssZ
```

### Manual Restore
To restore a previous configuration:
```bash
cp .env.backup.2024-01-15T10-30-45-123Z .env
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure the database server is running (for local databases)
   - Check firewall settings
   - Verify credentials

2. **Authentication Failed**
   - Update passwords in the configuration
   - Check user permissions

3. **Database Not Found**
   - Create the database if it doesn't exist
   - Verify database name spelling

### Getting Help

1. **Check Current Configuration**:
   ```bash
   npm run db:config
   ```

2. **Test Connection**:
   ```bash
   npm run test:db-selection
   ```

3. **View Available Options**:
   ```bash
   node server/scripts/switch-database.js
   ```

## Development Workflow

### Typical Development Flow
1. Start with local database for development:
   ```bash
   npm run db:switch:mysql-local
   ```

2. Test with cloud database before deployment:
   ```bash
   npm run db:switch:mysql-aiven
   ```

3. Run migrations and tests:
   ```bash
   npm run db:push
   npm run test:db-selection
   ```

### Team Collaboration
- Each developer can use their preferred local database
- Shared cloud databases for staging/testing
- Easy switching between environments

## Security Notes

- Database credentials are stored in `.env` files
- Never commit `.env` files to version control
- Use environment-specific credentials
- Regularly rotate cloud database passwords
- Keep backup files secure

## Advanced Usage

### Custom Configurations
To add new database configurations, edit `server/scripts/switch-database.js` and add entries to the `configurations` object.

### Integration with CI/CD
Use the direct switching commands in deployment scripts:
```bash
npm run db:switch:postgres-aiven
npm run db:push
npm start
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Test your database connection
3. Review the backup files if needed
4. Consult the main project documentation