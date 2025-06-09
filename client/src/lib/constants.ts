// Icons are HTML SVG icons for providers
export const CHATBOT_PROVIDERS = [
  {
    id: "openai",
    name: "GPT Assistant",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"></path></svg>'
  },
  {
    id: "anthropic",
    name: "Claude Assistant",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"></path></svg>'
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 4.5a1.5 1.5 0 1 1 3 0v15a1.5 1.5 0 0 1-3 0v-15z"/><path d="M19.5 4.5a1.5 1.5 0 0 1 3 0v15a1.5 1.5 0 0 1-3 0v-15z"/><path d="M1.5 4.5a1.5 1.5 0 0 1 3 0v15a1.5 1.5 0 0 1-3 0v-15z"/></svg>'
  },
  {
    id: "aiml",
    name: "AIML",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10h10V2Z"/><path d="M22 2h-8v8h8V2Z"/><path d="M12 14H2v8h10v-8Z"/><path d="M22 14h-8v8h8v-8Z"/></svg>'
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
  },
  {
    id: "together",
    name: "Together.ai",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 6.5a4.5 4.5 0 0 1 6 6.5c-1 1-2 1.5-3 2"/><path d="M19.5 15c-1 1-3.3 3.2-4.5 4.5-1.2-1.3-3.5-3.5-4.5-4.5"/></svg>'
  },
  {
    id: "groq",
    name: "Groq (Unavailable)",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3"/><path d="M18.5 5.5 16 8"/><path d="M21 12h-3"/><path d="M18.5 18.5 16 16"/><path d="M12 21v-3"/><path d="M5.5 18.5 8 16"/><path d="M3 12h3"/><path d="M5.5 5.5 8 8"/><circle cx="12" cy="12" r="4"/></svg>'
  }
];

// Badge information based on badge name
export const BADGE_INFO = {
  'First Blood': {
    icon: 'trophy',
    color: 'border-primary text-primary',
    description: 'Awarded for solving your first challenge'
  },
  'Speedrunner': {
    icon: 'timer',
    color: 'border-primary text-primary',
    description: 'Awarded for solving a challenge in under 5 minutes'
  },
  'Brainiac': {
    icon: 'brain',
    color: 'border-accent text-accent',
    description: 'Awarded for solving a hard difficulty challenge'
  },
  'Streak Master': {
    icon: 'flame',
    color: 'border-amber-500 text-amber-500',
    description: 'Awarded for solving 5 challenges in a row'
  },
  'Top 3': {
    icon: 'medal',
    color: 'border-green-500 text-green-500',
    description: 'Awarded for reaching the top 3 on the leaderboard'
  }
};

export const PRACTICE_VULNERABILITIES = [
  {
    id: 'sql-injection',
    name: 'SQL Injection',
    description: 'Practice exploiting SQL Injection vulnerabilities in a web application login form.',
    difficulty: 'medium',
    category: 'Web',
    icon: 'database'
  },
  {
    id: 'xss',
    name: 'Cross-Site Scripting (XSS)',
    description: 'Learn how to identify and exploit XSS vulnerabilities in comment sections.',
    difficulty: 'easy',
    category: 'Web',
    icon: 'code'
  },
  {
    id: 'file-upload',
    name: 'Insecure File Upload',
    description: 'Bypass file upload restrictions to achieve code execution.',
    difficulty: 'medium',
    category: 'Web',
    icon: 'file-up'
  },
  {
    id: 'command-injection',
    name: 'Command Injection',
    description: 'Exploit command injection vulnerabilities to execute arbitrary system commands.',
    difficulty: 'hard',
    category: 'Web',
    icon: 'terminal'
  },
  {
    id: 'open-redirect',
    name: 'Open Redirect',
    description: 'Manipulate URL redirects to send users to malicious websites.',
    difficulty: 'easy',
    category: 'Web',
    icon: 'arrow-right'
  },
  {
    id: 'buffer-overflow',
    name: 'Buffer Overflow',
    description: 'Learn how to exploit buffer overflow vulnerabilities in C programs.',
    difficulty: 'hard',
    category: 'Binary',
    icon: 'zap'
  },
  {
    id: 'race-condition',
    name: 'Race Condition',
    description: 'Exploit timing vulnerabilities in concurrent operations.',
    difficulty: 'hard',
    category: 'Binary',
    icon: 'timer'
  },
  {
    id: 'cryptography',
    name: 'Cryptography Challenge',
    description: 'Break weak cryptographic implementations and decode secret messages.',
    difficulty: 'medium',
    category: 'Crypto',
    icon: 'key'
  }
];