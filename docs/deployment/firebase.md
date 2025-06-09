# 🔥 Deploy to Firebase

Firebase provides a comprehensive platform for deploying full-stack applications with hosting, database, authentication, and more - all integrated into Google's ecosystem.

## 🎯 Why Firebase?

- ✅ **Free tier** with generous limits
- ✅ **Integrated ecosystem** (hosting, database, auth)
- ✅ **Real-time database** capabilities
- ✅ **Global CDN** with fast performance
- ✅ **Built-in analytics** and monitoring
- ✅ **Serverless functions** with Cloud Functions
- ✅ **Easy scaling** as your platform grows

## 📋 Prerequisites

- Google account
- Node.js >= 18.0.0
- Firebase CLI
- GlowCTF source code

## 🚀 Step-by-Step Deployment

### **Step 1: Install Firebase CLI**

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

### **Step 2: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `glowctf-platform`
4. **Enable Google Analytics** (recommended)
5. Choose or create Analytics account
6. Click **"Create project"**

### **Step 3: Initialize Firebase in Your Project**

```bash
# Navigate to your GlowCTF directory
cd glowctf

# Initialize Firebase
firebase init

# Select these services:
# ◉ Firestore: Configure security rules and indexes
# ◉ Functions: Configure a Cloud Functions directory
# ◉ Hosting: Configure files for Firebase Hosting
# ◉ Storage: Configure a security rules file for Cloud Storage

# Configuration options:
# - Use existing project: glowctf-platform
# - Firestore rules: firestore.rules (default)
# - Firestore indexes: firestore.indexes.json (default)
# - Functions language: TypeScript
# - Use ESLint: Yes
# - Install dependencies: Yes
# - Public directory: dist
# - Single-page app: Yes
# - GitHub integration: Yes (optional)
```

### **Step 4: Configure Firebase Project Structure**

Your project structure should now include:

```
glowctf/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── functions/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── ... (your existing files)
```

### **Step 5: Set Up Firestore Database**

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select a location (choose closest to your users)

Configure Firestore rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Challenges are readable by authenticated users
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Leaderboard is readable by all authenticated users
    match /leaderboard/{entry} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### **Step 6: Configure Cloud Functions**

Update `functions/src/index.ts`:

```typescript
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
initializeApp();

const app = express();

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Import your existing server routes
import './routes/auth';
import './routes/challenges';
import './routes/chatbot';
import './routes/leaderboard';

// API endpoint
export const api = onRequest(app);

// Scheduled functions
export const updateLeaderboard = onSchedule('every 5 minutes', async (event) => {
  // Update leaderboard logic
});

export const cleanupSessions = onSchedule('every 24 hours', async (event) => {
  // Cleanup expired sessions
});
```

### **Step 7: Configure Environment Variables**

Set environment variables for Cloud Functions:

```bash
# Set environment variables
firebase functions:config:set \
  app.session_secret="your-super-secret-session-key" \
  ai.gemini_key="your-gemini-api-key" \
  ai.groq_key="your-groq-api-key" \
  ai.xai_key="your-xai-api-key" \
  email.sendgrid_key="your-sendgrid-key" \
  email.from="noreply@yourctf.com"

# For local development
firebase functions:config:get > functions/.runtimeconfig.json
```

### **Step 8: Configure Firebase Hosting**

Update `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log"
      ]
    }
  ],
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### **Step 9: Set Up Authentication**

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable desired providers:
   - **Email/Password** (recommended)
   - **Google** (optional)
   - **GitHub** (optional)

Configure authentication in your app:

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "glowctf-platform.firebaseapp.com",
  projectId: "glowctf-platform",
  storageBucket: "glowctf-platform.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### **Step 10: Build and Deploy**

```bash
# Build your application
npm run build

# Deploy to Firebase
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## 🗄️ Database Migration

### **Migrate from PostgreSQL/MySQL to Firestore**

Create a migration script:

```typescript
// scripts/migrate-to-firestore.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync('./path/to/serviceAccountKey.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrateData() {
  // Migrate users
  const users = await getExistingUsers(); // Your existing data source
  for (const user of users) {
    await db.collection('users').doc(user.id).set({
      email: user.email,
      username: user.username,
      score: user.score,
      createdAt: user.createdAt,
      // ... other fields
    });
  }

  // Migrate challenges
  const challenges = await getExistingChallenges();
  for (const challenge of challenges) {
    await db.collection('challenges').doc(challenge.id).set({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points,
      flag: challenge.flag,
      // ... other fields
    });
  }

  console.log('Migration completed!');
}

migrateData().catch(console.error);
```

Run the migration:

```bash
npx tsx scripts/migrate-to-firestore.ts
```

## 🔧 Advanced Configuration

### **Custom Domain**

1. In Firebase Console, go to **Hosting**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. SSL certificate will be automatically provisioned

### **Performance Optimization**

Configure caching in `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(html|json)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=3600"
          }
        ]
      }
    ]
  }
}
```

### **Security Rules**

Enhanced Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
    }
    
    // Challenges collection
    match /challenges/{challengeId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
    }
    
    // Submissions collection
    match /submissions/{submissionId} {
      allow read, write: if isAuthenticated() && 
        (isOwner(resource.data.userId) || isAdmin());
    }
    
    // Leaderboard collection
    match /leaderboard/{entry} {
      allow read: if isAuthenticated();
      allow write: if false; // Only server can write
    }
  }
}
```

## 📊 Monitoring and Analytics

### **Firebase Analytics**

Firebase automatically tracks:
- User engagement
- Screen views
- Custom events
- Crash reports

### **Custom Events**

Track custom events in your app:

```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

// Track challenge completion
logEvent(analytics, 'challenge_completed', {
  challenge_id: 'web-101',
  category: 'web',
  difficulty: 'easy',
  time_taken: 300
});

// Track AI chatbot usage
logEvent(analytics, 'chatbot_query', {
  provider: 'gemini',
  query_type: 'hint_request'
});
```

### **Performance Monitoring**

Enable performance monitoring:

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
// Performance monitoring is automatically enabled
```

## 💰 Pricing

### **Free Tier (Spark Plan)**
- **Hosting**: 10GB storage, 10GB/month transfer
- **Firestore**: 1GB storage, 50K reads, 20K writes, 20K deletes per day
- **Cloud Functions**: 125K invocations, 40K GB-seconds, 40K CPU-seconds per month
- **Authentication**: Unlimited users

### **Paid Tier (Blaze Plan)**
- **Pay-as-you-go** pricing
- **Hosting**: $0.026/GB storage, $0.15/GB transfer
- **Firestore**: $0.18/100K reads, $0.18/100K writes, $0.02/100K deletes
- **Cloud Functions**: $0.40/million invocations

## 🚨 Troubleshooting

### **Common Issues**

1. **Functions Deployment Fails**
   ```bash
   # Check Node.js version in functions directory
   cd functions
   node --version  # Should be >= 18
   
   # Update package.json engines
   "engines": {
     "node": "18"
   }
   ```

2. **Firestore Permission Denied**
   - Check security rules
   - Verify user authentication
   - Ensure proper user claims

3. **Environment Variables Not Working**
   ```bash
   # Check current config
   firebase functions:config:get
   
   # Set missing variables
   firebase functions:config:set app.key="value"
   ```

4. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### **Debug Mode**

Enable debug mode:

```bash
# Debug Firebase CLI
DEBUG=* firebase deploy

# Debug Cloud Functions
firebase functions:log
```

## 🔗 Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)

## ✅ Deployment Checklist

- [ ] Firebase project created
- [ ] Firebase CLI installed and authenticated
- [ ] Project initialized with Firebase
- [ ] Firestore database configured
- [ ] Authentication set up
- [ ] Cloud Functions configured
- [ ] Environment variables set
- [ ] Security rules configured
- [ ] Application built successfully
- [ ] Deployed to Firebase
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Analytics enabled
- [ ] Application tested in production

---

**Your GlowCTF platform is now live on Firebase! 🔥**

Next steps:
- [Configure AI providers](../ai-providers/)
- [Set up monitoring](../configuration/monitoring.md)
- [Customize your platform](../configuration/)