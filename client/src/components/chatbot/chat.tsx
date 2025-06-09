'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { generateUUID } from '@/lib/utils';
import { ChatHeader } from './chat-header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { useToast } from '@/hooks/use-toast';

interface UIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

interface Attachment {
  url: string;
  name: string;
  contentType: string;
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [status, setStatus] = useState<'ready' | 'submitted' | 'loading'>('ready');
  const [votes, setVotes] = useState<Vote[]>([]);

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
        stream: false,
      });

      return response.json();
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

  const handleSubmit = async (formData?: FormData) => {
    if (!input.trim() || status !== 'ready') return;

    const userMessage: UIMessage = {
      id: generateUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus('submitted');

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: input.trim(),
        provider: initialChatModel,
      });

      if (response && response.message) {
        const assistantMessage: UIMessage = {
          id: generateUUID(),
          role: 'assistant',
          content: response.message.content || "Sorry, I couldn't process your request.",
          timestamp: new Date(),
          isStreaming: true, // Enable typing animation
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle case where response is invalid
        const errorMessage: UIMessage = {
          id: generateUUID(),
          role: 'assistant',
          content: "Sorry, I received an invalid response. Please try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      setStatus('ready');
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Failed to send message:', error);
      setStatus('ready');
    }
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
        setInput(previousUserMessage.content);
        handleSubmit();
      }
    }
  };

  const stop = () => {
    setStatus('ready');
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleTypingComplete = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isStreaming: false } : msg
    ));
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <ChatHeader
        chatId={id}
        selectedModelId={initialChatModel}
        selectedVisibilityType={initialVisibilityType}
        isReadonly={isReadonly}
      />

      <div className="flex-1 overflow-hidden relative">
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
      </div>

      {!isReadonly && (
        <div className="chatbot-input shrink-0">
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
            handleSubmit={handleSubmit}
            selectedVisibilityType={initialVisibilityType}
            className="p-0"
          />
        </div>
      )}
    </div>
  );
}
