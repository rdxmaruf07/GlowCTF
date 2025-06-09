# MySQL Setup Guide for GlowCTF

This guide will help you set up MySQL for the GlowCTF project on your local machine.

## Prerequisites

- MySQL Server (version 5.7 or higher) installed on your machine
- Node.js (v18+)
- npm or yarn package manager

## Step 1: Install MySQL Server

### For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### For macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

### For Windows:
Download and install MySQL from the [official website](https://dev.mysql.com/downloads/installer/).

## Step 2: Create a MySQL Database and User

1. Log in to MySQL as root:
```bash
# For Linux/macOS
sudo mysql -u root

# For Windows (Command Prompt as Administrator)
mysql -u root -p
# Enter your password when prompted
```

2. Create a database and user for the application:
```sql
CREATE DATABASE glowctf;
CREATE USER 'glowctf_user'@'localhost' IDENTIFIED BY 'Maruf078692';
GRANT ALL PRIVILEGES ON glowctf.* TO 'glowctf_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Replace `'your_strong_password'` with a secure password of your choice. Make sure to use the same password in your `.env` file.

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory of the project with the following MySQL-related variables:

```env
# MySQL Configuration
DB_HOST=localhost
DB_USER=glowctf_user
DB_PASSWORD=your_strong_password
DB_NAME=glowctf
DB_PORT=3306

# Alternative format using connection URL
MYSQL_DATABASE_URL=mysql://glowctf_user:your_strong_password@localhost:3306/glowctf
```

## Step 4: Run Database Migrations

The project uses Drizzle ORM for database migrations. To set up your database schema:

```bash
# Generate migrations (if needed)
npx drizzle-kit generate

# Run migrations
npm run db:push
# or alternatively
./mysql-migrate.sh
```

## Step 5: Verify Database Connection

You can verify that your database connection is working correctly by running:

```bash
npm run test:mysql-connection
```

This will:
- Test the connection to your MySQL server
- Display the MySQL version
- List all tables in your database (if any exist)
- Provide troubleshooting guidance if the connection fails

Alternatively, you can use the general database connection test:

```bash
npm run test:db-connection
```

## Troubleshooting

### Connection Issues

If you encounter connection issues, check the following:

1. Ensure MySQL server is running:
```bash
# For Linux
sudo systemctl status mysql

# For macOS
brew services list

# For Windows
services.msc (check MySQL service status)
```

2. Verify your credentials in the `.env` file.

3. Check MySQL user permissions:
```sql
SHOW GRANTS FOR 'glowctf_user'@'localhost';
```

### Migration Issues

If migrations fail:

1. Check the MySQL error logs:
```bash
# For Linux
sudo tail -f /var/log/mysql/error.log

# For macOS
tail -f /usr/local/var/mysql/*.err

# For Windows
Check the MySQL data directory for error logs
```

2. Ensure your MySQL user has sufficient privileges.

3. Try running the migrations manually:
```bash
tsx server/scripts/mysql-migration.ts
```

## Additional Configuration

### Configuring SSL for MySQL (Optional)

For production environments, you may want to enable SSL for your MySQL connection:

1. Update your MySQL configuration to enable SSL.
2. Update your connection string to include SSL parameters:
```
MYSQL_DATABASE_URL=mysql://user:password@host:port/database?ssl=true
```

### Using MySQL in Production

For production environments, consider:

1. Using a managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
2. Implementing proper backup strategies
3. Setting up replication for high availability
4. Configuring connection pooling for better performance

## Switching Between PostgreSQL and MySQL

The application supports both PostgreSQL and MySQL. To switch between them:

- For PostgreSQL: Set the `DATABASE_URL` environment variable and remove `MYSQL_DATABASE_URL`
- For MySQL: Set the `MYSQL_DATABASE_URL` environment variable

The application will automatically detect which database to use based on these environment variables.