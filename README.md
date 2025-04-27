# GlowCTF Arena

A comprehensive Capture The Flag (CTF) cybersecurity training platform with AI chatbot assistance, multi-level challenges, and achievement system.

![GlowCTF Arena Screenshot](https://images.unsplash.com/photo-1585079542156-2755d9c8a094?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80)

## Features

- **Multi-Level Challenges**: From beginner-friendly to expert-level cybersecurity challenges across different categories.
- **AI Chatbot Assistance**: Get help from both OpenAI (GPT) and Anthropic (Claude) AI assistants.
- **Contest System**: Participate in time-limited CTF events or create your own as an admin.
- **Achievement System**: Earn badges and climb the global leaderboard as you solve challenges.
- **Practice Arena**: Sharpen your skills in a dedicated practice environment.
- **Team Management**: Collaborate with other hackers on challenges and contests.
- **Admin Tools**: Comprehensive tools for challenge and user management.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based authentication
- **AI Integration**: OpenAI (GPT) and Anthropic (Claude) APIs

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- OpenAI API key (optional for chatbot functionality)
- Anthropic API key (optional for chatbot functionality)

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/glowctf-arena.git
cd glowctf-arena
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/glowctf
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key (optional)
```

4. **Setup the database**

Make sure PostgreSQL is running and create a database:

```bash
createdb glowctf
```

5. **Run database migrations**

```bash
npm run db:push
```

6. **Seed the database with initial challenges**

```bash
npm run seed
```

7. **Start the development server**

```bash
npm run dev
```

The application should now be running at `http://localhost:5000`.

### Admin Account Setup

To create an admin account, use the registration form with the following admin code:

```
RDXUNK
```

### Deployment Instructions

#### Deploy to Replit

1. Fork the repository to your Replit account
2. Set up environment variables in the Replit secrets
3. Run `npm run build` and then `npm start`

#### Deploy to Other Platforms

The application can be deployed to any platform that supports Node.js applications:

1. **Build the application**

```bash
npm run build
```

2. **Start the production server**

```bash
npm start
```

## Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed information about the project's file structure.

## Team

- Abdul Mark Khan
- Debarjyoti Routh
- Rajat Ghorai
- Ramji Barman

## License

This project is licensed under the MIT License - see the LICENSE file for details.