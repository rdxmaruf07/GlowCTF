'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TypingText } from './typing-text';
import { Markdown } from './markdown';

interface UIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

interface MessageBubbleProps {
  message: UIMessage;
  isLast?: boolean;
  onRegenerate?: () => void;
  onTypingComplete?: (messageId: string) => void;
}

export function MessageBubble({ 
  message, 
  isLast = false, 
  onRegenerate,
  onTypingComplete 
}: MessageBubbleProps) {
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(!message.isStreaming);

  useEffect(() => {
    if (!message.isStreaming) {
      setIsTypingComplete(true);
    }
  }, [message.isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: 'Copied to clipboard',
        description: 'Message content has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy message to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleTypingComplete = () => {
    setIsTypingComplete(true);
    onTypingComplete?.(message.id);
  };

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end mb-6"
      >
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
            <p className="text-[15px] leading-6 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start mb-6"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3 max-w-[85%] w-full">
        {/* AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/20 flex-shrink-0 mt-1">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
            {message.content ? (
              message.isStreaming ? (
                <TypingText
                  text={message.content}
                  speed={30}
                  onComplete={handleTypingComplete}
                  className="text-[15px] leading-6"
                />
              ) : (
                <Markdown content={message.content} />
              )
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>

          {/* Message Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: (showActions && isTypingComplete) ? 1 : 0, 
              y: (showActions && isTypingComplete) ? 0 : 10 
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 mt-2 ml-1"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            
            {isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}