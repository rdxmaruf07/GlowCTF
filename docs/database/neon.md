# ⚡ Neon PostgreSQL Setup

Neon is a serverless PostgreSQL platform that's perfect for GlowCTF, offering a generous free tier and excellent performance with automatic scaling.

## 🎯 Why Neon?

- ✅ **Generous free tier** (3GB storage, 100 hours compute)
- ✅ **Serverless PostgreSQL** with automatic scaling
- ✅ **Instant branching** for development/testing
- ✅ **Built-in connection pooling**
- ✅ **Global edge locations**
- ✅ **Zero-downtime migrations**
- ✅ **Automatic backups**

## 📋 Prerequisites

- Email account for Neon registration
- GlowCTF project ready for deployment

## 🚀 Step-by-Step Setup

### **Step 1: Create Neon Account**

1. Go to [neon.tech](https://neon.tech)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended) or email
4. Verify your email if using email signup

### **Step 2: Create Your First Project**

1. In Neon console, click **"Create Project"**
2. Configure your project:
   - **Project Name**: `glowctf-platform`
   - **Database Name**: `glowctf`
   - **PostgreSQL Version**: `15` (latest)
   - **Region**: Choose closest to your users
3. Click **"Create Project"**

### **Step 3: Get Connection Details**

After project creation, you'll see connection details:

```bash
# Connection string format
postgresql://username:password@host/database?sslmode=require

# Example
postgresql://glowctf_user:abc123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/glowctf?sslmode=require
```

### **Step 4: Configure Environment Variables**

Add the connection string to your deployment platform:

```env
# For most platforms
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Alternative format for some platforms
POSTGRES_URL=postgresql://username:password@host/database?sslmode=require
```

### **Step 5: Test Connection**

Test your database connection locally:

```bash
# Install PostgreSQL client (if not already installed)
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Test connection
psql "postgresql://username:password@host/database?sslmode=require"
```

## 🔧 Database Configuration

### **Create Database Schema**

Run your Drizzle migrations:

```bash
# Push schema to Neon
npm run db:push

# Or run migrations
npx drizzle-kit migrate
```

### **Seed Initial Data**

Create and run a seed script:

```typescript
// scripts/seed-neon.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, challenges, categories } from '../shared/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categoryData = [
    { name: 'Web Security', description: 'Web application vulnerabilities' },
    { name: 'Cryptography', description: 'Encryption and decryption challenges' },
    { name: 'Forensics', description: 'Digital forensics and analysis' },
    { name: 'Reverse Engineering', description: 'Binary analysis and reverse engineering' },
    { name: 'Pwn', description: 'Binary exploitation challenges' }
  ];

  await db.insert(categories).values(categoryData);

  // Create sample challenges
  const challengeData = [
    {
      title: 'SQL Injection Basics',
      description: 'Learn the fundamentals of SQL injection',
      category: 'Web Security',
      difficulty: 'easy',
      points: 100,
      flag: 'flag{sql_injection_basics}',
      isActive: true
    },
    // Add more challenges...
  ];

  await db.insert(challenges).values(challengeData);

  console.log('✅ Database seeded successfully!');
  await client.end();
}

seed().catch(console.error);
```

Run the seed script:

```bash
npx tsx scripts/seed-neon.ts
```

## 🌿 Database Branching

### **Create Development Branch**

Neon's branching feature allows you to create isolated database copies:

1. In Neon console, go to **"Branches"**
2. Click **"Create Branch"**
3. Configure:
   - **Branch Name**: `development`
   - **Parent Branch**: `main`
   - **Compute**: Shared (for development)
4. Use the development branch connection string for local development

### **Branch-Specific Environment Variables**

```env
# Production (main branch)
DATABASE_URL=postgresql://user:pass@main-branch-host/db

# Development branch
DATABASE_URL_DEV=postgresql://user:pass@dev-branch-host/db

# Testing branch
DATABASE_URL_TEST=postgresql://user:pass@test-branch-host/db
```

## 📊 Connection Pooling

### **Built-in Pooling**

Neon includes automatic connection pooling, but you can optimize further:

```typescript
// lib/database.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

// Configure connection with pooling
const client = postgres(connectionString, {
  max: 10, // Maximum connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
});

export const db = drizzle(client);
```

### **Connection Pooling for Serverless**

For serverless deployments, use connection pooling:

```typescript
// lib/database-serverless.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use pooled connection for serverless
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for serverless
  max: 1, // Single connection for serverless
});

export const db = drizzle(client);
```

## 🔒 Security Configuration

### **SSL/TLS Configuration**

Neon requires SSL connections by default:

```typescript
// Ensure SSL is enabled
const client = postgres(connectionString, {
  ssl: 'require', // or 'prefer'
});
```

### **IP Allowlist**

Configure IP restrictions in Neon console:

1. Go to **"Settings"** → **"IP Allow"**
2. Add your deployment platform IPs
3. For development, add your local IP

### **Database Roles and Permissions**

Create specific roles for different environments:

```sql
-- Create read-only role for analytics
CREATE ROLE analytics_user WITH LOGIN PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create application role with limited permissions
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

## 📈 Performance Optimization

### **Indexing Strategy**

Create indexes for common queries:

```sql
-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Challenge indexes
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_active ON challenges(is_active);

-- Leaderboard indexes
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_challenge_id ON submissions(challenge_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);

-- Composite indexes for complex queries
CREATE INDEX idx_challenges_category_difficulty ON challenges(category, difficulty);
CREATE INDEX idx_submissions_user_challenge ON submissions(user_id, challenge_id);
```

### **Query Optimization**

Use Drizzle's query builder for optimized queries:

```typescript
// Efficient leaderboard query
const leaderboard = await db
  .select({
    userId: users.id,
    username: users.username,
    totalPoints: sql<number>`sum(${challenges.points})`.as('total_points'),
    solvedCount: sql<number>`count(*)`.as('solved_count')
  })
  .from(submissions)
  .innerJoin(users, eq(submissions.userId, users.id))
  .innerJoin(challenges, eq(submissions.challengeId, challenges.id))
  .where(eq(submissions.isCorrect, true))
  .groupBy(users.id, users.username)
  .orderBy(desc(sql`sum(${challenges.points})`))
  .limit(100);
```

## 📊 Monitoring and Analytics

### **Built-in Monitoring**

Neon provides comprehensive monitoring:

1. **Metrics Dashboard**: CPU, memory, connections
2. **Query Performance**: Slow query analysis
3. **Connection Analytics**: Connection patterns
4. **Storage Usage**: Database size tracking

### **Custom Monitoring**

Add application-level monitoring:

```typescript
// middleware/database-monitor.ts
import { performance } from 'perf_hooks';

export const databaseMonitor = async (query: () => Promise<any>) => {
  const start = performance.now();
  
  try {
    const result = await query();
    const duration = performance.now() - start;
    
    console.log(`Database query completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`Database query failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};
```

## 💰 Pricing

### **Free Tier**
- **3GB** storage
- **100 hours** compute per month
- **1** project
- **10** branches
- **Community support**

### **Launch Plan ($19/month)**
- **10GB** storage
- **300 hours** compute
- **Unlimited** projects
- **Unlimited** branches
- **Email support**

### **Scale Plan ($69/month)**
- **50GB** storage
- **750 hours** compute
- **Priority support**
- **Advanced monitoring**

## 🚨 Troubleshooting

### **Common Issues**

1. **Connection Timeout**
   ```typescript
   // Increase connection timeout
   const client = postgres(connectionString, {
     connect_timeout: 30,
     idle_timeout: 30,
   });
   ```

2. **SSL Certificate Issues**
   ```typescript
   // For development, you might need to disable SSL verification
   const client = postgres(connectionString, {
     ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
   });
   ```

3. **Connection Pool Exhaustion**
   ```typescript
   // Properly close connections
   process.on('SIGINT', async () => {
     await client.end();
     process.exit(0);
   });
   ```

4. **Migration Issues**
   ```bash
   # Reset migrations if needed
   npx drizzle-kit drop
   npx drizzle-kit push
   ```

### **Debug Mode**

Enable debug logging:

```typescript
const client = postgres(connectionString, {
  debug: process.env.NODE_ENV === 'development',
});
```

## 🔗 Useful Links

- [Neon Documentation](https://neon.tech/docs)
- [Neon Console](https://console.neon.tech)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [Neon Community Discord](https://discord.gg/neon)

## ✅ Setup Checklist

- [ ] Neon account created
- [ ] Project created with appropriate region
- [ ] Connection string obtained
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Initial data seeded
- [ ] Connection tested locally
- [ ] SSL/TLS verified
- [ ] Indexes created for performance
- [ ] Monitoring configured
- [ ] Backup strategy confirmed

---

**Your Neon PostgreSQL database is ready for GlowCTF! ⚡**

Next steps:
- [Deploy your application](../deployment/)
- [Set up AI providers](../ai-providers/)
- [Configure monitoring](../configuration/monitoring.md)