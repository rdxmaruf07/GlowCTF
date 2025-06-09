'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  BrainIcon, 
  CodeIcon, 
  ShieldIcon, 
  SearchIcon,
  LightbulbIcon,
  ZapIcon
} from 'lucide-react';

const suggestedQuestions = [
  {
    icon: CodeIcon,
    title: "Code Analysis",
    question: "Can you help me analyze this code for security vulnerabilities?",
    category: "Security"
  },
  {
    icon: ShieldIcon,
    title: "CTF Strategy",
    question: "What's the best approach for solving web exploitation challenges?",
    category: "Strategy"
  },
  {
    icon: SearchIcon,
    title: "Reconnaissance",
    question: "How do I perform effective reconnaissance on a target?",
    category: "Recon"
  },
  {
    icon: LightbulbIcon,
    title: "Learning Path",
    question: "What should I learn next to improve my cybersecurity skills?",
    category: "Learning"
  }
];

interface GreetingProps {
  onSuggestedQuestion?: (question: string) => void;
}

export function Greeting({ onSuggestedQuestion }: GreetingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-6 mx-auto">
            <BrainIcon className="w-10 h-10 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <ZapIcon className="w-3 h-3 text-white" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Welcome to CTF AI Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your intelligent companion for cybersecurity challenges. Get help with code analysis, 
          vulnerability research, CTF strategies, and learning paths.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl"
      >
        {suggestedQuestions.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-4 text-left hover:bg-accent/50 transition-all duration-200 group"
              onClick={() => onSuggestedQuestion?.(item.question)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    {item.question}
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-sm text-muted-foreground text-center"
      >
        <p className="mb-2">
          💡 <strong>Tip:</strong> Be specific with your questions for better assistance.
          Include code snippets, error messages, or challenge descriptions when relevant.
        </p>
        <p className="text-xs">
          🔧 <strong>Features:</strong> Code analysis • Vulnerability research • CTF strategies • Learning paths
        </p>
      </motion.div>
    </div>
  );
}
