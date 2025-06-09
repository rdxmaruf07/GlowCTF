# 🚀 Deployment Guides

This directory contains step-by-step guides for deploying GlowCTF on various free and paid hosting platforms. Each guide is designed to get you up and running quickly with minimal configuration.

## 🌟 Recommended Platforms

### **Free Tier Platforms**

| Platform | Best For | Database | Pros | Cons |
|----------|----------|----------|------|------|
| **[Vercel](vercel.md)** | Frontend + API | External | Fast, Easy, Great DX | Limited backend |
| **[Railway](railway.md)** | Full-stack | Included | Simple, Powerful | Limited free tier |
| **[Render](render.md)** | Full-stack | Included | Generous free tier | Slower cold starts |
| **[Netlify](netlify.md)** | Frontend | External | Great for static sites | Limited backend |
| **[Firebase](firebase.md)** | Full-stack | Included | Google ecosystem | Complex pricing |

### **Container Platforms**

| Platform | Best For | Complexity | Cost |
|----------|----------|------------|------|
| **[Docker](docker.md)** | Any environment | Medium | Variable |
| **[VPS](vps.md)** | Full control | High | Low |

## 🎯 Quick Deployment Matrix

### **For Beginners**
1. **[Vercel](vercel.md)** + **[Neon](../database/neon.md)** - Easiest setup
2. **[Railway](railway.md)** - All-in-one solution
3. **[Render](render.md)** - Great free tier

### **For Advanced Users**
1. **[Docker](docker.md)** - Maximum flexibility
2. **[VPS](vps.md)** - Full control
3. **[Firebase](firebase.md)** - Google ecosystem

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Source code** ready and tested locally
- [ ] **Environment variables** configured
- [ ] **Database** provider chosen and set up
- [ ] **AI provider** API keys obtained
- [ ] **Domain name** (optional but recommended)

## 🔧 Environment Variables Required

All deployment platforms will need these environment variables:

```env
# Database
DATABASE_URL=your_database_connection_string

# Security
SESSION_SECRET=your_super_secret_session_key

# AI Providers (at least one required)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
XAI_API_KEY=your_xai_api_key

# Optional
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourctf.com
```

## 🚀 Deployment Steps Overview

### **1. Prepare Your Code**
```bash
# Clone the repository
git clone https://github.com/yourusername/glowctf.git
cd glowctf

# Install dependencies
npm install

# Test locally
npm run dev
```

### **2. Choose Your Platform**
Select a deployment platform based on your needs:
- **Simplicity**: Vercel or Railway
- **Features**: Render or Firebase
- **Control**: Docker or VPS

### **3. Set Up Database**
Choose a database provider:
- **PostgreSQL**: Neon or Supabase
- **MySQL**: PlanetScale
- **MongoDB**: MongoDB Atlas

### **4. Configure Environment**
Set up your environment variables in your chosen platform.

### **5. Deploy**
Follow the specific guide for your chosen platform.

## 🔄 Continuous Deployment

Most platforms support automatic deployment from Git:

1. **Connect your repository** to the platform
2. **Configure build settings**
3. **Set environment variables**
4. **Enable auto-deploy** on push to main branch

## 📊 Platform Comparison

### **Performance**
- **Fastest**: Vercel, Netlify
- **Most Reliable**: Railway, Render
- **Most Scalable**: Firebase, Docker

### **Ease of Use**
- **Easiest**: Vercel, Railway
- **Moderate**: Render, Netlify
- **Advanced**: Firebase, Docker, VPS

### **Cost Effectiveness**
- **Best Free Tier**: Render, Railway
- **Best Value**: Vercel, Netlify
- **Most Flexible**: VPS, Docker

## 🆘 Troubleshooting

Common deployment issues:

1. **Build failures** - Check Node.js version compatibility
2. **Environment variables** - Ensure all required vars are set
3. **Database connection** - Verify connection string format
4. **API limits** - Check AI provider quotas

For detailed troubleshooting, see our [troubleshooting guides](../troubleshooting/).

## 🔗 Quick Links

- [Environment Configuration](../configuration/environment.md)
- [Database Setup](../database/)
- [AI Provider Setup](../ai-providers/)
- [Security Configuration](../configuration/security.md)

---

**Choose your platform and start deploying! 🚀**