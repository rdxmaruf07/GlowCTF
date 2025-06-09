# 🎨 Deploy to Render

Render provides an excellent platform for deploying full-stack applications with one of the most generous free tiers available, making it perfect for hosting GlowCTF.

## 🎯 Why Render?

- ✅ **Generous free tier** with 750 hours/month
- ✅ **Built-in databases** (PostgreSQL, Redis)
- ✅ **Automatic HTTPS** and custom domains
- ✅ **Git-based deployments** with auto-deploy
- ✅ **Environment variables** management
- ✅ **Real-time logs** and monitoring
- ✅ **Easy scaling** to paid tiers

## 📋 Prerequisites

- GitHub, GitLab, or Bitbucket account
- Render account (free)
- GlowCTF source code
- AI provider API keys

## 🚀 Step-by-Step Deployment

### **Step 1: Create Render Account**

1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Render to access your repositories

### **Step 2: Prepare Your Repository**

1. **Fork or clone** the GlowCTF repository:
```bash
git clone https://github.com/yourusername/glowctf.git
cd glowctf
```

2. **Create a Render configuration** file `render.yaml`:
```yaml
databases:
  - name: glowctf-db
    databaseName: glowctf
    user: glowctf_user
    plan: free

services:
  - type: web
    name: glowctf-app
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: glowctf-db
          property: connectionString
      - key: NODE_ENV
        value: production
    healthCheckPath: /api/health
```

3. **Update package.json** scripts:
```json
{
  "scripts": {
    "build": "vite build && npm run build:server",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server",
    "start": "NODE_ENV=production node dist/server/index.js",
    "dev": "NODE_ENV=development tsx server/index.ts"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

4. **Push to your Git provider**:
```bash
git add .
git commit -m "Add Render configuration"
git push origin main
```

### **Step 3: Create Database**

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name**: `glowctf-db`
   - **Database**: `glowctf`
   - **User**: `glowctf_user`
   - **Plan**: Free
3. Click **"Create Database"**
4. Note the connection details for later use

### **Step 4: Create Web Service**

1. Click **"New +"** → **"Web Service"**
2. Connect your Git repository
3. Configure service:
   - **Name**: `glowctf-app`
   - **Environment**: `Node`
   - **Plan**: `Free`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### **Step 5: Configure Environment Variables**

In the web service settings, add these environment variables:

```env
# Database (use connection string from your Render database)
DATABASE_URL=postgresql://glowctf_user:password@host:port/glowctf

# Security (required)
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# AI Providers (at least one required)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
XAI_API_KEY=your-xai-api-key

# Optional: Email
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourctf.com

# Application settings
NODE_ENV=production
PORT=10000
```

### **Step 6: Deploy**

1. Click **"Create Web Service"**
2. Render will automatically start building and deploying
3. Monitor the build process in the logs
4. Your app will be available at `https://your-service-name.onrender.com`

## 🗄️ Database Setup

### **PostgreSQL Configuration**

Render provides these connection details:
- **Host**: `your-db-host.render.com`
- **Port**: `5432`
- **Database**: `glowctf`
- **Username**: `glowctf_user`
- **Password**: Auto-generated

### **Connection String Format**

```
postgresql://username:password@host:port/database
```

### **Run Database Migrations**

Create a migration script:

```bash
# Create a one-time job for migrations
# In Render dashboard: New + → Background Worker
# Command: npm run db:migrate
```

Or run manually:

```bash
# Install Render CLI
npm install -g @render/cli

# Login and run migration
render login
render run --service-id your-service-id npm run db:migrate
```

### **Database Management**

Access your database:

1. **Render Dashboard**: Use the database connection info
2. **External tools**: Connect using the connection string
3. **Command line**: Use psql with the connection string

```bash
# Connect to database
psql "postgresql://username:password@host:port/database"
```

## 🔧 Advanced Configuration

### **Custom Domain**

1. In Render service settings, go to **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain name
4. Configure DNS records:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: your-service-name.onrender.com
   ```
5. SSL certificate will be automatically provisioned

### **Environment-Specific Deployments**

Create separate services for different environments:

```yaml
# render.yaml
services:
  - type: web
    name: glowctf-production
    env: node
    plan: starter
    branch: main
    buildCommand: npm install && npm run build
    startCommand: npm start
    
  - type: web
    name: glowctf-staging
    env: node
    plan: free
    branch: develop
    buildCommand: npm install && npm run build
    startCommand: npm start
```

### **Health Checks**

Add a health check endpoint:

```typescript
// server/index.ts
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'connected' // Add actual DB health check
  });
});
```

### **Background Jobs**

Create background workers for scheduled tasks:

```yaml
# render.yaml
services:
  - type: worker
    name: glowctf-worker
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm run worker
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: glowctf-db
          property: connectionString
```

## 📊 Monitoring and Logs

### **Real-time Logs**

View logs in Render dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. View real-time output and errors

### **Metrics**

Render provides built-in metrics:
- **Response times**
- **Memory usage**
- **CPU usage**
- **Request volume**

### **Custom Monitoring**

Add application monitoring:

```typescript
// server/middleware/monitoring.ts
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    }));
  });
  
  next();
};
```

### **Error Tracking**

Integrate error tracking services:

```bash
npm install @sentry/node @sentry/tracing
```

```typescript
// server/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## 🔄 Continuous Deployment

### **Auto-Deploy**

Render automatically deploys when you push to your connected branch:
- **Push to main** → Production deployment
- **Push to develop** → Staging deployment (if configured)

### **Deploy Hooks**

Configure deploy hooks in `render.yaml`:

```yaml
services:
  - type: web
    name: glowctf-app
    preDeployCommand: npm run db:migrate
    postDeployCommand: npm run cache:clear
```

### **Manual Deployments**

Deploy manually from Render dashboard:
1. Go to your service
2. Click **"Manual Deploy"**
3. Choose **"Deploy latest commit"** or specific commit

## 🛡️ Security Configuration

### **Environment Variables Security**

- Use Render's encrypted environment variables
- Never commit sensitive data to Git
- Use different API keys for different environments

### **Database Security**

Render databases are automatically secured:
- **Private networking** within Render
- **SSL/TLS encryption** in transit
- **Automatic backups** (paid plans)

### **Application Security**

Configure security middleware:

```typescript
// server/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## 💰 Pricing

### **Free Tier**
- **750 hours/month** of usage
- **512MB RAM**
- **0.1 CPU**
- **Automatic sleep** after 15 minutes of inactivity
- **PostgreSQL database** with 1GB storage

### **Starter Plan ($7/month)**
- **Always-on** services
- **512MB RAM**
- **0.5 CPU**
- **No sleep**
- **Custom domains**

### **Standard Plan ($25/month)**
- **2GB RAM**
- **1 CPU**
- **Faster builds**
- **Priority support**

## 🚨 Troubleshooting

### **Common Issues**

1. **Service Won't Start**
   ```bash
   # Check start command in package.json
   "scripts": {
     "start": "node dist/server/index.js"
   }
   
   # Ensure PORT is configured correctly
   const PORT = process.env.PORT || 10000;
   app.listen(PORT, '0.0.0.0');
   ```

2. **Build Failures**
   ```bash
   # Check Node.js version
   "engines": {
     "node": ">=18.0.0"
   }
   
   # Verify build command
   "scripts": {
     "build": "vite build && npm run build:server"
   }
   ```

3. **Database Connection Issues**
   ```bash
   # Verify DATABASE_URL format
   postgresql://user:password@host:port/database
   
   # Check database status in Render dashboard
   ```

4. **Environment Variables Not Loading**
   - Check variable names in Render dashboard
   - Ensure no typos in variable names
   - Redeploy after adding new variables

### **Debug Mode**

Enable debug logging:

```typescript
// Add to your environment variables
DEBUG=*

// Or in your application
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
}
```

### **Service Logs**

Check service logs for errors:
1. Go to Render dashboard
2. Select your service
3. View **"Logs"** tab
4. Look for error messages and stack traces

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Render CLI](https://render.com/docs/cli)
- [Render Community](https://community.render.com)
- [Render Status Page](https://status.render.com)

## ✅ Deployment Checklist

- [ ] Render account created and connected to Git
- [ ] Repository prepared with Render configuration
- [ ] PostgreSQL database created
- [ ] Web service created and configured
- [ ] Environment variables set
- [ ] Build and start commands configured
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] Application deployed successfully
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Monitoring and logs verified
- [ ] Application tested in production

---

**Your GlowCTF platform is now live on Render! 🎨**

Next steps:
- [Set up AI providers](../ai-providers/)
- [Configure monitoring](../configuration/monitoring.md)
- [Customize your platform](../configuration/)