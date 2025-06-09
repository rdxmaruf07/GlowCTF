# 🌐 Deploy to Netlify

Netlify is excellent for deploying the frontend of GlowCTF with serverless functions for API routes, offering a generous free tier and excellent developer experience.

## 🎯 Why Netlify?

- ✅ **Generous free tier** (100GB bandwidth, 300 build minutes)
- ✅ **Global CDN** with edge locations worldwide
- ✅ **Serverless functions** for API routes
- ✅ **Automatic deployments** from Git
- ✅ **Built-in forms** and identity management
- ✅ **Custom domains** with SSL
- ✅ **Branch previews** for testing

## 📋 Prerequisites

- GitHub, GitLab, or Bitbucket account
- Netlify account (free)
- External database (Neon, Supabase, etc.)
- AI provider API keys

## 🚀 Step-by-Step Deployment

### **Step 1: Create Netlify Account**

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Netlify to access your repositories

### **Step 2: Prepare Your Repository**

1. **Fork or clone** the GlowCTF repository:
```bash
git clone https://github.com/yourusername/glowctf.git
cd glowctf
```

2. **Create Netlify configuration** file `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

3. **Create serverless functions directory**:
```bash
mkdir -p netlify/functions
```

4. **Convert server routes to Netlify functions**:

```typescript
// netlify/functions/api.ts
import { Handler } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';

// Import your existing routes
import authRoutes from '../../server/routes/auth';
import challengeRoutes from '../../server/routes/challenges';
import chatbotRoutes from '../../server/routes/chatbot';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/challenges', challengeRoutes);
app.use('/chatbot', chatbotRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Export handler
export const handler: Handler = serverless(app);
```

5. **Update package.json** scripts:
```json
{
  "scripts": {
    "build": "vite build",
    "build:functions": "netlify-lambda build netlify/functions",
    "dev": "netlify dev",
    "dev:functions": "netlify-lambda serve netlify/functions"
  },
  "devDependencies": {
    "@netlify/functions": "^2.0.0",
    "netlify-lambda": "^2.0.0",
    "serverless-http": "^3.2.0"
  }
}
```

6. **Push to your Git provider**:
```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

### **Step 3: Deploy to Netlify**

1. In Netlify dashboard, click **"New site from Git"**
2. Choose your Git provider and repository
3. Configure build settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### **Step 4: Configure Environment Variables**

In Netlify site settings, go to **Environment variables** and add:

```env
# Database (external required)
DATABASE_URL=postgresql://username:password@host:port/database

# Security
SESSION_SECRET=your-super-secret-session-key

# AI Providers
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
XAI_API_KEY=your-xai-api-key

# Optional
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourctf.com

# Netlify specific
NODE_ENV=production
```

### **Step 5: Enable Netlify Functions**

1. Go to **Site settings** → **Functions**
2. Verify functions directory is set to `netlify/functions`
3. Check that functions are being built correctly

## 🗄️ Database Setup

Since Netlify doesn't provide databases, you'll need an external provider:

### **Recommended: Neon PostgreSQL**

1. Follow our [Neon setup guide](../database/neon.md)
2. Get the connection string
3. Add to Netlify environment variables

### **Alternative: Supabase**

1. Follow our [Supabase setup guide](../database/supabase.md)
2. Configure connection in Netlify

## 🔧 Advanced Configuration

### **Custom Domain**

1. In Netlify site settings, go to **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Configure DNS records:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: your-site-name.netlify.app
   ```
5. SSL certificate will be automatically provisioned

### **Branch Previews**

Configure branch previews for testing:

```toml
# netlify.toml
[context.deploy-preview]
  command = "npm run build:preview"

[context.branch-deploy]
  command = "npm run build:staging"

[context.production]
  command = "npm run build"
```

### **Form Handling**

Use Netlify Forms for contact forms:

```html
<!-- Contact form with Netlify handling -->
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

### **Identity Management**

Enable Netlify Identity for user authentication:

1. Go to **Site settings** → **Identity**
2. Click **"Enable Identity"**
3. Configure registration settings
4. Set up external providers (Google, GitHub, etc.)

```typescript
// lib/netlify-identity.ts
import netlifyIdentity from 'netlify-identity-widget';

export const initNetlifyIdentity = () => {
  netlifyIdentity.init();
  
  netlifyIdentity.on('init', user => {
    if (!user) {
      netlifyIdentity.on('login', () => {
        document.location.href = '/dashboard';
      });
    }
  });
};
```

## 📊 Performance Optimization

### **Build Optimization**

Optimize build performance:

```toml
# netlify.toml
[build]
  command = "npm ci && npm run build"
  
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true
```

### **Caching Strategy**

Configure caching headers:

```toml
# Cache static assets for 1 year
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Cache API responses for 5 minutes
[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "public, max-age=300"

# Don't cache HTML files
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### **Image Optimization**

Use Netlify's image transformation:

```html
<!-- Optimized images -->
<img src="/.netlify/images?url=/images/hero.jpg&w=800&h=600&fit=cover" 
     alt="Hero image" />
```

## 🔄 Continuous Deployment

### **Auto-Deploy**

Netlify automatically deploys when you push to your repository:

- **Push to main** → Production deployment
- **Push to other branches** → Branch preview
- **Pull requests** → Deploy preview

### **Deploy Hooks**

Create deploy hooks for external triggers:

1. Go to **Site settings** → **Build & deploy** → **Build hooks**
2. Click **"Add build hook"**
3. Use the webhook URL to trigger deployments

### **Build Plugins**

Add useful build plugins:

```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"

[[plugins]]
  package = "netlify-plugin-checklinks"

[[plugins]]
  package = "@netlify/plugin-sitemap"
```

## 🛡️ Security Configuration

### **Security Headers**

Configure security headers:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
```

### **Environment Variables Security**

- Use Netlify's encrypted environment variables
- Never commit sensitive data to Git
- Use different keys for different environments

## 📊 Analytics and Monitoring

### **Netlify Analytics**

Enable Netlify Analytics:

1. Go to **Site settings** → **Analytics**
2. Enable **Netlify Analytics**
3. View traffic and performance data

### **Custom Analytics**

Add custom analytics:

```typescript
// lib/analytics.ts
export const trackEvent = (event: string, properties?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }
};

// Track chatbot usage
trackEvent('chatbot_query', {
  provider: 'gemini',
  category: 'web'
});
```

## 💰 Pricing

### **Free Tier**
- **100GB** bandwidth per month
- **300 build minutes** per month
- **Unlimited** sites
- **Basic** analytics
- **Community** support

### **Pro Plan ($19/month)**
- **1TB** bandwidth
- **25,000 build minutes**
- **Advanced** analytics
- **Form submissions**
- **Identity** management

## 🚨 Troubleshooting

### **Common Issues**

1. **Functions Not Working**
   ```bash
   # Check function logs
   netlify functions:log
   
   # Test functions locally
   netlify dev
   ```

2. **Build Failures**
   ```bash
   # Check Node.js version
   "engines": {
     "node": ">=18.0.0"
   }
   
   # Clear cache and rebuild
   # In Netlify: Site settings → Build & deploy → Clear cache
   ```

3. **Environment Variables Not Loading**
   - Check variable names in Netlify dashboard
   - Ensure no typos in variable names
   - Redeploy after adding new variables

4. **CORS Issues**
   ```typescript
   // Add CORS headers to functions
   export const handler = async (event, context) => {
     return {
       statusCode: 200,
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Headers': 'Content-Type',
         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
       },
       body: JSON.stringify(data)
     };
   };
   ```

### **Debug Mode**

Enable debug logging:

```typescript
// Add to your functions
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { event, context });
}
```

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Netlify Community](https://community.netlify.com)

## ✅ Deployment Checklist

- [ ] Netlify account created and connected to Git
- [ ] Repository prepared with Netlify configuration
- [ ] Serverless functions created
- [ ] External database configured
- [ ] Environment variables set
- [ ] Build settings configured
- [ ] Functions deployed and tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Analytics enabled
- [ ] Application tested in production

---

**Your GlowCTF platform is now live on Netlify! 🌐**

Next steps:
- [Set up external database](../database/)
- [Configure AI providers](../ai-providers/)
- [Set up monitoring](../configuration/monitoring.md)