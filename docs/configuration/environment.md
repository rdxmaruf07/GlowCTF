# ⚙️ Environment Configuration

This guide covers all environment variables and configuration options for GlowCTF, helping you set up your platform correctly across different environments.

## 📋 Environment Variables Overview

GlowCTF uses environment variables for configuration to keep sensitive data secure and allow easy deployment across different environments.

## 🔑 Required Variables

### **Database Configuration**

```env
# PostgreSQL (recommended)
DATABASE_URL=postgresql://username:password@host:port/database

# MySQL (alternative)
MYSQL_DATABASE_URL=mysql://username:password@host:port/database

# Connection pool settings (optional)
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
```

### **Security Configuration**

```env
# Session secret (REQUIRED - minimum 32 characters)
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters

# JWT secret (if using JWT authentication)
JWT_SECRET=your-jwt-secret-key

# Encryption key for sensitive data
ENCRYPTION_KEY=your-encryption-key-32-chars
```

### **AI Provider Configuration**

```env
# Google Gemini (recommended)
GEMINI_API_KEY=your-gemini-api-key

# Groq (fast inference)
GROQ_API_KEY=your-groq-api-key

# xAI Grok (premium features)
XAI_API_KEY=your-xai-api-key
```

## 🔧 Optional Variables

### **Application Settings**

```env
# Environment
NODE_ENV=production|development|test

# Server configuration
PORT=5000
HOST=0.0.0.0

# Application URL
APP_URL=https://your-domain.com
API_URL=https://your-domain.com/api

# CORS origins (comma-separated)
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### **AI Configuration**

```env
# Default AI provider
DEFAULT_AI_PROVIDER=gemini

# AI response settings
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
AI_TIMEOUT=30000

# AI safety settings
AI_CONTENT_FILTER=true
AI_MAX_REQUESTS_PER_MINUTE=15
```

### **Email Configuration**

```env
# SendGrid (recommended)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com

# SMTP (alternative)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_SECURE=true
```

### **File Storage**

```env
# Local storage (default)
STORAGE_TYPE=local
UPLOAD_DIR=./uploads

# AWS S3
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Cloudinary
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **Analytics and Monitoring**

```env
# Google Analytics
GA_TRACKING_ID=GA-XXXXXXXXX

# Sentry error tracking
SENTRY_DSN=your-sentry-dsn

# Custom analytics
ANALYTICS_ENABLED=true
ANALYTICS_ENDPOINT=https://analytics.your-domain.com
```

### **Rate Limiting**

```env
# API rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI rate limiting
AI_RATE_LIMIT_WINDOW_MS=60000
AI_RATE_LIMIT_MAX_REQUESTS=15

# Authentication rate limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_ATTEMPTS=5
```

### **Feature Flags**

```env
# Enable/disable features
FEATURE_CHATBOT=true
FEATURE_TEAM_MODE=true
FEATURE_CONTESTS=true
FEATURE_ACHIEVEMENTS=true
FEATURE_LEADERBOARD=true

# Beta features
BETA_FEATURES=true
BETA_AI_VISION=false
BETA_VOICE_CHAT=false
```

## 🌍 Environment-Specific Configuration

### **Development Environment**

```env
# .env.development
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DATABASE_URL=postgresql://localhost:5432/glowctf_dev

# Security (less strict for development)
SESSION_SECRET=dev-session-secret-minimum-32-characters
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# AI (use free tiers)
GEMINI_API_KEY=your-dev-gemini-key
AI_RATE_LIMIT_MAX_REQUESTS=30

# Debug settings
DEBUG=true
LOG_LEVEL=debug
AI_DEBUG=true
```

### **Staging Environment**

```env
# .env.staging
NODE_ENV=staging
PORT=5000

# Database
DATABASE_URL=postgresql://staging-host:5432/glowctf_staging

# Security
SESSION_SECRET=staging-session-secret-minimum-32-characters
CORS_ORIGINS=https://staging.your-domain.com

# AI (production keys but with limits)
GEMINI_API_KEY=your-staging-gemini-key
AI_RATE_LIMIT_MAX_REQUESTS=20

# Monitoring
SENTRY_DSN=your-staging-sentry-dsn
ANALYTICS_ENABLED=false
```

### **Production Environment**

```env
# .env.production
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://prod-host:5432/glowctf_production

# Security (strict)
SESSION_SECRET=production-session-secret-minimum-32-characters
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# AI (production keys)
GEMINI_API_KEY=your-production-gemini-key
GROQ_API_KEY=your-production-groq-key
AI_RATE_LIMIT_MAX_REQUESTS=15

# Monitoring
SENTRY_DSN=your-production-sentry-dsn
GA_TRACKING_ID=GA-XXXXXXXXX
ANALYTICS_ENABLED=true

# Performance
DB_POOL_MAX=20
AI_TIMEOUT=30000
```

## 🔒 Security Best Practices

### **Environment Variable Security**

1. **Never commit `.env` files** to version control
2. **Use different keys** for different environments
3. **Rotate secrets regularly** (monthly recommended)
4. **Use strong, random values** for secrets
5. **Limit access** to production environment variables

### **Secret Generation**

Generate secure secrets:

```bash
# Generate session secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -hex 32
```

### **Environment File Structure**

```bash
# Project structure
.env                    # Default environment (never commit)
.env.local             # Local overrides (never commit)
.env.development       # Development defaults (can commit)
.env.staging          # Staging defaults (can commit)
.env.production       # Production template (can commit, no secrets)
.env.example          # Example file (commit this)
```

### **Example Environment File**

```env
# .env.example
# Copy this file to .env and fill in your values

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
SESSION_SECRET=your-session-secret-minimum-32-characters

# AI Providers (at least one required)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
XAI_API_KEY=your-xai-api-key

# Email (optional)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com

# Application
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000
```

## 🔧 Configuration Loading

### **Environment Loading Order**

GlowCTF loads environment variables in this order:

1. System environment variables
2. `.env.local` (highest priority)
3. `.env.{NODE_ENV}` (e.g., `.env.production`)
4. `.env` (default)

### **Configuration Validation**

```typescript
// lib/config.ts
import { z } from 'zod';

const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Security
  SESSION_SECRET: z.string().min(32),
  
  // AI Providers (at least one required)
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number).default('5000'),
  
  // Optional
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
}).refine(
  (data) => data.GEMINI_API_KEY || data.GROQ_API_KEY || data.XAI_API_KEY,
  { message: "At least one AI provider API key is required" }
);

export const config = configSchema.parse(process.env);
```

### **Runtime Configuration**

```typescript
// lib/runtime-config.ts
export const getRuntimeConfig = () => ({
  // Public config (safe to expose to client)
  public: {
    appUrl: process.env.APP_URL,
    environment: process.env.NODE_ENV,
    features: {
      chatbot: process.env.FEATURE_CHATBOT === 'true',
      teamMode: process.env.FEATURE_TEAM_MODE === 'true',
      contests: process.env.FEATURE_CONTESTS === 'true',
    },
  },
  
  // Private config (server-only)
  private: {
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    aiKeys: {
      gemini: process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      xai: process.env.XAI_API_KEY,
    },
  },
});
```

## 🚀 Platform-Specific Configuration

### **Vercel**

```bash
# Set environment variables via Vercel CLI
vercel env add SESSION_SECRET
vercel env add DATABASE_URL
vercel env add GEMINI_API_KEY

# Or use vercel.json
{
  "env": {
    "NODE_ENV": "production"
  }
}
```

### **Railway**

```bash
# Set environment variables via Railway CLI
railway variables set SESSION_SECRET=your-secret
railway variables set DATABASE_URL=your-db-url

# Or use railway.json
{
  "deploy": {
    "envVars": {
      "NODE_ENV": "production"
    }
  }
}
```

### **Render**

```yaml
# render.yaml
services:
  - type: web
    name: glowctf
    envVars:
      - key: NODE_ENV
        value: production
      - key: SESSION_SECRET
        sync: false  # Prompt for value during deployment
```

### **Netlify**

```toml
# netlify.toml
[build.environment]
  NODE_ENV = "production"

# Set sensitive variables in Netlify dashboard
```

## 🔍 Debugging Configuration

### **Configuration Debugging**

```typescript
// Debug configuration loading
if (process.env.NODE_ENV === 'development') {
  console.log('Loaded configuration:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- PORT:', process.env.PORT);
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('- SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing');
  console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing');
}
```

### **Health Check Endpoint**

```typescript
// server/routes/health.ts
app.get('/api/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    config: {
      database: !!process.env.DATABASE_URL,
      session: !!process.env.SESSION_SECRET,
      ai: {
        gemini: !!process.env.GEMINI_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        xai: !!process.env.XAI_API_KEY,
      },
      email: !!process.env.SENDGRID_API_KEY,
    },
  };
  
  res.json(health);
});
```

## ✅ Configuration Checklist

- [ ] All required environment variables set
- [ ] Secrets are secure and properly generated
- [ ] Different values for different environments
- [ ] Configuration validation implemented
- [ ] Environment files properly structured
- [ ] Platform-specific configuration completed
- [ ] Health check endpoint working
- [ ] Debug logging configured
- [ ] Security best practices followed
- [ ] Documentation updated

---

**Your GlowCTF environment is properly configured! ⚙️**

Next steps:
- [Deploy your application](../deployment/)
- [Set up monitoring](./monitoring.md)
- [Configure security](./security.md)