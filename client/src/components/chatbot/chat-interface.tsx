import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowUpIcon,
  ArrowDown,
  PaperclipIcon,
  Loader2,
  X,
  Type,
} from "lucide-react";
import Message from "./message";

interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

interface ChatProvider {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

interface ChatInterfaceProps {
  provider: ChatProvider;
  messages?: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const suggestedActions = [
  {
    title: "Analyze a CTF Challenge",
    description: "Help me understand and solve a specific CTF challenge",
    action: "I have a CTF challenge that I need help with. Can you help me analyze it?"
  },
  {
    title: "Explain Security Concepts",
    description: "Learn about cybersecurity topics and techniques",
    action: "Can you explain common web application vulnerabilities?"
  },
  {
    title: "Code Review & Analysis",
    description: "Review code for security vulnerabilities",
    action: "Can you help me review this code for security issues?"
  },
  {
    title: "Tool Recommendations",
    description: "Get suggestions for CTF tools and techniques",
    action: "What tools would you recommend for binary exploitation challenges?"
  }
];

export default function ChatInterface({
  provider,
  messages = [],
  onSendMessage,
  isFullScreen = false,
  onToggleFullScreen
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [enableTypingAnimation, setEnableTypingAnimation] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const chatCompletionMutation = useMutation({
    mutationFn: async (message: string) => {
      await onSendMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const ensureScrollable = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Force a reflow to ensure scrolling works properly
      container.offsetHeight;
    }
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

  // Ensure scroll position is maintained when switching between fullscreen and minimized
  useEffect(() => {
    ensureScrollable();
    if (messagesContainerRef.current) {
      // Force a reflow to ensure scrolling works properly after layout changes
      const container = messagesContainerRef.current;
      const scrollTop = container.scrollTop;

      // Temporarily hide overflow to force layout recalculation
      container.style.overflow = 'hidden';
      container.offsetHeight; // Force reflow

      // Restore overflow and scroll position
      container.style.overflow = '';

      // Use setTimeout to ensure the layout has been updated
      setTimeout(() => {
        if (container) {
          container.scrollTop = scrollTop;
          // If we were at the bottom, stay at the bottom
          if (isAtBottom) {
            scrollToBottom();
          }
        }
      }, 0);
    }
  }, [isFullScreen, ensureScrollable, isAtBottom, scrollToBottom]);

  // Ensure scrollable on mount and when messages change
  useEffect(() => {
    ensureScrollable();
  }, [messages, ensureScrollable]);

  const handleSendMessage = useCallback(async (messageToSend?: string) => {
    const message = messageToSend || input.trim();
    if (!message) return;

    if (!provider.available) {
      toast({
        title: "API Key Required",
        description: "Please add an API key for this provider before sending messages.",
        variant: "destructive"
      });
      return;
    }

    if ((messages?.length || 0) === 0 && onToggleFullScreen && !isFullScreen) {
      onToggleFullScreen();
    }

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await chatCompletionMutation.mutateAsync(message);
  }, [input, provider.available, messages?.length || 0, onToggleFullScreen, isFullScreen, toast, chatCompletionMutation]);

  const handleSuggestedAction = useCallback((action: string) => {
    handleSendMessage(action);
  }, [handleSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
    });
  }, [toast]);

  return (
    <div className={`flex flex-col bg-background border border-border transition-all duration-300 ${
      isFullScreen
        ? 'fixed inset-0 z-50 rounded-none h-screen w-screen chat-fullscreen'
        : 'h-[700px] rounded-lg chat-interface-minimized'
    }`}>
      {isFullScreen && (
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span dangerouslySetInnerHTML={{ __html: provider.icon }} className="text-primary text-sm" />
            </div>
            <div>
              <h3 className="font-medium text-white">{provider.name}</h3>
              <p className="text-xs text-muted-foreground">CTF AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEnableTypingAnimation(!enableTypingAnimation)}
              className={`text-muted-foreground hover:text-primary hover:bg-secondary/50 ${
                enableTypingAnimation ? 'text-primary bg-secondary/50' : ''
              }`}
              title={enableTypingAnimation ? 'Disable typing animation' : 'Enable typing animation'}
            >
              <Type className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullScreen}
              className="text-muted-foreground hover:text-primary hover:bg-secondary/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      <div className={`flex-1 flex flex-col ${isFullScreen ? 'overflow-hidden' : 'overflow-hidden'}`}>
        {(messages?.length || 0) === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-3xl mx-auto w-full space-y-8">
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-semibold text-white">What can I help you with?</h1>
                <p className="text-muted-foreground text-lg">
                  I'm here to assist you with CTF challenges, cybersecurity concepts, and problem-solving.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {suggestedActions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestedAction(suggestion.action)}
                    disabled={!provider.available}
                    className="group p-6 text-left border border-border rounded-xl hover:border-primary/50 hover:bg-card/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="space-y-2">
                      <div className="font-semibold text-white group-hover:text-primary transition-colors text-base">
                        {suggestion.title}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {suggestion.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {!provider.available && (
                <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Please add an API key to start chatting with the AI assistant.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className={`flex-1 ${
              isFullScreen
                ? 'chat-messages scrollbar-thin'
                : 'chat-messages scrollbar-always'
            }`}
          >
            <div className="max-w-4xl w-full mx-auto px-4 py-6">
              <AnimatePresence>
                {(messages || []).map((message, index) => (
                  <Message
                    key={message.id}
                    message={message}
                    provider={provider}
                    onCopy={copyToClipboard}
                    index={index}
                    enableTyping={enableTypingAnimation && index === (messages || []).length - 1 && message.role === 'assistant'}
                  />
                ))}
              </AnimatePresence>
              
              {chatCompletionMutation.isPending && (
                <motion.div 
                  className="flex justify-start mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md p-0 max-w-[85%]">
                    <div className="flex items-center px-4 pt-4 pb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <span dangerouslySetInnerHTML={{ __html: provider.icon }} className="text-primary text-xs" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {provider.name}
                      </span>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <AnimatePresence>
          {!isAtBottom && (messages?.length || 0) > 0 && (
            <motion.div
              className="absolute bottom-20 right-4 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                onClick={scrollToBottom}
                size="icon"
                className="rounded-full shadow-lg"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className={`border-t border-border ${
          isFullScreen ? 'chat-input' : ''
        }`}>
          <div className="max-w-4xl w-full mx-auto p-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Send a message..."
                className="min-h-[60px] max-h-[200px] resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-16 pl-12 text-sm focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={chatCompletionMutation.isPending}
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 bottom-2 h-8 w-8 text-muted-foreground hover:text-primary"
                disabled={chatCompletionMutation.isPending}
              >
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                disabled={!input.trim() || chatCompletionMutation.isPending}
                onClick={() => handleSendMessage()}
              >
                {chatCompletionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                AI can make mistakes. Verify important information for CTF challenges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
