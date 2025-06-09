# 🌟 Deploy to Vercel

Vercel is the recommended platform for deploying GlowCTF due to its excellent performance, ease of use, and seamless integration with React applications.

## 🎯 Why Vercel?

- ✅ **Free tier** with generous limits
- ✅ **Automatic deployments** from Git
- ✅ **Global CDN** for fast loading
- ✅ **Built-in analytics** and monitoring
- ✅ **Custom domains** support
- ✅ **Serverless functions** for API routes

## 📋 Prerequisites

- GitHub, GitLab, or Bitbucket account
- Vercel account (free)
- Database provider (we recommend [Neon](../database/neon.md))
- AI provider API keys

## 🚀 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. **Fork or clone** the GlowCTF repository:
```bash
git clone https://github.com/yourusername/glowctf.git
cd glowctf
```

2. **Push to your Git provider** (GitHub recommended):
```bash
git remote add origin https://github.com/yourusername/glowctf.git
git push -u origin main
```

### **Step 2: Create Vercel Account**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your repositories

### **Step 3: Import Your Project**

1. In Vercel dashboard, click **"New Project"**
2. **Import** your GlowCTF repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### **Step 4: Configure Environment Variables**

In the Vercel project settings, add these environment variables:

```env
# Database (required)
DATABASE_URL=postgresql://username:password@host:port/database

# Security (required)
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# AI Providers (at least one required)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
XAI_API_KEY=your-xai-api-key

# Optional: Email
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourctf.com

# Optional: Custom settings
NODE_ENV=production
```

### **Step 5: Configure Build Settings**

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### **Step 6: Deploy**

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at `https://your-project-name.vercel.app`

## 🔧 Advanced Configuration

### **Custom Domain**

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

### **Environment Variables per Branch**

Set different environment variables for different branches:

- **Production**: `main` branch
- **Preview**: `develop` branch
- **Development**: feature branches

### **Build Optimization**

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:vercel": "npm run build && npm run build:server",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api"
  }
}
```

## 🗄️ Database Setup

### **Recommended: Neon PostgreSQL**

1. Follow our [Neon setup guide](../database/neon.md)
2. Copy the connection string
3. Add to Vercel environment variables as `DATABASE_URL`

### **Alternative: Supabase**

1. Follow our [Supabase setup guide](../database/supabase.md)
2. Use the connection string in Vercel

## 🤖 AI Provider Setup

### **Google Gemini (Recommended)**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to Vercel as `GEMINI_API_KEY`

### **Groq**

1. Sign up at [Groq Console](https://console.groq.com)
2. Generate API key
3. Add to Vercel as `GROQ_API_KEY`

## 📊 Monitoring and Analytics

### **Built-in Analytics**

Vercel provides:
- **Performance metrics**
- **Error tracking**
- **Usage statistics**
- **Real-time logs**

### **Custom Monitoring**

Add monitoring tools:

```bash
npm install @vercel/analytics @vercel/speed-insights
```

In your `main.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your repository:

1. **Push to main** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull requests** → Preview deployments with unique URLs

### **Deployment Hooks**

Add deployment hooks in `vercel.json`:

```json
{
  "github": {
    "silent": true
  },
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🛡️ Security Configuration

### **Environment Variables Security**

- Never commit `.env` files
- Use Vercel's environment variable encryption
- Rotate API keys regularly

### **CORS Configuration**

Configure CORS in your server:

```typescript
// server/index.ts
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://your-project.vercel.app']
    : ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true
}));
```

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

2. **Environment Variables Not Working**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding new variables
   - Check variable names for typos

3. **Database Connection Issues**
   ```bash
   # Test connection string format
   postgresql://username:password@host:port/database
   ```

4. **API Routes Not Working**
   - Check `vercel.json` configuration
   - Ensure server files are in correct location
   - Verify function timeout settings

### **Debug Mode**

Enable debug mode in Vercel:

```json
{
  "env": {
    "DEBUG": "1"
  }
}
```

## 📈 Performance Optimization

### **Build Performance**

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci"
}
```

### **Runtime Performance**

- Use Vercel Edge Functions for better performance
- Enable compression
- Optimize images with Vercel Image Optimization

## 💰 Pricing

### **Free Tier Includes**
- 100GB bandwidth per month
- 1000 serverless function invocations per day
- 100 deployments per day
- Custom domains
- SSL certificates

### **Pro Tier ($20/month)**
- 1TB bandwidth
- Unlimited serverless functions
- Advanced analytics
- Team collaboration

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)

## ✅ Deployment Checklist

- [ ] Repository pushed to Git provider
- [ ] Vercel account created and connected
- [ ] Project imported and configured
- [ ] Environment variables set
- [ ] Database connected and tested
- [ ] AI provider API keys configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Deployment successful
- [ ] Application tested in production

---

**Your GlowCTF platform is now live on Vercel! 🎉**

Next steps:
- [Configure your database](../database/)
- [Set up AI providers](../ai-providers/)
- [Customize your platform](../configuration/)