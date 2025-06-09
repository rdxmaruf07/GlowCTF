'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Code, Brain, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatOverviewProps {
  onSuggestedQuestion: (question: string) => void;
}

const features = [
  {
    icon: Shield,
    title: 'Security Analysis',
    description: 'Analyze code for vulnerabilities and security flaws',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Code,
    title: 'Code Review',
    description: 'Get help with code understanding and debugging',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Brain,
    title: 'CTF Techniques',
    description: 'Learn about various CTF categories and methods',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Zap,
    title: 'Quick Solutions',
    description: 'Get fast answers to your cybersecurity questions',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
];

const quickStarters = [
  {
    category: 'Web Security',
    questions: [
      'How do I identify SQL injection vulnerabilities?',
      'Explain Cross-Site Scripting (XSS) attacks',
      'What are common web application security headers?',
    ],
  },
  {
    category: 'Cryptography',
    questions: [
      'Help me understand RSA encryption',
      'How do hash functions work in security?',
      'Explain the difference between symmetric and asymmetric encryption',
    ],
  },
  {
    category: 'Binary Exploitation',
    questions: [
      'What is a buffer overflow attack?',
      'How does return-oriented programming (ROP) work?',
      'Explain stack canaries and their purpose',
    ],
  },
  {
    category: 'Forensics',
    questions: [
      'How do I analyze network traffic for suspicious activity?',
      'What tools are best for file system forensics?',
      'How can I recover deleted files?',
    ],
  },
];

export function ChatOverview({ onSuggestedQuestion }: ChatOverviewProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to GlowCTF AI Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your intelligent companion for cybersecurity learning, CTF challenges, and security analysis. 
          Ask me anything about penetration testing, vulnerability research, or security concepts.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Starters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Quick Starters</h2>
          <p className="text-muted-foreground">Click on any question to get started</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {quickStarters.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + categoryIndex * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-foreground">{category.category}</h3>
              </div>
              <div className="space-y-2">
                {category.questions.map((question, questionIndex) => (
                  <Button
                    key={questionIndex}
                    variant="ghost"
                    onClick={() => onSuggestedQuestion(question)}
                    className="w-full text-left justify-start h-auto p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <span className="line-clamp-2">{question}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12 pt-8 border-t border-border"
      >
        <p className="text-sm text-muted-foreground">
          💡 <strong>Pro tip:</strong> Be specific with your questions for better results. 
          Include context about your CTF challenge or security scenario.
        </p>
      </motion.div>
    </div>
  );
}