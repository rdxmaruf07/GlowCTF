# 🌟 GlowCTF

<div align="center">

**A Modern Capture The Flag Platform with AI-Powered Assistance**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [📱 Usage](#-usage)
- [🔧 Development](#-development)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 **Core Platform**
- **Multi-Level Challenges**: Progressive difficulty from beginner to expert
- **Multiple Categories**: Web Security, Cryptography, Forensics, Reverse Engineering, and more
- **Real-time Scoring**: Dynamic leaderboard with instant updates
- **Achievement System**: Unlock badges and milestones as you progress

### 🤖 **AI-Powered Assistant**
- **Smart Chatbot**: Get hints and guidance with beautiful split-text animations
- **Multiple AI Providers**: Support for Gemini, Groq, and xAI (Grok)
- **Context-Aware Help**: AI understands CTF challenges and provides relevant assistance
- **Clean Interface**: Minimalist design focused on the conversation

### 🏆 **Competition Features**
- **Contest System**: Time-limited events with special challenges
- **Team Collaboration**: Work together to solve complex challenges
- **Global Leaderboard**: Compete with players worldwide
- **Progress Tracking**: Detailed statistics and performance analytics

### 🔒 **Security & Management**
- **Secure Authentication**: Robust user management with session security
- **Admin Dashboard**: Complete platform administration tools
- **Challenge Hosting**: Docker-based isolated challenge environments
- **API Key Management**: Secure storage and management of AI provider keys

---

## 🛠️ Technology Stack

<div align="center">

| **Frontend** | **Backend** | **Database** | **AI Integration** |
|:------------:|:-----------:|:------------:|:------------------:|
| ⚛️ React 18 | 🟢 Node.js | 🐘 PostgreSQL | 🧠 Google Gemini |
| 📝 TypeScript | 🚀 Express.js | 🐬 MySQL | 🚀 Groq |
| 🎨 TailwindCSS | 🗄️ Drizzle ORM | 🌐 Neon Serverless | 🤖 xAI (Grok) |
| 🧩 shadcn/ui | 🔐 Passport.js | 📊 Connection Pooling | 🎭 Multiple Providers |
| 🎬 Framer Motion | 🔄 Session Management | 🔒 SSL/TLS Security | 🔑 API Key Management |

</div>

---

## 📁 Project Structure

```
GlowCTF_2/
├── 📁 client/                     # React frontend application
│   ├── 📄 index.html              # Main HTML entry point
│   └── 📁 src/
│       ├── 📄 App.tsx              # Main React component
│       ├── 📄 main.tsx             # React entry point
│       ├── 📄 index.css            # Global styles
│       ├── 📁 components/          # Reusable UI components
│       │   ├── 📁 admin/           # Admin panel components
│       │   │   ├── 📄 add-challenge-form.tsx
│       │   │   ├── 📄 api-key-management.tsx
│       │   │   ├── 📄 challenge-management.tsx
│       │   │   ├── 📄 contest-management.tsx
│       │   │   └── 📄 user-management.tsx
│       │   ├── 📁 badges/          # Badge system components
│       │   │   └── 📄 badge-display.tsx
│       │   ├── 📁 challenges/      # Challenge-related components
│       │   │   ├── 📄 challenge-card.tsx
│       │   │   ├── 📄 picoctf-challenge-list.tsx
│       │   │   ├── 📄 platform-ctf-challenge-list.tsx
│       │   │   ├── 📄 team-collaboration.tsx
│       │   │   └── 📄 tryhackme-challenge-list.tsx
│       │   ├── 📁 chatbot/         # AI chatbot components
│       │   │   ├── 📄 app-sidebar.tsx
│       │   │   ├── 📄 artifact-viewer.tsx
│       │   │   ├── 📄 chat-header.tsx
│       │   │   ├── 📄 chat-input.tsx
│       │   │   ├── 📄 chat-interface.tsx
│       │   │   ├── 📄 chat-overview.tsx
│       │   │   ├── 📄 chat-sidebar.tsx
│       │   │   ├── 📄 chat.tsx
│       │   │   ├── 📄 chatbot-demo.tsx
│       │   │   ├── 📄 enhanced-chat-input.tsx
│       │   │   ├── 📄 enhanced-chat.tsx
│       │   │   ├── 📄 enhanced-markdown-simple.tsx
│       │   │   ├── 📄 enhanced-markdown.tsx
│       │   │   ├── 📄 enhanced-message-bubble-fixed.tsx
│       │   │   ├── 📄 enhanced-message-bubble.tsx
│       │   │   ├── 📄 greeting.tsx
│       │   │   ├── 📄 improved-chat.tsx
│       │   │   ├── 📄 markdown-test.tsx
│       │   │   ├── 📄 markdown.tsx
│       │   │   ├── 📄 message-bubble.tsx
│       │   │   ├── 📄 message.tsx
│       │   │   ├── 📄 messages.tsx
│       │   │   ├── 📄 multimodal-input.tsx
│       │   │   ├── 📄 preview-message.tsx
│       │   │   ├── 📄 sidebar-history-item.tsx
│       │   │   ├── 📄 sidebar-history.tsx
│       │   │   ├── 📄 sidebar-user-nav.tsx
│       │   │   ├── 📄 simple-chat.tsx
│       │   │   ├── 📄 test-chat.tsx
│       │   │   └── 📄 typing-text.tsx
│       │   ├── 📁 dashboard/       # Dashboard components
│       │   │   ├── 📄 active-challenges.tsx
│       │   │   ├── 📄 recent-activity.tsx
│       │   │   └── 📄 stats-overview.tsx
│       │   ├── 📁 landing/         # Landing page components
│       │   │   ├── 📄 animated-background.tsx
│       │   │   ├── 📄 cta-section.tsx
│       │   │   ├── 📄 features-section.tsx
│       │   │   ├── 📄 global-activity-map.tsx
│       │   │   ├── 📄 hero-section.tsx
│       │   │   ├── 📄 landing-nav.tsx
│       │   │   ├── 📄 live-challenges.tsx
│       │   │   ├── 📄 live-leaderboard.tsx
│       │   │   ├── 📄 live-notifications.tsx
│       │   │   ├── 📄 realtime-stats.tsx
│       │   │   └── 📄 stats-section.tsx
│       │   ├── 📁 leaderboard/     # Leaderboard components
│       │   │   ├── 📄 leaderboard-table.tsx
│       │   │   └── 📄 leaderboard-top-users.tsx
│       │   ├── 📁 milestones/      # Milestone system
│       │   │   └── 📄 milestone-display.tsx
│       │   ├── 📁 practice/        # Practice mode components
│       │   │   ├── 📄 practice-card.tsx
│       │   │   └── 📄 vulnerable-page.tsx
│       │   ├── 📁 profile/         # User profile components
│       │   │   ├── 📄 completed-challenges.tsx
│       │   │   ├── 📄 profile-header.tsx
│       │   │   └── 📄 profile-stats.tsx
│       │   ├─�� 📄 secret-truth-page.tsx
│       │   └── 📁 ui/              # shadcn/ui components
│       │       ├── 📄 accordion.tsx
│       │       ├── 📄 advanced-animations.tsx
│       │       ├── 📄 alert-dialog.tsx
│       │       ├── 📄 alert.tsx
│       │       ├── 📄 animated-page.tsx
│       │       ├── 📄 animation-selector.tsx
│       │       ├── 📁 animations/
│       │       │   └── 📄 index.ts
│       │       ├── 📄 aspect-ratio.tsx
│       │       ├── 📄 avatar.tsx
│       │       ├── 📄 badge.tsx
│       │       ├── 📄 breadcrumb.tsx
│       │       ├── 📄 button.tsx
│       │       ├── 📄 calendar.tsx
│       │       ├── 📄 card.tsx
│       │       ├── 📄 carousel.tsx
│       │       ├── 📄 chart.tsx
│       │       ├── 📄 checkbox.tsx
│       │       ├── 📄 collapsible.tsx
│       │       ├── 📄 coming-soon.tsx
│       │       ├── 📄 command.tsx
│       │       ├── 📄 context-menu.tsx
│       │       ├── 📄 dialog.tsx
│       │       ├── 📄 drawer.tsx
│       │       ├── 📄 dropdown-menu.tsx
│       │       ├── 📄 enhanced-scroll.tsx
│       │       ├── 📄 form.tsx
│       │       ├── 📄 hover-card.tsx
│       │       ├── 📄 input-otp.tsx
│       │       ├── 📄 input.tsx
│       │       ├── 📄 label.tsx
│       │       ├── 📄 menubar.tsx
│       │       ├── 📄 navigation-menu.tsx
│       │       ├── 📄 pagination.tsx
│       │       ├── 📄 popover.tsx
│       │       ├── 📄 progress.tsx
│       │       ├── 📄 radio-group.tsx
│       │       ├── 📄 reactbits-animations.tsx
│       │       ├── 📄 resizable.tsx
│       │       ├── 📄 scroll-area.tsx
│       │       ├── 📄 select.tsx
│       │       ├── 📄 separator.tsx
│       │       ├── 📄 sheet.tsx
│       │       ├── 📄 sidebar.tsx
│       │       ├── 📄 skeleton.tsx
│       │       ├── 📄 slider.tsx
│       │       ├── 📄 switch.tsx
│       │       ├── 📄 table.tsx
│       │       ├── 📄 tabs.tsx
│       │       ├── 📄 textarea.tsx
│       │       ├── �� toast.tsx
│       │       ├── 📄 toaster.tsx
│       │       ├── 📄 toggle-group.tsx
│       │       ├── 📄 toggle.tsx
│       │       └── 📄 tooltip.tsx
│       ├── 📁 contexts/            # React contexts
│       │   └── 📄 animation-context.tsx
│       ├── 📁 hooks/               # Custom React hooks
│       │   ├── 📄 use-auth.tsx
│       │   ├── 📄 use-leaderboard.tsx
│       │   ├── 📄 use-messages.tsx
│       │   ├── 📄 use-mobile.tsx
│       │   ├── 📄 use-scroll-to-bottom.tsx
│       │   └── 📄 use-toast.ts
│       ├── 📁 lib/                 # Utility libraries
│       │   ├── 📄 animations.ts
│       │   ├── 📄 constants.ts
│       │   ├── 📄 queryClient.ts
│       │   └── 📄 utils.ts
│       ├── 📁 pages/               # Application pages
│       │   ├── 📁 __tests__/       # Page tests
│       │   │   ├── 📄 milestones-page.test.tsx
│       │   │   └── 📄 profile-page.test.tsx
│       │   ├── 📄 admin-page.tsx
│       │   ├── 📄 animation-demo.tsx
│       │   ├── 📄 api-docs-page.tsx
│       │   ├── 📄 auth-page.tsx
│       │   ├── 📄 blog-page.tsx
│       │   ├── 📄 challenges-page.tsx
│       │   ├── 📄 chatbot-demo-page.tsx
│       │   ├── 📄 chatbot-page.tsx
│       │   ├── 📄 coming-soon-page.tsx
│       │   ├── 📄 contributors-page.tsx
│       │   ├── 📄 cookies-page.tsx
│       │   ├── 📄 ctf-platforms-page.tsx
│       │   ├── 📄 curriculum-page.tsx
│       │   ├── 📄 dashboard-page.tsx
│       │   ├── 📄 discord-page.tsx
│       │   ├── 📄 docs-page.tsx
│       │   ├── 📄 educators-page.tsx
│       │   ├── 📄 events-page.tsx
│       │   ├── 📄 forums-page.tsx
│       │   ├── 📄 landing-page.tsx
│       │   ├── 📄 leaderboard-page.tsx
│       │   ├── 📄 milestones-page.tsx
│       │   ├── 📄 not-found.tsx
│       │   ├── 📄 partnerships-page.tsx
│       │   ├── 📄 practice-page.tsx
│       │   ├── 📄 privacy-page.tsx
│       │   ├── 📄 profile-page.tsx
│       │   ├── 📄 research-page.tsx
│       │   ├── 📄 team-page.tsx
│       │   ├── 📄 terms-page.tsx
│       │   └── 📄 tutorials-page.tsx
│       ├── 📁 styles/              # CSS styles
│       │   ├── 📄 chatbot-fix.css
│       │   ├── 📄 chatbot.css
│       │   └── 📄 enhanced-chatbot.css
│       └── 📁 utils/               # Utility functions
│           └── 📄 animation-helper.ts
├── 📁 server/                      # Node.js backend
│   ├── 📄 index.ts                 # Server entry point
│   ├── 📄 admin.ts                 # Admin functionality
│   ├── 📄 auth.ts                  # Authentication logic
│   ├── 📄 database.ts              # Database configuration
│   ├── 📄 db.ts                    # Database connection
│   ├── 📄 mysql-db.ts              # MySQL specific database
│   ├── 📄 mysql-storage.ts         # MySQL storage layer
│   ├── 📄 storage.ts               # Storage abstraction
│   ├── 📄 vite.ts                  # Vite integration
│   ├── 📁 scripts/                 # Database and utility scripts
│   │   ├── 📄 add-badges.ts
│   │   ├── 📄 add-challenges.ts
│   │   ├── 📄 add-sample-data.ts
│   │   ├── 📄 db-help.js
│   │   ├── 📄 db-migration.ts
│   │   ├── 📄 interactive-db-switch.js
│   │   ├── 📄 mysql-migration.ts
│   │   ├── 📄 run-migration.sh
│   │   ├── 📄 run-seed.sh
│   │   ├── 📄 switch-database.js
│   │   ├── 📄 test-database-selection.js
│   │   ├── 📄 test-db-connection.js
│   │   ├── 📄 test-gemini.ts
│   │   ├── 📄 test-mysql-connection.js
���   │   └── 📄 test-pg-connection.js
│   └── 📁 services/                # Business logic services
│       ├── 📄 challenge-hosting-service.ts
│       └── 📄 chatbot.ts
├── 📁 shared/                      # Shared types and schemas
│   ├── 📄 mysql-schema.ts          # MySQL database schema
│   └── 📄 schema.ts                # PostgreSQL database schema
├── 📁 migrations/                  # Database migrations
│   ├── 📄 0000_strong_blackheart.sql
│   └── 📁 meta/
│       ├── 📄 _journal.json
│       └── 📄 0000_snapshot.json
├── 📁 docker/                      # Docker configurations
│   └── 📁 challenge-hosting/
│       └── 📄 docker-compose.challenges.yml
├── 📁 docs/                        # Documentation
│   ├── 📄 CHATBOT_FIXES_AND_IMPROVEMENTS.md
│   ├── 📄 CTF_PLATFORM_DOCUMENTATION.md
│   ├── 📄 CTF.txt
│   ├── 📄 DATABASE_SWITCHING.md
│   ├── 📄 ENHANCED_CHATBOT_FEATURES.md
│   ├── 📄 MYSQL_CONNECTION_FIX.md
│   ├── 📄 MYSQL_SETUP.md
│   ├── �� PROJECT_STRUCTURE.md
│   ├── 📄 REAL_DATA_IMPLEMENTATION.md
│   └── 📄 REALTIME_FEATURES.md
├── 📁 attached_assets/             # Project assets
│   ├── 📄 localhost_5000_chatbot (1).png
│   └── 📄 localhost_5000_chatbot.png
├── 📁 .qodo/                       # Qodo configuration
├── 📄 .env                         # Environment variables
├── 📄 package.json                 # Node.js dependencies
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 vite.config.ts               # Vite configuration
├── 📄 tailwind.config.ts           # TailwindCSS configuration
├── 📄 postcss.config.js            # PostCSS configuration
├── 📄 drizzle.config.ts            # Drizzle ORM configuration
├── 📄 components.json              # shadcn/ui configuration
└── 📄 README.md                    # This file
```

---

## 🚀 Quick Start

### 📋 Prerequisites

```bash
# Required
Node.js >= 18.0.0
npm >= 8.0.0

# Database (choose one)
PostgreSQL >= 13.0
# OR
MySQL >= 8.0

# AI Provider API Keys (at least one)
Google Gemini API Key
Groq API Key
xAI API Key
```

### ⚡ Installation

1. **📥 Clone the Repository**
```bash
git clone https://github.com/rdxmaruf07/GlowCTF.git
cd GlowCTF
```

2. **📦 Install Dependencies**
```bash
npm install
```

3. **⚙️ Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Environment Variables:**
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/glowctf
# OR for MySQL
MYSQL_DATABASE_URL=mysql://user:password@localhost:3306/glowctf

# Security
SESSION_SECRET=your-super-secret-session-key

# AI Provider Keys (add at least one)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
XAI_API_KEY=your-xai-api-key

# Optional: Email Configuration
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourctf.com
```

4. **💾 Database Setup**

**For PostgreSQL:**
```bash
# Create database
createdb glowctf

# Run migrations
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

**For MySQL:**
```bash
# Create database and user
mysql -u root -p << EOF
CREATE DATABASE glowctf;
CREATE USER 'glowctf_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON glowctf.* TO 'glowctf_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Run migrations
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

5. **🚀 Start Development**
```bash
# Start development server
npm run dev

# The application will be available at:
# http://localhost:5000
```

---

## 📱 Usage

### 🎮 **For Players**

1. **🔐 Register/Login**: Create your account or sign in
2. **🎯 Browse Challenges**: Explore challenges by category and difficulty
3. **🤖 Get AI Help**: Use the chatbot for hints and guidance
4. **🏆 Track Progress**: Monitor your achievements and ranking
5. **👥 Join Teams**: Collaborate with other players

### 👨‍💼 **For Administrators**

1. **📊 Admin Dashboard**: Access comprehensive platform management
2. **➕ Add Challenges**: Create and configure new challenges
3. **🏁 Manage Contests**: Set up time-limited competitions
4. **👥 User Management**: Monitor and manage user accounts
5. **🔑 API Configuration**: Manage AI provider settings

---

## 🔧 Development

### 🛠️ **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npm run db:push         # Apply schema changes
npm run db:health       # Check database connection
npm run db:switch       # Interactive database switching
npm run db:help         # Database help

# Database Testing
npm run test:pg-connection      # Test PostgreSQL connection
npm run test:mysql-connection   # Test MySQL connection
npm run test:db-connection      # Test current database connection

# Code Quality
npm run check           # TypeScript type checking
```

### 🔌 **API Endpoints**

```bash
# Authentication
POST /api/auth/login     # User login
POST /api/auth/register  # User registration
POST /api/auth/logout    # User logout

# Challenges
GET  /api/challenges     # List challenges
POST /api/challenges     # Create challenge (admin)
POST /api/challenges/:id/submit  # Submit flag

# Chatbot
POST /api/chatbot/completion     # AI chat completion
GET  /api/chatbot/keys          # Get API keys
POST /api/chatbot/keys          # Add API key

# Leaderboard
GET  /api/leaderboard    # Get rankings
GET  /api/user/stats     # User statistics

# Admin
GET  /api/admin/users    # Get all users (admin)
POST /api/admin/contests # Create contest (admin)
```

### 🎨 **Features Showcase**

#### 🤖 **AI Chatbot with Split-Text Animation**
- Beautiful character-by-character text reveal animation
- Clean, minimalist interface focused on conversation
- Support for multiple AI providers with seamless switching
- Context-aware responses for CTF challenges

#### 🎯 **Challenge System**
- Progressive difficulty levels
- Multiple challenge categories
- Real-time flag validation
- Detailed writeups and solutions

#### 🏆 **Achievement System**
- Unlock badges for various accomplishments
- Track progress across different skill areas
- Leaderboard rankings with detailed statistics
- Milestone celebrations with animations

---

## 🚀 Deployment

### 🌐 **Production Deployment**

1. **🏗️ Build the Application**
```bash
npm run build
```

2. **🔧 Configure Production Environment**
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL=your-production-db-url
export SESSION_SECRET=your-production-secret
```

3. **🚀 Start Production Server**
```bash
npm start
```

### 🐳 **Docker Deployment**

```bash
# Build Docker image
docker build -t glowctf .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL=your-db-url \
  -e SESSION_SECRET=your-secret \
  glowctf
```

### ☁️ **Cloud Platforms**

**Vercel/Netlify:**
- Connect your GitHub repository
- Configure environment variables
- Deploy automatically on push

**Railway/Render:**
- Import from GitHub
- Set environment variables
- Deploy with one click

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **🍴 Fork the Repository**
2. **🌿 Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **💻 Make Your Changes**
4. **✅ Test Your Changes**
   ```bash
   npm run check
   npm run build
   ```
5. **📝 Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **🚀 Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **🔄 Open a Pull Request**

### 📋 **Contribution Guidelines**

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **🎨 UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **🎬 Animations**: [Framer Motion](https://www.framer.com/motion/)
- **🤖 AI Providers**: Google Gemini, Groq, xAI
- **🎯 Inspiration**: Various CTF platforms and cybersecurity communities

---

<div align="center">

**Made with ❤️ for the cybersecurity community**

[🌟 Star this repo](https://github.com/yourusername/glowctf) • [🐛 Report Bug](https://github.com/yourusername/glowctf/issues) • [💡 Request Feature](https://github.com/yourusername/glowctf/issues)

</div>
