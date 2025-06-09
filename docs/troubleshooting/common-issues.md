# 🚨 Common Issues and Solutions

This guide covers the most common issues you might encounter when deploying and running GlowCTF, along with step-by-step solutions.

## 🔍 Quick Diagnosis

### **Health Check**

First, check if your application is running:

```bash
# Check if the application is responding
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "config": {
    "database": true,
    "session": true,
    "ai": {
      "gemini": true,
      "groq": false,
      "xai": false
    }
  }
}
```

### **Common Error Patterns**

| Error Type | Symptoms | Quick Fix |
|------------|----------|-----------|
| **Database** | 500 errors, connection timeouts | Check DATABASE_URL |
| **Environment** | Missing config errors | Verify environment variables |
| **AI Provider** | Chatbot not working | Check API keys |
| **Build** | Deployment fails | Check Node.js version |
| **CORS** | Frontend can't reach API | Configure CORS origins |

## 🗄️ Database Issues

### **Connection Errors**

**Symptoms:**
- `Error: connect ECONNREFUSED`
- `Error: password authentication failed`
- `Error: database "glowctf" does not exist`

**Solutions:**

1. **Check Connection String Format**
   ```bash
   # PostgreSQL format
   postgresql://username:password@host:port/database
   
   # MySQL format
   mysql://username:password@host:port/database
   ```

2. **Verify Database Exists**
   ```sql
   -- Connect to PostgreSQL
   psql "postgresql://username:password@host:port/postgres"
   
   -- List databases
   \l
   
   -- Create database if missing
   CREATE DATABASE glowctf;
   ```

3. **Test Connection**
   ```bash
   # Test PostgreSQL connection
   npm run test:pg-connection
   
   # Test MySQL connection
   npm run test:mysql-connection
   ```

4. **Check SSL Requirements**
   ```env
   # For cloud databases, SSL is usually required
   DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
   ```

### **Migration Issues**

**Symptoms:**
- `Error: relation "users" does not exist`
- `Error: column "id" does not exist`

**Solutions:**

1. **Run Migrations**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Or run migrations manually
   npx drizzle-kit migrate
   ```

2. **Reset Database (Development Only)**
   ```bash
   # Drop all tables and recreate
   npx drizzle-kit drop
   npm run db:push
   ```

3. **Check Migration Status**
   ```bash
   # Check what migrations have been applied
   npx drizzle-kit status
   ```

### **Performance Issues**

**Symptoms:**
- Slow query responses
- Database timeouts
- High CPU usage

**Solutions:**

1. **Add Database Indexes**
   ```sql
   -- Common indexes for GlowCTF
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_challenges_category ON challenges(category);
   CREATE INDEX idx_submissions_user_id ON submissions(user_id);
   ```

2. **Optimize Connection Pool**
   ```env
   # Adjust connection pool settings
   DB_POOL_MIN=2
   DB_POOL_MAX=10
   DB_POOL_IDLE_TIMEOUT=30000
   ```

3. **Monitor Query Performance**
   ```typescript
   // Add query logging
   const db = drizzle(client, {
     logger: process.env.NODE_ENV === 'development'
   });
   ```

## 🤖 AI Provider Issues

### **API Key Problems**

**Symptoms:**
- `Error: Invalid API key`
- `Error: Unauthorized`
- Chatbot returns error messages

**Solutions:**

1. **Verify API Key Format**
   ```bash
   # Gemini keys start with "AI"
   echo $GEMINI_API_KEY | grep "^AI"
   
   # Groq keys are typically 56 characters
   echo $GROQ_API_KEY | wc -c
   ```

2. **Test API Keys**
   ```bash
   # Test Gemini API
   npx tsx scripts/test-gemini.ts
   
   # Test Groq API
   npx tsx scripts/test-groq.ts
   ```

3. **Check API Key Permissions**
   - Ensure API key has necessary permissions
   - Verify API key is not restricted by IP
   - Check if API key has expired

### **Rate Limiting**

**Symptoms:**
- `Error: Rate limit exceeded`
- `Error: Quota exceeded`
- Intermittent chatbot failures

**Solutions:**

1. **Implement Rate Limiting**
   ```typescript
   // Add rate limiting middleware
   import rateLimit from 'express-rate-limit';
   
   const aiRateLimit = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 15, // 15 requests per minute
     message: 'Too many AI requests, please try again later.'
   });
   
   app.use('/api/chatbot', aiRateLimit);
   ```

2. **Add Retry Logic**
   ```typescript
   // Retry failed requests
   async function callAIWithRetry(prompt: string, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await callAI(prompt);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   }
   ```

3. **Monitor Usage**
   ```typescript
   // Track API usage
   const usage = {
     requests: 0,
     errors: 0,
     lastReset: Date.now()
   };
   
   // Reset counters every hour
   setInterval(() => {
     usage.requests = 0;
     usage.errors = 0;
     usage.lastReset = Date.now();
   }, 3600000);
   ```

### **Response Quality Issues**

**Symptoms:**
- Poor or irrelevant responses
- Responses too long or too short
- Safety filter blocking responses

**Solutions:**

1. **Improve Prompts**
   ```typescript
   // Better prompt engineering
   const systemPrompt = `
   You are a helpful CTF assistant. Follow these guidelines:
   - Provide hints, not direct answers
   - Be educational and encouraging
   - Keep responses concise but helpful
   - Focus on methodology and learning
   `;
   ```

2. **Adjust Parameters**
   ```typescript
   // Fine-tune AI parameters
   const config = {
     temperature: 0.7,  // Lower for more focused responses
     maxTokens: 500,    // Limit response length
     topP: 0.9,         // Control randomness
   };
   ```

3. **Handle Safety Filters**
   ```typescript
   // Handle blocked content gracefully
   if (response.promptFeedback?.blockReason) {
     return "I can't help with that specific request. Could you rephrase your question?";
   }
   ```

## 🚀 Deployment Issues

### **Build Failures**

**Symptoms:**
- Build process fails
- `Error: Cannot find module`
- TypeScript compilation errors

**Solutions:**

1. **Check Node.js Version**
   ```json
   // package.json
   {
     "engines": {
       "node": ">=18.0.0",
       "npm": ">=8.0.0"
     }
   }
   ```

2. **Clear Cache and Reinstall**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Fix TypeScript Errors**
   ```bash
   # Check TypeScript compilation
   npm run check
   
   # Fix common issues
   npm run build
   ```

4. **Check Build Command**
   ```json
   // package.json
   {
     "scripts": {
       "build": "vite build && npm run build:server",
       "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
     }
   }
   ```

### **Environment Variable Issues**

**Symptoms:**
- `Error: SESSION_SECRET is required`
- `Error: Cannot read property of undefined`
- Configuration not loading

**Solutions:**

1. **Verify Environment Variables**
   ```bash
   # Check if variables are set
   echo $DATABASE_URL
   echo $SESSION_SECRET
   echo $GEMINI_API_KEY
   ```

2. **Platform-Specific Configuration**
   ```bash
   # Vercel
   vercel env ls
   
   # Railway
   railway variables
   
   # Render
   # Check in dashboard under Environment
   ```

3. **Environment Variable Format**
   ```env
   # Ensure no spaces around equals sign
   DATABASE_URL=postgresql://user:pass@host:port/db
   
   # Use quotes for values with special characters
   SESSION_SECRET="your-secret-with-special-chars!"
   ```

### **CORS Issues**

**Symptoms:**
- `Access to fetch blocked by CORS policy`
- Frontend can't reach API
- Preflight request failures

**Solutions:**

1. **Configure CORS Origins**
   ```typescript
   // server/index.ts
   import cors from 'cors';
   
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-domain.com', 'https://www.your-domain.com']
       : ['http://localhost:3000', 'http://localhost:5000'],
     credentials: true
   }));
   ```

2. **Environment-Specific CORS**
   ```env
   # Production
   CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
   
   # Development
   CORS_ORIGINS=http://localhost:3000,http://localhost:5000
   ```

3. **Handle Preflight Requests**
   ```typescript
   // Handle OPTIONS requests
   app.options('*', cors());
   ```

## 🔐 Authentication Issues

### **Session Problems**

**Symptoms:**
- Users logged out unexpectedly
- `Error: Session store unavailable`
- Authentication not persisting

**Solutions:**

1. **Check Session Configuration**
   ```typescript
   // Ensure session secret is set
   app.use(session({
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false,
     cookie: {
       secure: process.env.NODE_ENV === 'production',
       httpOnly: true,
       maxAge: 24 * 60 * 60 * 1000 // 24 hours
     }
   }));
   ```

2. **Session Store Configuration**
   ```typescript
   // Use proper session store for production
   import MemoryStore from 'memorystore';
   
   const store = MemoryStore(session);
   
   app.use(session({
     store: new store({
       checkPeriod: 86400000 // prune expired entries every 24h
     }),
     // ... other options
   }));
   ```

3. **Cookie Settings**
   ```typescript
   // Adjust cookie settings for your domain
   cookie: {
     secure: process.env.NODE_ENV === 'production',
     sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
     domain: process.env.NODE_ENV === 'production' ? '.your-domain.com' : undefined
   }
   ```

### **Password Issues**

**Symptoms:**
- Login failures with correct credentials
- Password reset not working
- Hash comparison errors

**Solutions:**

1. **Check Password Hashing**
   ```typescript
   // Ensure consistent hashing
   import bcrypt from 'bcrypt';
   
   // Hash password
   const hashedPassword = await bcrypt.hash(password, 12);
   
   // Compare password
   const isValid = await bcrypt.compare(password, hashedPassword);
   ```

2. **Password Validation**
   ```typescript
   // Add password strength validation
   const passwordSchema = z.string()
     .min(8, 'Password must be at least 8 characters')
     .regex(/[A-Z]/, 'Password must contain uppercase letter')
     .regex(/[a-z]/, 'Password must contain lowercase letter')
     .regex(/[0-9]/, 'Password must contain number');
   ```

## 🌐 Frontend Issues

### **API Connection Problems**

**Symptoms:**
- `Failed to fetch`
- `Network error`
- API calls timing out

**Solutions:**

1. **Check API Base URL**
   ```typescript
   // lib/api.ts
   const API_BASE_URL = process.env.NODE_ENV === 'production'
     ? 'https://your-domain.com/api'
     : 'http://localhost:5000/api';
   ```

2. **Add Error Handling**
   ```typescript
   // Add proper error handling
   async function apiCall(endpoint: string, options?: RequestInit) {
     try {
       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
         ...options,
         headers: {
           'Content-Type': 'application/json',
           ...options?.headers,
         },
       });
       
       if (!response.ok) {
         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
       }
       
       return await response.json();
     } catch (error) {
       console.error('API call failed:', error);
       throw error;
     }
   }
   ```

3. **Add Timeout Handling**
   ```typescript
   // Add request timeout
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 10000);
   
   try {
     const response = await fetch(url, {
       signal: controller.signal,
       ...options
     });
     clearTimeout(timeoutId);
     return response;
   } catch (error) {
     if (error.name === 'AbortError') {
       throw new Error('Request timed out');
     }
     throw error;
   }
   ```

### **Routing Issues**

**Symptoms:**
- 404 errors on page refresh
- Routes not working in production
- History API issues

**Solutions:**

1. **Configure Server Redirects**
   ```typescript
   // For SPA routing, redirect all routes to index.html
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../dist/index.html'));
   });
   ```

2. **Platform-Specific Redirects**
   ```toml
   # Netlify (_redirects file)
   /*    /index.html   200
   
   # Vercel (vercel.json)
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

## 🔧 Performance Issues

### **Slow Loading**

**Symptoms:**
- Long page load times
- Slow API responses
- High memory usage

**Solutions:**

1. **Optimize Bundle Size**
   ```bash
   # Analyze bundle size
   npm run build
   npx vite-bundle-analyzer dist
   ```

2. **Add Caching**
   ```typescript
   // Add response caching
   app.use('/api', (req, res, next) => {
     res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
     next();
   });
   ```

3. **Database Query Optimization**
   ```typescript
   // Use efficient queries
   const leaderboard = await db
     .select({
       username: users.username,
       score: sql<number>`sum(${challenges.points})`.as('score')
     })
     .from(submissions)
     .innerJoin(users, eq(submissions.userId, users.id))
     .innerJoin(challenges, eq(submissions.challengeId, challenges.id))
     .groupBy(users.id)
     .orderBy(desc(sql`sum(${challenges.points})`))
     .limit(100);
   ```

## 🆘 Getting Help

### **Debug Information**

When asking for help, include:

1. **Environment Details**
   ```bash
   # System information
   node --version
   npm --version
   
   # Platform information
   echo "Platform: $(uname -s)"
   echo "Architecture: $(uname -m)"
   ```

2. **Error Logs**
   ```bash
   # Application logs
   npm run dev 2>&1 | tee debug.log
   
   # Platform-specific logs
   vercel logs
   railway logs
   netlify functions:log
   ```

3. **Configuration Check**
   ```bash
   # Check environment variables (without revealing secrets)
   node -e "
   const config = {
     NODE_ENV: process.env.NODE_ENV,
     DATABASE_URL: !!process.env.DATABASE_URL,
     SESSION_SECRET: !!process.env.SESSION_SECRET,
     GEMINI_API_KEY: !!process.env.GEMINI_API_KEY
   };
   console.log(JSON.stringify(config, null, 2));
   "
   ```

### **Support Channels**

- **GitHub Issues**: Report bugs and feature requests
- **Discord Community**: Get help from other users
- **Documentation**: Check the docs for detailed guides
- **Stack Overflow**: Search for similar issues

---

**Most issues can be resolved by checking configuration and following these troubleshooting steps! 🔧**

If you're still having problems, don't hesitate to ask for help with detailed error information.