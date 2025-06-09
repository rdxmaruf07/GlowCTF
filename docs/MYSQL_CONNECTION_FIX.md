# MySQL Connection Fix

This document provides instructions on how to fix the MySQL connection issue that occurs when running `npm run db:push` or other database-related commands.

## The Issue

The error message you might encounter:

```
Error: Access denied for user 'glowctf_user'@'localhost' (using password: YES)
```

This happens when the MySQL user credentials in your `.env` file don't match the credentials used when creating the MySQL user.

## Solution

1. Create a `.env` file in the root directory of the project with the correct MySQL credentials:

```env
# MySQL Configuration
DB_HOST=localhost
DB_USER=glowctf_user
DB_PASSWORD=your_strong_password  # Must match the password used when creating the MySQL user
DB_NAME=glowctf
DB_PORT=3306
# Alternative MySQL connection string format
MYSQL_DATABASE_URL=mysql://glowctf_user:your_strong_password@localhost:3306/glowctf

# Other environment variables
SESSION_SECRET=change_this_to_a_random_string
NODE_ENV=development
```

2. Make sure the `DB_PASSWORD` value matches the password you used when creating the MySQL user with:

```sql
CREATE USER 'glowctf_user'@'localhost' IDENTIFIED BY 'your_strong_password';
```

3. If you haven't created the MySQL user yet, follow the instructions in `docs/MYSQL_SETUP.md`.

## Verifying the Fix

You can verify that your MySQL connection is working correctly by running:

```bash
node --loader tsx server/scripts/test-mysql-connection.js
```

Or use the test script created specifically for this issue:

```bash
node --loader tsx test-mysql-fix.js
```

## Common Issues

1. **MySQL server not running**: Make sure your MySQL server is running.

2. **Incorrect credentials**: Double-check your MySQL user credentials.

3. **Database doesn't exist**: Make sure the `glowctf` database exists.

4. **Insufficient privileges**: Make sure your MySQL user has the necessary privileges.

5. **Environment variables not loaded**: Make sure your `.env` file is in the root directory and is being loaded correctly.

## Additional Resources

- [MySQL Setup Guide](./MYSQL_SETUP.md)
- [MySQL Documentation](https://dev.mysql.com/doc/)