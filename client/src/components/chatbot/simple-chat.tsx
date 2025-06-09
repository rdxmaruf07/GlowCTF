'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SimpleChatProps {
  id: string;
  initialChatModel: string;
  session: { user: any };
}

// Split text animation component
const SplitText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(' ');
  
  return (
    <div className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: (wordIndex * word.length + charIndex) * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: (wordIndex * word.length + word.length) * 0.05
              }}
              className="inline-block"
            >
              &nbsp;
            </motion.span>
          )}
        </span>
      ))}
    </div>
  );
};

export function SimpleChat({ id, initialChatModel, session }: SimpleChatProps) {
  return (
    <div className="flex flex-col bg-background h-full relative">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Icon */}
          <motion.div 
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 mx-auto"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-12 w-12 text-primary" />
            </motion.div>
          </motion.div>

          {/* Animated Greeting Text */}
          <SplitText 
            text="Welcome to GlowCTF AI Assistant"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent"
          />
          
          {/* Animated Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 2.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <SplitText 
              text="Your intelligent companion for CTF challenges and cybersecurity analysis"
              className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            />
          </motion.div>

          {/* Animated Decorative Elements */}
          <motion.div 
            className="mt-12 flex justify-center space-x-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/20 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Animation */}
      <motion.div 
        className="p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 5, duration: 1 }}
      >
        <motion.p 
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Powered by AI • Ready to assist with your cybersecurity journey
        </motion.p>
      </motion.div>
    </div>
  );
}