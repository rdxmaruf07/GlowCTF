'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Clock,
  Zap,
  Check,
  Download,
  Share
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TypingText } from './typing-text';
import { EnhancedMarkdown } from './enhanced-markdown-simple';

interface UIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    duration?: number;
  };
}

interface EnhancedMessageBubbleProps {
  message: UIMessage;
  isLast?: boolean;
  onRegenerate?: () => void;
  onTypingComplete?: (messageId: string) => void;
}

export function EnhancedMessageBubble({ 
  message, 
  isLast = false, 
  onRegenerate,
  onTypingComplete 
}: EnhancedMessageBubbleProps) {
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(!message.isStreaming);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!message.isStreaming) {
      setIsTypingComplete(true);
    }
  }, [message.isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GlowCTF AI Response',
          text: message.content,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopy();
    }
  };

  const handleExport = () => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-response-${message.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTypingComplete = () => {
    setIsTypingComplete(true);
    onTypingComplete?.(message.id);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end mb-6"
        layout
      >
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 shadow-sm border border-primary/20">
            <p className="text-[15px] leading-6 whitespace-pre-wrap break-words">
              {message.content}
            </p>
            {message.timestamp && (
              <div className="text-xs text-primary-foreground/70 mt-2 text-right">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
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
      layout
    >
      <div className="flex items-start gap-3 max-w-[90%] w-full">
        {/* Enhanced AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/20 flex-shrink-0 mt-1 shadow-sm">
          <motion.div
            animate={message.isStreaming ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: message.isStreaming ? Infinity : 0, ease: "linear" }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
            {message.content ? (
              message.isStreaming ? (
                <TypingText
                  text={message.content}
                  speed={30}
                  onComplete={handleTypingComplete}
                  className="text-[15px] leading-6"
                />
              ) : (
                <EnhancedMarkdown content={message.content} />
              )
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-2 h-2 bg-primary/60 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-primary/60 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-primary/60 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>

          {/* Message Metadata */}
          {isTypingComplete && message.metadata && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mt-2 ml-1"
            >
              {message.metadata.model && (
                <Badge variant="secondary" className="text-xs">
                  {message.metadata.model}
                </Badge>
              )}
              {message.metadata.duration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(message.metadata.duration)}
                </div>
              )}
              {message.metadata.tokens && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  ~{message.metadata.tokens} tokens
                </div>
              )}
              {message.timestamp && (
                <div className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </motion.div>
          )}

          {/* Enhanced Message Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: (showActions && isTypingComplete) ? 1 : 0, 
              y: (showActions && isTypingComplete) ? 0 : 10 
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 mt-3 ml-1"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share className="h-3 w-3 mr-1" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            
            {isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            )}

            <div className="w-px h-4 bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-green-500 transition-colors"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}