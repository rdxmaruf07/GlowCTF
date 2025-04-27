# GlowCTF Arena - Project Structure

## Overview
GlowCTF Arena is a comprehensive Capture The Flag (CTF) cybersecurity training platform built with Node.js, React, and PostgreSQL. The platform features user authentication, team-based collaborative CTF challenges, daily rotating challenges, integrated AI chatbot assistance, leaderboards, user profiles, practice environments, and administrative tools.

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based authentication
- **AI Integration**:
  - OpenAI (GPT models)
  - Anthropic (Claude models)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter

## Project Structure

### Root Structure
```
├── client/              # Frontend code (React)
├── server/              # Backend code (Node.js/Express)
├── shared/              # Shared code (types, schemas)
├── attached_assets/     # Static assets
├── components.json      # shadcn UI configuration
├── drizzle.config.ts    # Drizzle ORM configuration
├── package.json         # Project dependencies
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

### Client Structure
```
client/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin panel components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # shadcn UI components
│   ├── hooks/           # Custom React hooks
│   │   ├── use-auth.tsx         # Authentication hook
│   │   ├── use-leaderboard.tsx  # Leaderboard data hook
│   │   ├── use-mobile.tsx       # Responsive design hook
│   │   └── use-toast.ts         # Toast notifications hook
│   ├── lib/             # Utility functions
│   │   ├── constants.ts         # Application constants
│   │   ├── protected-route.tsx  # Route protection component
│   │   ├── queryClient.ts       # TanStack Query configuration
│   │   └── utils.ts             # Utility functions
│   ├── pages/           # Application pages
│   │   ├── admin-page.tsx       # Admin dashboard
│   │   ├── auth-page.tsx        # Authentication page
│   │   ├── challenges-page.tsx  # Challenges list
│   │   ├── chatbot-page.tsx     # AI chatbot interface
│   │   ├── dashboard-page.tsx   # User dashboard
│   │   ├── leaderboard-page.tsx # Leaderboard
│   │   ├── not-found.tsx        # 404 page
│   │   ├── practice-page.tsx    # Practice arena
│   │   ├── profile-page.tsx     # User profile
│   │   └── team-page.tsx        # Team management
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles
│   └── main.tsx         # Application entry point
└── index.html           # HTML template
```

### Server Structure
```
server/
├── routes/             # API route handlers
│   ├── challenge-routes.ts  # Challenge API endpoints
│   └── contest-routes.ts    # Contest API endpoints
├── scripts/            # Utility scripts
│   ├── add-challenges.ts    # Seed challenges to database
│   └── db-migration.ts      # Database migration script
├── services/           # Business logic services
│   └── chatbot.ts           # AI chatbot service
├── admin.ts            # Admin authentication middleware
├── auth.ts             # Authentication setup
├── db.ts               # Database connection
├── index.ts            # Server entry point
├── routes.ts           # API routes registration
├── storage.ts          # Data storage interface
└── vite.ts             # Vite integration for serving frontend
```

### Shared Structure
```
shared/
└── schema.ts           # Database schema and types
```

## Key Features

### Authentication System
- User registration and login
- Role-based access control (user, hacker, admin)
- Protected routes
- Admin registration with secret code "RDXUNK"

### Challenge Management
- Multiple difficulty levels (easy, medium, hard)
- Various categories (Web, Cryptography, Forensics, etc.)
- Flag submission and verification
- Challenge completion tracking

### Contest System
- Admin can create custom contests
- Time-limited CTF events
- Contest-specific challenges
- External contest support

### AI Integration
- OpenAI (GPT) and Anthropic (Claude) chatbot assistance
- API key management in database
- Chat history storage

### Leaderboard & Achievements
- Global ranking system
- Badge and achievement system
- User statistics tracking

## Database Schema

The application uses the following main database tables:
- `users`: User accounts and authentication
- `challenges`: CTF challenges
- `completed_challenges`: Record of challenges completed by users
- `badges`: Achievement badges
- `user_badges`: Badges earned by users
- `chatbot_keys`: API keys for AI providers
- `chat_history`: History of AI conversations
- `contests`: CTF contest events
- `contest_challenges`: Challenges associated with contests
- `external_flag_submissions`: Flag submissions for external contests