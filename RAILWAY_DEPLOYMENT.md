# 🚂 Railway Deployment Guide for GlowCTF

This guide will help you deploy your GlowCTF platform to Railway.

## 📋 Prerequisites

- Railway account (free at [railway.app](https://railway.app))
- GitHub account with this repository
- AI provider API keys (Gemini, Groq, or XAI)

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Your project is already configured for Railway with:
- ✅ `railway.json` configuration file
- ✅ Updated `package.json` with proper build/start scripts
- ✅ Health check endpoint at `/api/health`
- ✅ Environment variable support
- ✅ Node.js version specification

### 2. Deploy to Railway

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Login with GitHub"

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository

3. **Add Database**
   - In your Railway project, click "New" → "Database"
   - Choose "PostgreSQL" (recommended)
   - Railway will automatically provision the database

### 3. Configure Environment Variables

In Railway project settings, add these variables:

```env
# Database (automatically provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security (required - generate a secure random string)
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
```

### 4. Deploy and Initialize Database

1. **Deploy the Application**
   - Railway will automatically build and deploy your app
   - Monitor the deployment in the "Deployments" tab

2. **Run Database Migrations**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and connect to your project
   railway login
   railway link
   
   # Run database migrations
   railway run npm run db:migrate
   
   # Seed with sample data (optional)
   railway run npm run db:seed
   ```

### 5. Access Your Application

Your GlowCTF platform will be available at:
`https://your-project-name.up.railway.app`

## 🔧 Configuration Details

### Build Process
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/api/health`

### Database Support
- **PostgreSQL**: Recommended (automatic with Railway)
- **MySQL**: Also supported
- **Connection**: Uses `DATABASE_URL` environment variable

### AI Providers
Configure at least one AI provider for chatbot functionality:
- **Gemini**: Google's AI model
- **Groq**: Fast inference API
- **XAI**: Grok AI model

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires >=18.0.0)
   - Verify all dependencies are in package.json

2. **Database Connection Issues**
   - Ensure DATABASE_URL is set correctly
   - Check database is running in Railway dashboard

3. **Environment Variables**
   - Verify all required variables are set
   - Redeploy after adding new variables

### Debug Commands

```bash
# Check application logs
railway logs --follow

# Test database connection
railway run npm run test:db-connection

# Check environment variables
railway variables
```

## 📊 Monitoring

Railway provides built-in monitoring:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Health Checks**: Automatic monitoring of `/api/health`

## 🔒 Security

- Environment variables are encrypted
- Database connections use SSL
- Automatic HTTPS certificates
- Private networking between services

## 💰 Pricing

- **Free Tier**: $5/month in usage credits
- **Usage-based**: Pay only for what you use
- **Generous limits**: Perfect for CTF platforms

## 🔗 Useful Commands

```bash
# Connect to your project
railway link

# View logs
railway logs

# Run commands in production
railway run <command>

# Connect to database
railway connect

# Deploy specific branch
railway up --detach
```

## ✅ Post-Deployment Checklist

- [ ] Application deployed successfully
- [ ] Database connected and migrated
- [ ] Health check endpoint responding
- [ ] Environment variables configured
- [ ] AI providers working
- [ ] Sample data loaded (optional)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

## 🎯 Next Steps

After successful deployment:

1. **Configure AI Providers**: Add your API keys in the admin panel
2. **Create Admin Account**: Register and promote to admin
3. **Add Challenges**: Use the admin interface to add CTF challenges
4. **Customize Platform**: Update branding and settings
5. **Monitor Usage**: Check Railway dashboard for metrics

Your GlowCTF platform is now live and ready for participants! 🎉