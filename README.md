# 🎮 GlowCTF

A comprehensive Capture The Flag (CTF) cybersecurity training platform with AI chatbot assistance, multi-level challenges, and achievement system.

![GlowCTF Screenshot](generated-icon.png)

## ✨ Features

- **🎯 Multi-Level Challenges**: From beginner-friendly to expert-level cybersecurity challenges across different categories
- **🤖 AI Chatbot Assistance**: Get help from multiple AI providers including:
  - 🎭 OpenAI (GPT models)
  - 🧠 Anthropic (Claude models)
  - 🔍 Google Gemini
  - 🤝 Together AI
  - 🎯 AIML API
  - 🚀 OpenRouter

- **🏆 Achievement System**: Earn badges and climb the global leaderboard
- **🔄 Contest System**: Participate in time-limited CTF events
- **🔒 Secure Environment**: Robust authentication and session management
- **📱 Responsive Design**: Works seamlessly across desktop and mobile devices

## 🛠️ Tech Stack

- **🎨 Frontend**: 
  - ⚛️ React with Vite
  - 🎨 TailwindCSS for styling
  - 🧩 shadcn/ui components
  - 📝 TypeScript for type safety

- **⚙️ Backend**: 
  - 🟢 Node.js with Express
  - 📝 TypeScript
  - 🗄️ Drizzle ORM for database operations

- **💾 Database**: 
  - 🐘 PostgreSQL (Neon Serverless)
  - 🐬 MySQL (alternative option)
  - 🗄️ Drizzle ORM for type-safe database operations

- **🔐 Authentication**: 
  - 🛡️ Passport.js
  - 🔑 Session-based authentication

## 📚 Documentation

For detailed documentation, please refer to the [docs](./docs) directory:

- 📁 [Project Structure](./docs/PROJECT_STRUCTURE.md)
- 💾 [Database Configuration](./docs/DATABASE_CONFIG.md)
- 🐬 [MySQL Setup Guide](./docs/MYSQL_SETUP.md)
- 🔒 [Database SSL Configuration](./docs/DATABASE_SSL_CONFIG.md)
- 🤖 [AI Providers](./docs/AI_PROVIDERS.md)
- 🔍 [Gemini Integration](./docs/GEMINI_INTEGRATION.md)
- 📝 [Markdown Rendering](./docs/MARKDOWN_RENDERING.md)
- 🔧 [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- 📜 [Changelog](./docs/CHANGELOG.md)

## 🚀 Quick Start

### 📋 Prerequisites

- ⚙️ Node.js (v18+)
- 💾 PostgreSQL database (Neon Serverless recommended)
- 🔑 API keys for desired AI providers

### ⚡ Installation

1. **📥 Clone the repository**
```bash
git clone https://github.com/yourusername/interactive-companion.git
cd interactive-companion
```

2. **📦 Install dependencies**
```bash
npm install
```

3. **⚙️ Configure environment**
Copy the example.env file to create your own .env file:

```bash
cp example.env .env
```

Then edit the `.env` file to set your database credentials and other configuration options:

```env
# Database Configuration (choose one)
# For PostgreSQL:
DATABASE_URL=postgresql://username:password@localhost:5432/glowctf
# For MySQL:
DB_HOST=localhost
DB_USER=glowctf_user
DB_PASSWORD=your_strong_password
DB_NAME=glowctf
DB_PORT=3306
# Or using connection string:
MYSQL_DATABASE_URL=mysql://glowctf_user:your_strong_password@localhost:3306/glowctf

# Session security
SESSION_SECRET=your_session_secret

# Add API keys for your preferred AI providers
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key
TOGETHER_API_KEY=your_together_api_key
```

For detailed MySQL setup instructions, see the [MySQL Setup Guide](./docs/MYSQL_SETUP.md).

4. **💾 Database Setup**

For PostgreSQL:
```bash
# Create database
createdb interactive_companion

# Run migrations
npm run db:push
```

For MySQL:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE glowctf;"
mysql -u root -p -e "CREATE USER 'glowctf_user'@'localhost' IDENTIFIED BY 'your_strong_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON glowctf.* TO 'glowctf_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Run migrations
npm run db:push
# Or alternatively
./mysql-migrate.sh

# Test the MySQL connection
npm run test:mysql-connection
```

> **Note**: The application will automatically detect which database to use based on your environment variables:
> - If `MYSQL_DATABASE_URL` is set, MySQL will be used
> - If only `DATABASE_URL` is set, PostgreSQL will be used
> 
> SSL is configured by default for PostgreSQL connections. For more details, see:
> - [Database Configuration Guide](./docs/DATABASE_CONFIG.md)
> - [Database SSL Configuration Guide](./docs/DATABASE_SSL_CONFIG.md)

5. **🚀 Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## 🚢 Deployment

### 🎮 Replit Deployment
1. 🍴 Fork the repository to your Replit account
2. ⚙️ Configure environment variables in Replit secrets
3. 🏗️ Run `npm run build` followed by `npm start`

### 🌐 Other Platforms
The application can be deployed to any platform supporting Node.js:

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📄 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.