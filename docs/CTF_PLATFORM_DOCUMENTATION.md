# 📘 GlowCTF Platform Core System Documentation

## 🎯 Overview

GlowCTF is a comprehensive Capture The Flag (CTF) platform designed for cybersecurity education and competition. The platform supports challenge creation, hosting, flag validation, and advanced scoring systems.

## 🏗️ System Architecture

### Database Schema
- **PostgreSQL/MySQL** dual support with Drizzle ORM
- **Challenges Table**: Core challenge data with enhanced metadata
- **Users Table**: User management and authentication
- **Completed Challenges**: Tracks user progress and scoring
- **Flag Submissions**: Detailed submission tracking and analytics
- **Challenge Files**: File attachment management
- **Badges**: Achievement system
- **Contests**: Competition management

### API Structure
- **RESTful APIs** with Express.js
- **Authentication**: Session-based with role management
- **File Upload**: Multer integration for challenge attachments
- **Real-time Features**: WebSocket support for live updates

## 🧩 1. Challenge Creation System

### Core Features
- ✅ **Multi-format Support**: Web, Crypto, Forensics, Pwn, Reverse Engineering
- ✅ **File Attachments**: ZIP files, documents, images up to 50MB
- ✅ **Dynamic Hosting**: Docker container support for live services
- ✅ **Metadata Management**: Tags, hints, difficulty levels
- ✅ **Access Control**: Admin-only creation with validation

### Challenge Structure
```typescript
interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  flag: string;
  author?: string;
  hints?: string[]; // Progressive unlock
  attachments?: File[];
  serviceUrl?: string; // For hosted challenges
  dockerImage?: string; // Container specification
  flagFormat?: string; // Regex validation
  maxAttempts?: number; // Attempt limits
  timeLimit?: number; // Time constraints
  firstBloodBonus?: number; // Extra points for first solver
  tags?: string[];
  isActive: boolean;
}
```

### API Endpoints

#### Create Challenge (Admin Only)
```http
POST /api/admin/challenges/enhanced
Content-Type: multipart/form-data

{
  "title": "Web Challenge 1",
  "description": "Find the hidden flag in this web application",
  "difficulty": "medium",
  "category": "web",
  "points": 500,
  "flag": "CTF{web_security_rocks}",
  "hints": ["Check the source code", "Look for hidden parameters"],
  "attachments": [file1.zip, file2.txt],
  "flagFormat": "CTF\\{[a-zA-Z0-9_]+\\}",
  "maxAttempts": 10,
  "firstBloodBonus": 100
}
```

#### Get Challenge Details
```http
GET /api/challenges/{id}/enhanced
Response: {
  "id": 1,
  "title": "Web Challenge 1",
  "description": "...",
  "attachments": [...],
  "stats": {
    "totalAttempts": 45,
    "uniqueSolvers": 12,
    "successRate": "26.67"
  }
}
```

## 📦 2. Challenge Hosting System

### Static Challenges
- **File Downloads**: Direct file serving from secure storage
- **Documentation**: README files and instructions
- **Multi-file Support**: ZIP archives with organized structure

### Dynamic Challenges
- **Docker Integration**: Containerized challenge environments
- **Port Management**: Automatic port allocation and mapping
- **Service Discovery**: Dynamic URL generation for hosted services
- **Auto-restart**: Container lifecycle management

### Hosting Configuration
```yaml
# docker-compose.yml for challenge hosting
version: '3.8'
services:
  web-challenge-1:
    build: ./challenges/web/challenge-1
    ports:
      - "8001:80"
    environment:
      - FLAG=CTF{dynamic_flag_here}
    restart: unless-stopped
    networks:
      - ctf-network
```

### Security Considerations
- **Network Isolation**: Separate Docker networks
- **Resource Limits**: CPU and memory constraints
- **Read-only Filesystems**: Prevent persistent changes
- **Non-root Execution**: Security-first container design

## 🏁 3. Advanced Flag Validation System

### Flag Types Supported

#### Static Flags
```typescript
// Simple string matching
flag: "CTF{static_flag_123}"
```

#### Dynamic Flags
```typescript
// User-specific flags (future enhancement)
flag: "CTF{user_${userId}_${timestamp}}"
```

#### Regex-based Validation
```typescript
// Pattern matching for flexible formats
flagFormat: "FLAG-[A-F0-9]{16}"
// Validates: FLAG-A1B2C3D4E5F6789A
```

### Validation Process
1. **Format Check**: Regex pattern validation if specified
2. **Exact Match**: String comparison with stored flag
3. **Attempt Tracking**: Record all submissions for analytics
4. **Rate Limiting**: Prevent brute force attacks
5. **Duplicate Prevention**: Block repeat submissions

### API Implementation
```http
POST /api/challenges/{id}/submit/enhanced
{
  "flag": "CTF{submitted_flag}",
  "startTime": 1640995200000
}

Response (Success):
{
  "success": true,
  "message": "Congratulations! Flag is correct.",
  "basePoints": 500,
  "bonusPoints": 150,
  "firstBloodBonus": 100,
  "totalPoints": 750,
  "timeToSolve": 1847,
  "newBadges": [...]
}

Response (Failure):
{
  "success": false,
  "message": "Incorrect flag. Try again!"
}
```

## 🧮 4. Advanced Scoring System

### Scoring Components

#### Base Points
- **Fixed Value**: Set per challenge based on difficulty
- **Difficulty Multipliers**: Easy (100-300), Medium (400-700), Hard (800-1500)

#### Time-based Bonuses
```typescript
const calculateTimeBonus = (timeToSolve: number, basePoints: number) => {
  if (timeToSolve < 300) return Math.floor(basePoints * 0.3);      // <5 min: 30%
  if (timeToSolve < 600) return Math.floor(basePoints * 0.2);      // <10 min: 20%
  if (timeToSolve < 1800) return Math.floor(basePoints * 0.1);     // <30 min: 10%
  return 0;
};
```

#### First Blood Bonus
- **Extra Points**: Configurable bonus for first solver
- **Recognition**: Special badge and leaderboard highlighting
- **Motivation**: Encourages quick problem-solving

#### Dynamic Scoring (Future Enhancement)
```typescript
// Points decrease as more players solve
const dynamicPoints = basePoints * (1 - (solveCount * 0.05));
```

### Scoring Database Schema
```sql
CREATE TABLE completed_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  challenge_id INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  time_to_solve INTEGER, -- seconds
  points_awarded INTEGER NOT NULL,
  base_points INTEGER NOT NULL,
  bonus_points INTEGER DEFAULT 0,
  first_blood_bonus INTEGER DEFAULT 0
);
```

### Leaderboard Calculation
```typescript
const calculateLeaderboard = async () => {
  return await db
    .select({
      userId: users.id,
      username: users.username,
      totalScore: sql<number>`SUM(${completedChallenges.pointsAwarded})`,
      challengesSolved: sql<number>`COUNT(${completedChallenges.id})`,
      lastSolve: sql<Date>`MAX(${completedChallenges.completedAt})`
    })
    .from(users)
    .leftJoin(completedChallenges, eq(users.id, completedChallenges.userId))
    .groupBy(users.id, users.username)
    .orderBy(desc(sql`SUM(${completedChallenges.pointsAwarded})`));
};
```

## 📊 5. Analytics & Monitoring

### Challenge Analytics
- **Solve Rates**: Success percentage per challenge
- **Time Statistics**: Average solve times and distributions
- **Difficulty Assessment**: Data-driven difficulty validation
- **Popular Categories**: Usage patterns and preferences

### User Analytics
- **Progress Tracking**: Individual user journey mapping
- **Skill Assessment**: Category-based performance analysis
- **Engagement Metrics**: Session duration and return rates
- **Achievement Tracking**: Badge progression and milestones

### Platform Metrics
- **System Performance**: Response times and error rates
- **Resource Usage**: Server load and capacity planning
- **Security Events**: Failed attempts and suspicious activity
- **Content Quality**: Challenge feedback and ratings

## 🔒 6. Security Features

### Input Validation
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Input sanitization and output encoding
- **File Upload Security**: Type validation and size limits
- **Rate Limiting**: API endpoint protection

### Authentication & Authorization
- **Session Management**: Secure session handling
- **Role-based Access**: Admin, user, and guest permissions
- **Password Security**: Bcrypt hashing with salt
- **CSRF Protection**: Token-based request validation

### Infrastructure Security
- **Container Isolation**: Docker security best practices
- **Network Segmentation**: Isolated challenge environments
- **Monitoring**: Real-time security event detection
- **Backup Strategy**: Regular data backups and recovery plans

## 🚀 7. Deployment & Scaling

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-org/glowctf.git
cd glowctf

# Install dependencies
npm install

# Setup database
npm run db:migrate

# Start development server
npm run dev
```

### Production Deployment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=glowctf
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### Scaling Considerations
- **Load Balancing**: Multiple application instances
- **Database Optimization**: Connection pooling and query optimization
- **CDN Integration**: Static asset delivery
- **Caching Strategy**: Redis for session and data caching

## 📚 8. API Reference

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/logout` - Session termination

### Challenge Management
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/{id}` - Get challenge details
- `POST /api/admin/challenges` - Create challenge (admin)
- `PUT /api/admin/challenges/{id}` - Update challenge (admin)
- `DELETE /api/admin/challenges/{id}` - Delete challenge (admin)

### Flag Submission
- `POST /api/challenges/{id}/submit` - Submit flag
- `GET /api/challenges/{id}/hints` - Get progressive hints
- `GET /api/user/progress` - User progress tracking

### Leaderboard & Statistics
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/user/{id}/stats` - User statistics
- `GET /api/challenges/{id}/stats` - Challenge analytics

## 🛠️ 9. Implementation Guide

### Step 1: Database Migration
```bash
# Add new tables for enhanced features
npm run db:generate
npm run db:migrate
```

### Step 2: Install Dependencies
```bash
# Add Docker support
npm install dockerode @types/dockerode

# Add file upload support
npm install multer @types/multer

# Add additional utilities
npm install archiver unzipper
```

### Step 3: Configure Environment
```env
# Add to .env file
CHALLENGE_BASE_URL=http://localhost
DOCKER_SOCKET_PATH=/var/run/docker.sock
UPLOAD_MAX_SIZE=52428800  # 50MB
CHALLENGE_TIMEOUT=1800000  # 30 minutes
```

### Step 4: Setup Challenge Directory Structure
```
challenges/
├── web/
│   ├── sql-injection-basic/
│   │   ├── Dockerfile
│   │   ├── app/
│   │   └── README.md
│   └── xss-reflected/
├── crypto/
│   ├── rsa-weak-keys/
│   └── caesar-cipher/
├── forensics/
│   ├── network-analysis/
│   └── memory-dump/
├── pwn/
│   ├── buffer-overflow-1/
│   └── format-string/
└── reverse/
    ├── basic-crackme/
    └── android-app/
```

### Step 5: Enable Enhanced Routes
```typescript
// In server/index.ts
import { setupEnhancedChallengeRoutes } from './routes/enhanced-challenge-routes';

// Add after existing routes
setupEnhancedChallengeRoutes(app);
```

### Step 6: Configure Docker Network
```bash
# Create CTF network
docker network create ctf-network

# Start challenge hosting
docker-compose -f docker/challenge-hosting/docker-compose.challenges.yml up -d
```

## 🔧 10. Challenge Creation Workflow

### For Static Challenges
1. **Create Challenge Directory**
   ```bash
   mkdir -p challenges/crypto/caesar-cipher
   cd challenges/crypto/caesar-cipher
   ```

2. **Add Challenge Files**
   ```
   caesar-cipher/
   ├── challenge.txt
   ├── encrypted_flag.txt
   ├── hint.txt
   └── solution.py
   ```

3. **Create via Admin Panel**
   - Navigate to `/admin/challenges`
   - Fill challenge form
   - Upload files as attachments
   - Set flag: `CTF{caesar_is_weak_crypto}`

### For Dynamic Challenges
1. **Create Dockerfile**
   ```dockerfile
   FROM nginx:alpine
   COPY app/ /usr/share/nginx/html/
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Deploy**
   ```bash
   # Via API
   POST /api/admin/challenges/123/build
   POST /api/admin/challenges/123/deploy
   ```

3. **Access Challenge**
   ```bash
   # Get access URL
   GET /api/challenges/123/access
   # Returns: {"url": "http://localhost:8001"}
   ```

## 📊 11. Monitoring & Analytics

### Challenge Performance Metrics
```sql
-- Most popular challenges
SELECT c.title, c.category, COUNT(cc.id) as solve_count
FROM challenges c
LEFT JOIN completed_challenges cc ON c.id = cc.challenge_id
GROUP BY c.id, c.title, c.category
ORDER BY solve_count DESC;

-- Average solve times by difficulty
SELECT c.difficulty, AVG(cc.time_to_solve) as avg_time
FROM challenges c
JOIN completed_challenges cc ON c.id = cc.challenge_id
WHERE cc.time_to_solve IS NOT NULL
GROUP BY c.difficulty;

-- User progress tracking
SELECT u.username, COUNT(cc.id) as challenges_solved, SUM(cc.points_awarded) as total_points
FROM users u
LEFT JOIN completed_challenges cc ON u.id = cc.user_id
GROUP BY u.id, u.username
ORDER BY total_points DESC;
```

### System Health Monitoring
```typescript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      docker: await checkDockerHealth(),
      challenges: challengeHostingService.getRunningChallenges().length
    }
  };
  res.json(health);
});
```

## 🚀 12. Production Deployment

### Docker Production Setup
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./uploads:/app/uploads
    ports:
      - "80:5000"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    ports:
      - "443:443"
    depends_on:
      - app
```

### Security Hardening
```bash
# Firewall rules
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000:8200/tcp  # Challenge ports
ufw enable

# Docker security
echo '{"live-restore": true, "userland-proxy": false}' > /etc/docker/daemon.json
systemctl restart docker
```

### Backup Strategy
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump $DATABASE_URL > backups/db_$DATE.sql

# Challenge files backup
tar -czf backups/challenges_$DATE.tar.gz challenges/

# Upload files backup
tar -czf backups/uploads_$DATE.tar.gz uploads/

# Cleanup old backups (keep 30 days)
find backups/ -name "*.sql" -mtime +30 -delete
find backups/ -name "*.tar.gz" -mtime +30 -delete
```

This comprehensive documentation provides everything needed to implement and deploy the enhanced CTF platform with dynamic challenge hosting, advanced scoring, and robust monitoring capabilities.
