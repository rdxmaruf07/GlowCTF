'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreviewMessage } from './preview-message';
import { Greeting } from './greeting';

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

interface MessagesProps {
  chatId: string;
  status: 'ready' | 'submitted' | 'loading';
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
  reload: () => void;
  isReadonly: boolean;
  isArtifactVisible: boolean;
  onSuggestedQuestion?: (question: string) => void;
  onTypingComplete?: (messageId: string) => void;
}

export function Messages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isArtifactVisible,
  onSuggestedQuestion,
  onTypingComplete,
}: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="chatbot-messages space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {messages.length === 0 && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Greeting onSuggestedQuestion={onSuggestedQuestion} />
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.05 
            }}
          >
            <PreviewMessage
              chatId={chatId}
              message={message}
              vote={votes?.find(vote => vote.messageId === message.id)}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
              requiresScrollPadding={index === messages.length - 1}
              onTypingComplete={onTypingComplete}
            />
          </motion.div>
        ))}

        {status === 'submitted' && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center space-x-2 p-4"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-muted-foreground">AI is thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
}
