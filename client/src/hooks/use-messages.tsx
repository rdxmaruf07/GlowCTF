'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface UseMessagesProps {
  chatId: string;
  status: 'ready' | 'submitted' | 'loading';
}

export function useMessages({ chatId, status }: UseMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Track if user has sent a message
  useEffect(() => {
    if (status === 'submitted') {
      setHasSentMessage(true);
    }
  }, [status]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Check if user is at bottom of scroll
  const checkIfAtBottom = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const threshold = 100; // pixels from bottom
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  }, []);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkIfAtBottom);
    return () => container.removeEventListener('scroll', checkIfAtBottom);
  }, [checkIfAtBottom]);

  // Auto-scroll when status changes to submitted or when at bottom
  useEffect(() => {
    if (status === 'submitted' || isAtBottom) {
      scrollToBottom();
    }
  }, [status, isAtBottom, scrollToBottom]);

  const onViewportEnter = useCallback(() => {
    setIsAtBottom(true);
  }, []);

  const onViewportLeave = useCallback(() => {
    setIsAtBottom(false);
  }, []);

  return {
    containerRef,
    endRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
    isAtBottom,
    scrollToBottom,
  };
}
