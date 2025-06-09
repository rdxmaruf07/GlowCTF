# 🚂 Deploy to Railway

Railway is an excellent platform for deploying full-stack applications with built-in database support, making it perfect for GlowCTF's complete infrastructure needs.

## 🎯 Why Railway?

- ✅ **Simple deployment** from Git repositories
- ✅ **Built-in databases** (PostgreSQL, MySQL, Redis)
- ✅ **Automatic HTTPS** and custom domains
- ✅ **Environment variables** management
- ✅ **Real-time logs** and monitoring
- ✅ **Generous free tier** ($5/month credit)
- ✅ **Easy scaling** with usage-based pricing

## 📋 Prerequisites

- GitHub, GitLab, or Bitbucket account
- Railway account (free)
- GlowCTF source code
- AI provider API keys

## 🚀 Step-by-Step Deployment

### **Step 1: Create Railway Account**

1. Go to [railway.app](https://railway.app)
2. Click **"Login"**
3. Choose **"Login with GitHub"** (recommended)
4. Authorize Railway to access your repositories

### **Step 2: Prepare Your Repository**

1. **Fork or clone** the GlowCTF repository:
```bash
git clone https://github.com/yourusername/glowctf.git
cd glowctf
```

2. **Create a Railway configuration** file `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **Update package.json** scripts:
```json
{
  "scripts": {
    "build": "vite build && npm run build:server",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server",
    "start": "NODE_ENV=production node dist/server/index.js",
    "dev": "NODE_ENV=development tsx server/index.ts"
  }
}
```

4. **Push to your Git provider**:
```bash
git add .
git commit -m "Add Railway configuration"
git push origin main
```

### **Step 3: Create New Project**

1. In Railway dashboard, click **"New Project"**
2. Choose **"Deploy from GitHub repo"**
3. Select your GlowCTF repository
4. Railway will automatically detect it as a Node.js project

### **Step 4: Add Database**

1. In your Railway project, click **"New"** → **"Database"**
2. Choose **"PostgreSQL"** (recommended) or **"MySQL"**
3. Railway will automatically provision the database
4. Note the connection details in the **"Connect"** tab

### **Step 5: Configure Environment Variables**

In Railway project settings, add these variables:

```env
# Database (automatically provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
# or for MySQL: DATABASE_URL=${{MySQL.DATABASE_URL}}

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
PORT=3000
```

### **Step 6: Configure Build Settings**

Railway automatically detects build settings, but you can customize:

1. Go to **Settings** → **Build**
2. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (default)

### **Step 7: Deploy**

1. Railway automatically deploys when you push to your repository
2. Monitor the build process in the **"Deployments"** tab
3. Your app will be available at `https://your-project-name.up.railway.app`

## 🗄️ Database Configuration

### **PostgreSQL Setup**

Railway automatically provides these environment variables:
- `DATABASE_URL`: Full connection string
- `PGHOST`: Database host
- `PGPORT`: Database port
- `PGUSER`: Database user
- `PGPASSWORD`: Database password
- `PGDATABASE`: Database name

### **Run Database Migrations**

Create a migration script in `package.json`:

```json
{
  "scripts": {
    "db:migrate": "drizzle-kit push",
    "db:seed": "tsx server/scripts/add-sample-data.ts"
  }
}
```

Run migrations after deployment:

```bash
# Using Railway CLI
railway run npm run db:migrate
railway run npm run db:seed
```

### **Database Management**

Access your database:

1. **Railway Dashboard**: Use the built-in database browser
2. **Railway CLI**: Connect directly to your database
3. **External tools**: Use connection string with tools like pgAdmin

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect
railway login
railway connect

# Run database commands
railway run psql $DATABASE_URL
```

## 🔧 Advanced Configuration

### **Custom Domain**

1. In Railway project, go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter your domain name
4. Configure DNS records:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: your-project-name.up.railway.app
   ```
5. SSL certificate will be automatically provisioned

### **Environment-Specific Variables**

Set different variables for different environments:

```bash
# Production variables (default)
railway variables set GEMINI_API_KEY=prod-key

# Development variables
railway variables set --environment development GEMINI_API_KEY=dev-key
```

### **Health Checks**

Add a health check endpoint to your server:

```typescript
// server/index.ts
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### **Scaling Configuration**

Configure scaling in `railway.json`:

```json
{
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## 📊 Monitoring and Logs

### **Real-time Logs**

View logs in Railway dashboard:
1. Go to your project
2. Click on your service
3. View **"Logs"** tab for real-time output

### **Metrics**

Railway provides built-in metrics:
- **CPU usage**
- **Memory usage**
- **Network traffic**
- **Response times**

### **Custom Monitoring**

Add monitoring to your application:

```typescript
// server/middleware/monitoring.ts
import { Request, Response, NextFunction } from 'express';

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
```

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your connected branch:

### **Deployment Triggers**

- **Push to main branch** → Automatic deployment
- **Pull requests** → Preview deployments (Pro plan)
- **Manual deployments** → Deploy specific commits

### **Deployment Hooks**

Add deployment hooks in your application:

```typescript
// server/hooks/deployment.ts
export const postDeployHook = async () => {
  // Run database migrations
  await runMigrations();
  
  // Clear caches
  await clearCache();
  
  // Send deployment notification
  await notifyDeployment();
};
```

## 🛡️ Security Configuration

### **Environment Variables Security**

- Use Railway's encrypted environment variables
- Never commit sensitive data to Git
- Rotate API keys regularly

### **Database Security**

Railway databases are automatically secured:
- **Private networking** by default
- **SSL/TLS encryption** in transit
- **Automatic backups**

### **Application Security**

Configure security headers:

```typescript
// server/middleware/security.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 💰 Pricing

### **Free Tier**
- **$5/month** in usage credits
- **512MB RAM** per service
- **1GB disk** per service
- **Shared CPU**
- **Community support**

### **Pro Plan ($20/month)**
- **$20/month** in usage credits
- **8GB RAM** per service
- **100GB disk** per service
- **Dedicated CPU**
- **Priority support**
- **Team collaboration**

### **Usage-Based Pricing**
- **CPU**: $0.000463/vCPU-hour
- **Memory**: $0.000231/GB-hour
- **Disk**: $0.25/GB-month
- **Network**: $0.10/GB

## 🚨 Troubleshooting

### **Common Issues**

1. **Build Failures**
   ```bash
   # Check Node.js version
   node --version  # Should be >= 18
   
   # Update package.json engines
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **Database Connection Issues**
   ```bash
   # Check DATABASE_URL format
   postgresql://user:password@host:port/database
   
   # Test connection
   railway run npm run test:db-connection
   ```

3. **Environment Variables Not Loading**
   - Verify variables are set in Railway dashboard
   - Check variable names for typos
   - Redeploy after adding new variables

4. **Port Configuration Issues**
   ```typescript
   // Ensure your app listens on Railway's PORT
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

### **Debug Mode**

Enable debug logging:

```bash
# Set debug environment variable
railway variables set DEBUG=*

# View detailed logs
railway logs --follow
```

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Templates](https://railway.app/templates)
- [Railway Discord Community](https://discord.gg/railway)

## ✅ Deployment Checklist

- [ ] Railway account created and connected to Git
- [ ] Repository prepared with Railway configuration
- [ ] Project created and connected to repository
- [ ] Database provisioned (PostgreSQL/MySQL)
- [ ] Environment variables configured
- [ ] Build and start commands configured
- [ ] Application deployed successfully
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Monitoring and logs verified
- [ ] Application tested in production

---

**Your GlowCTF platform is now live on Railway! 🚂**

Next steps:
- [Set up AI providers](../ai-providers/)
- [Configure monitoring](../configuration/monitoring.md)
- [Customize your platform](../configuration/)