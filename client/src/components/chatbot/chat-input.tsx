'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  onSubmit: (text?: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const suggestedActions = [
  {
    title: 'Analyze this code',
    label: 'for vulnerabilities',
    action: 'Can you help me analyze this code for potential security vulnerabilities?',
  },
  {
    title: 'Explain CTF technique',
    label: 'buffer overflow',
    action: 'Can you explain how buffer overflow attacks work in CTF challenges?',
  },
  {
    title: 'Help with crypto',
    label: 'RSA challenge',
    action: 'I need help solving an RSA cryptography challenge. Can you guide me?',
  },
  {
    title: 'Web exploitation',
    label: 'SQL injection',
    action: 'How do I identify and exploit SQL injection vulnerabilities?',
  },
];

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  disabled = false,
  placeholder = "Message GlowCTF AI..."
}: ChatInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (isLoading) {
      toast({
        title: 'Please wait',
        description: 'Please wait for the AI to finish its response!',
        variant: 'destructive',
      });
      return;
    }
    
    if (input.trim()) {
      setShowSuggestions(false);
      onSubmit();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (action: string) => {
    setShowSuggestions(false);
    onSubmit(action);
  };

  return (
    <div className="w-full space-y-4">
      {/* Suggested Actions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {suggestedActions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  "block",
                  index > 1 && "hidden sm:block"
                )}
              >
                <Button
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion.action)}
                  className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 flex-col w-full h-auto justify-start items-start hover:bg-accent/50 transition-colors group"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary group-hover:text-primary/80" />
                    <span className="font-medium">{suggestion.title}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{suggestion.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          className={cn(
            "min-h-[60px] max-h-[200px] resize-none rounded-2xl border border-border/60 bg-background px-4 py-3 pr-12 text-[15px] leading-6 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/60 shadow-sm transition-all duration-200",
            "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          )}
          rows={1}
        />
        
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading || disabled}
          className={cn(
            "absolute right-2 bottom-2 h-8 w-8 rounded-full transition-all duration-200",
            input.trim() && !isLoading && !disabled
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Footer Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground/70">
          GlowCTF AI can make mistakes. Verify important information for CTF challenges.
        </p>
      </div>
    </div>
  );
}