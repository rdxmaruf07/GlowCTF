'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedChat } from './enhanced-chat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Code2, 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Download,
  Share,
  RotateCcw,
  Zap
} from 'lucide-react';
import { generateUUID } from '@/lib/utils';

interface DemoMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model: string;
    tokens: number;
    duration: number;
  };
}

const demoMessages: DemoMessage[] = [
  {
    id: generateUUID(),
    role: 'user',
    content: 'Can you help me understand SQL injection vulnerabilities and show me some example code?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: generateUUID(),
    role: 'assistant',
    content: `# SQL Injection Vulnerabilities

SQL injection is one of the most common web application security vulnerabilities. It occurs when user input is not properly sanitized before being used in SQL queries.

## Vulnerable Code Example

Here's an example of vulnerable PHP code:

\`\`\`php
<?php
// VULNERABLE CODE - DO NOT USE IN PRODUCTION
$username = $_POST['username'];
$password = $_POST['password'];

$query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
$result = mysqli_query($connection, $query);

if (mysqli_num_rows($result) > 0) {
    echo "Login successful!";
} else {
    echo "Invalid credentials!";
}
?>
\`\`\`

## The Problem

An attacker could input something like:
- Username: \`admin' OR '1'='1' --\`
- Password: \`anything\`

This would result in the query:
\`\`\`sql
SELECT * FROM users WHERE username = 'admin' OR '1'='1' --' AND password = 'anything'
\`\`\`

The \`--\` comments out the password check, and \`'1'='1'\` is always true.

## Secure Code Example

Here's how to fix it using prepared statements:

\`\`\`php
<?php
// SECURE CODE
$username = $_POST['username'];
$password = $_POST['password'];

// Use prepared statements
$stmt = $connection->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo "Login successful!";
} else {
    echo "Invalid credentials!";
}

$stmt->close();
?>
\`\`\`

## Prevention Techniques

1. **Use Prepared Statements**: Always use parameterized queries
2. **Input Validation**: Validate and sanitize all user inputs
3. **Least Privilege**: Use database accounts with minimal permissions
4. **Error Handling**: Don't expose database errors to users
5. **Regular Updates**: Keep your database software updated

## Testing Tools

You can test for SQL injection using tools like:
- **SQLMap**: Automated SQL injection testing
- **Burp Suite**: Web application security testing
- **OWASP ZAP**: Free security testing proxy

Would you like me to explain any specific aspect in more detail?`,
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
    metadata: {
      model: 'gemini-pro',
      tokens: 342,
      duration: 2340,
    },
  },
  {
    id: generateUUID(),
    role: 'user',
    content: 'That\'s really helpful! Can you show me a Python example of how to prevent SQL injection when using SQLite?',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: generateUUID(),
    role: 'assistant',
    content: `# SQL Injection Prevention in Python with SQLite

Great question! Here's how to safely handle user input with SQLite in Python:

## Vulnerable Code (DON'T DO THIS)

\`\`\`python
import sqlite3

def vulnerable_login(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # VULNERABLE - String formatting
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    
    result = cursor.fetchone()
    conn.close()
    
    return result is not None
\`\`\`

## Secure Code (RECOMMENDED)

\`\`\`python
import sqlite3
import hashlib

def secure_login(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # SECURE - Using parameterized queries
    query = "SELECT * FROM users WHERE username = ? AND password_hash = ?"
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor.execute(query, (username, password_hash))
    result = cursor.fetchone()
    conn.close()
    
    return result is not None

# Example usage
if secure_login("admin", "mypassword"):
    print("Login successful!")
else:
    print("Invalid credentials!")
\`\`\`

## Complete Example with Error Handling

\`\`\`python
import sqlite3
import hashlib
import logging
from typing import Optional, Dict, Any

class UserDatabase:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with users table"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        email TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                conn.commit()
        except sqlite3.Error as e:
            logging.error(f"Database initialization error: {e}")
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, username: str, password: str, email: str) -> bool:
        """Create a new user with secure password hashing"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                password_hash = self.hash_password(password)
                
                cursor.execute(
                    "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
                    (username, password_hash, email)
                )
                conn.commit()
                return True
        except sqlite3.IntegrityError:
            logging.warning(f"User {username} already exists")
            return False
        except sqlite3.Error as e:
            logging.error(f"Error creating user: {e}")
            return False
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with secure parameterized query"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row  # Enable column access by name
                cursor = conn.cursor()
                
                password_hash = self.hash_password(password)
                cursor.execute(
                    "SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?",
                    (username, password_hash)
                )
                
                result = cursor.fetchone()
                return dict(result) if result else None
        except sqlite3.Error as e:
            logging.error(f"Authentication error: {e}")
            return None

# Usage example
if __name__ == "__main__":
    db = UserDatabase("secure_users.db")
    
    # Create a user
    if db.create_user("alice", "secure_password123", "alice@example.com"):
        print("User created successfully!")
    
    # Authenticate user
    user = db.authenticate_user("alice", "secure_password123")
    if user:
        print(f"Welcome back, {user['username']}!")
    else:
        print("Invalid credentials!")
\`\`\`

## Key Security Principles

1. **Parameterized Queries**: Use \`?\` placeholders instead of string formatting
2. **Password Hashing**: Never store plain text passwords
3. **Error Handling**: Don't expose database errors to users
4. **Input Validation**: Validate input before database operations
5. **Connection Management**: Use context managers for proper cleanup

## Additional Security Tips

- Use **bcrypt** or **Argon2** instead of SHA-256 for password hashing
- Implement **rate limiting** for login attempts
- Add **CSRF protection** for web applications
- Use **environment variables** for database credentials
- Enable **database logging** for audit trails

This approach makes your application much more secure against SQL injection attacks!`,
    timestamp: new Date(Date.now() - 30 * 1000),
    metadata: {
      model: 'gemini-pro',
      tokens: 456,
      duration: 3120,
    },
  },
];

export function ChatbotDemo() {
  const [showFeatures, setShowFeatures] = useState(false);

  const features = [
    {
      icon: <Code2 className="h-5 w-5" />,
      title: "Advanced Code Rendering",
      description: "Syntax highlighting, copy buttons, and download options for 20+ languages"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Smart Message System",
      description: "Enhanced bubbles with metadata, timestamps, and action buttons"
    },
    {
      icon: <Copy className="h-5 w-5" />,
      title: "One-Click Copy",
      description: "Copy entire messages or individual code blocks instantly"
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Export Functionality",
      description: "Download messages and code snippets with proper formatting"
    },
    {
      icon: <Share className="h-5 w-5" />,
      title: "Share Messages",
      description: "Native sharing support with fallback to clipboard"
    },
    {
      icon: <RotateCcw className="h-5 w-5" />,
      title: "Regenerate Responses",
      description: "Re-run AI responses for different perspectives"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time Streaming",
      description: "Live message streaming with typing indicators"
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Enhanced UX",
      description: "Smooth animations, smart scrolling, and responsive design"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Enhanced Chatbot Demo</h1>
                <p className="text-sm text-muted-foreground">
                  Modern AI chat interface with advanced features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Code2 className="h-3 w-3 mr-1" />
                Enhanced UI
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                {showFeatures ? 'Hide' : 'Show'} Features
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Features Panel */}
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Enhanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-primary mt-0.5">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chat Demo */}
          <div className={showFeatures ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card className="h-[800px]">
              <CardContent className="p-0 h-full">
                <EnhancedChat
                  id="demo-chat"
                  initialMessages={demoMessages}
                  initialChatModel="gemini-pro"
                  session={{ user: { id: 1, username: "demo-user" } }}
                  className="h-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Try the Enhanced Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Copy className="h-4 w-4 text-primary" />
                    Copy Features
                  </h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Hover over messages to see copy button</li>
                    <li>• Click code blocks to copy instantly</li>
                    <li>• Click inline code to copy</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    Export Options
                  </h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Download code with proper extensions</li>
                    <li>• Export entire messages as text</li>
                    <li>• Share via native share API</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    Code Features
                  </h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Syntax highlighting for 20+ languages</li>
                    <li>• Language badges and icons</li>
                    <li>• Proper code formatting</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    UX Enhancements
                  </h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Smooth animations and transitions</li>
                    <li>• Smart scrolling behavior</li>
                    <li>• Response metadata display</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}