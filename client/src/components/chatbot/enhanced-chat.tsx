'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { generateUUID } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, Sparkles, Send, Paperclip, Mic, Square } from 'lucide-react';
import { EnhancedMessageBubble } from './enhanced-message-bubble';
import { EnhancedChatInput } from './enhanced-chat-input';
import { ChatOverview } from './chat-overview';
import { cn } from '@/lib/utils';

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

interface EnhancedChatProps {
  id: string;
  initialMessages?: Array<UIMessage>;
  initialChatModel: string;
  session: { user: any };
  className?: string;
}

export function EnhancedChat({
  id,
  initialMessages = [],
  initialChatModel,
  session,
  className
}: EnhancedChatProps) {
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, provider }: { message: string; provider: string }) => {
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiRequest('POST', '/api/chatbot/completion', {
        messages: [...messageHistory, { role: 'user', content: message }],
        provider,
        stream: true,
      });

      return response;
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending message',
        description: error.message || 'Failed to send message.',
        variant: 'destructive',
      });
      setIsTyping(false);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isNearBottom);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  const handleSubmit = useCallback(async (messageToSend?: string) => {
    const message = messageToSend || input.trim();
    if (!message || sendMessageMutation.isPending) {
      return;
    }

    const userMessage: UIMessage = {
      id: generateUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const assistantMessageId = generateUUID();
    const assistantMessage: UIMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      metadata: {
        model: initialChatModel,
      }
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const startTime = Date.now();
      const response = await sendMessageMutation.mutateAsync({
        message,
        provider: initialChatModel,
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            try {
              const parsed = JSON.parse(data);
              if (parsed.done) {
                done = true;
                break;
              }
              if (parsed.content) {
                fullContent += parsed.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore parsing errors for incomplete JSON
            }
          }
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { 
                ...msg, 
                isStreaming: false,
                metadata: {
                  ...msg.metadata,
                  duration,
                  tokens: fullContent.split(' ').length // Rough token estimate
                }
              }
            : msg
        )
      );
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'An error occurred. Please try again.', isStreaming: false }
            : msg
        )
      );
      setIsTyping(false);
    }
  }, [input, sendMessageMutation, initialChatModel]);

  const handleRegenerate = useCallback(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const previousUserMessage = messages[messages.length - 2];
      if (previousUserMessage && previousUserMessage.role === 'user') {
        setMessages(prev => prev.slice(0, -1));
        handleSubmit(previousUserMessage.content);
      }
    }
  }, [messages, handleSubmit]);

  const handleTypingComplete = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isStreaming: false } : msg
    ));
  }, []);

  return (
    <div className={cn("flex flex-col h-full w-full bg-background relative", className)}>
      {/* Messages Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <ChatOverview onSuggestedQuestion={handleSubmit} />
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          >
            <div className="max-w-4xl w-full mx-auto px-4 py-6 pb-32">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <EnhancedMessageBubble
                    key={message.id}
                    message={message}
                    isLast={index === messages.length - 1}
                    onRegenerate={message.role === 'assistant' && index === messages.length - 1 ? handleRegenerate : undefined}
                    onTypingComplete={handleTypingComplete}
                  />
                ))}
              </AnimatePresence>
              
              {/* Enhanced Loading indicator */}
              {isTyping && (
                <motion.div 
                  className="flex justify-start mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-start gap-3 max-w-[85%] w-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/20 flex-shrink-0 mt-1">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-4 w-4 text-primary" />
                      </motion.div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center space-x-3 text-muted-foreground">
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
                        <span className="text-sm font-medium">AI is thinking...</span>
                        <div className="text-xs text-muted-foreground/70">
                          {initialChatModel}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!isAtBottom && messages.length > 0 && (
          <motion.div
            className="absolute bottom-32 right-6 z-20"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90 border border-primary/20"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Input Area */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md z-10">
        <div className="max-w-4xl w-full mx-auto p-4">
          <EnhancedChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={sendMessageMutation.isPending}
            disabled={sendMessageMutation.isPending}
            placeholder={`Message GlowCTF AI (${initialChatModel})...`}
          />
        </div>
      </div>
    </div>
  );
}