'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { generateUUID } from '@/lib/utils';
import { ChatHeader } from './chat-header';
import { Messages } from './messages';
import { Greeting } from './greeting';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  Loader2, 
  Sparkles,
  MessageSquareIcon,
  BrainIcon
} from 'lucide-react';

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

interface ChatProps {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: 'private' | 'public';
  isReadonly: boolean;
  session: { user: any };
  autoResume: boolean;
}


export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: ChatProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'ready' | 'submitted' | 'loading'>('ready');
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        stream: true, // Enable streaming
      });

      return response; // Return the raw response for streaming
    },
    onError: (error: any) => {
      setStatus('ready');
      toast({
        title: 'Error sending message',
        description: error.message || 'Failed to send message.',
        variant: 'destructive',
      });
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
    if (!message || status !== 'ready') {
      console.log('Submit blocked:', { message, status });
      return;
    }

    console.log('Submitting message:', message);

    const userMessage: UIMessage = {
      id: generateUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus('loading');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const assistantMessageId = generateUUID();
    const assistantMessage: UIMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
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
        
        // Process server-sent events
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

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      setStatus('ready');
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'An error occurred. Please try again.', isStreaming: false }
            : msg
        )
      );
      setStatus('ready');
    }
  }, [input, status, initialChatModel, sendMessageMutation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleSuggestedQuestion = (question: string) => {
    handleSubmit(question);
  };

  const append = (message: { role: 'user' | 'assistant'; content: string }) => {
    const newMessage: UIMessage = {
      id: generateUUID(),
      role: message.role,
      content: message.content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const reload = () => {
    // Remove the last assistant message and regenerate
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const previousUserMessage = messages[messages.length - 2];
      if (previousUserMessage && previousUserMessage.role === 'user') {
        setMessages(prev => prev.slice(0, -1));
        handleSubmit(previousUserMessage.content);
      }
    }
  };

  const stop = () => {
    setStatus('ready');
  };

  const handleTypingComplete = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isStreaming: false } : msg
    ));
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      {/* Messages Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Greeting onSuggestedQuestion={handleSuggestedQuestion} />
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto scrollbar-thin"
            style={{ paddingBottom: '120px' }} // Space for input area
          >
            <div className="max-w-4xl w-full mx-auto px-4 py-6">
              <Messages
                chatId={id}
                status={status}
                votes={votes}
                messages={messages}
                setMessages={setMessages}
                reload={reload}
                isReadonly={isReadonly}
                isArtifactVisible={false}
                onSuggestedQuestion={handleSuggestedQuestion}
                onTypingComplete={handleTypingComplete}
              />
              
              {sendMessageMutation.isPending && (
                <motion.div 
                  className="w-full mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center mb-2 px-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">
                      {initialChatModel}
                    </span>
                  </div>
                  <div className="bg-transparent">
                    <div className="flex items-center space-x-2 text-[15px] text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Thinking...</span>
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fixed Input Area */}
      {!isReadonly && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/98 backdrop-blur-md z-10">
          <div className="max-w-4xl w-full mx-auto p-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Message GlowCTF AI..."
                className="min-h-[52px] max-h-[120px] resize-none rounded-2xl border border-border/60 bg-background px-4 py-3 pr-12 text-[15px] leading-6 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/60 shadow-sm transition-all duration-200"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendMessageMutation.isPending}
              />
              
              <Button
                size="icon"
                className={`absolute right-2 bottom-2 h-8 w-8 rounded-full transition-all duration-200 ${
                  input.trim() && !sendMessageMutation.isPending
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                disabled={!input.trim() || sendMessageMutation.isPending}
                onClick={() => {
                  console.log('Button clicked, input:', input);
                  handleSubmit();
                }}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground/70">
                GlowCTF AI can make mistakes. Verify important information for CTF challenges.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
