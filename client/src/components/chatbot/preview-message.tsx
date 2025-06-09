'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Edit, 
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  User,
  Bot
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TypingText } from './typing-text';

interface UIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

interface Vote {
  messageId: string;
  isUpvoted: boolean;
}

interface PreviewMessageProps {
  chatId: string;
  message: UIMessage;
  vote?: Vote;
  setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
  reload: () => void;
  isReadonly: boolean;
  requiresScrollPadding?: boolean;
  onTypingComplete?: (messageId: string) => void;
}

export function PreviewMessage({
  chatId,
  message,
  vote,
  setMessages,
  reload,
  isReadonly,
  requiresScrollPadding = false,
  onTypingComplete,
}: PreviewMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTyping, setShowTyping] = useState(message.role === 'assistant' && message.isStreaming);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: 'Copied to clipboard',
      description: 'Message content has been copied to your clipboard.',
    });
  };

  const handleEdit = () => {
    // Implementation for editing message
    console.log('Edit message:', message.id);
  };

  const handleVote = (isUpvoted: boolean) => {
    // Implementation for voting
    console.log('Vote:', { messageId: message.id, isUpvoted });
  };

  const handleRegenerate = () => {
    reload();
  };

  return (
    <motion.div
      className={cn(
        'group relative flex gap-3 p-4 rounded-lg transition-colors',
        message.role === 'user' 
          ? 'bg-primary/5 ml-12' 
          : 'bg-muted/30 mr-12',
        requiresScrollPadding && 'mb-24'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        message.role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      )}>
        {message.role === 'user' ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {message.role === 'user' ? 'You' : 'AI Assistant'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {showTyping && message.role === 'assistant' ? (
            <TypingText
              text={message.content}
              speed={20}
              onComplete={() => {
                setShowTyping(false);
                onTypingComplete?.(message.id);
              }}
              className="text-foreground"
            />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => navigator.clipboard.writeText(String(children))}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Actions */}
        {(isHovered || vote) && !isReadonly && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-1 mt-3"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
            >
              <Copy className="w-3 h-3" />
            </Button>

            {message.role === 'assistant' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(true)}
                  className={cn(
                    'h-7 px-2',
                    vote?.isUpvoted && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  )}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(false)}
                  className={cn(
                    'h-7 px-2',
                    vote && !vote.isUpvoted && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  )}
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  className="h-7 px-2"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="w-3 h-3 mr-2" />
                  Copy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Export as both named and default for compatibility
export { PreviewMessage as default };
