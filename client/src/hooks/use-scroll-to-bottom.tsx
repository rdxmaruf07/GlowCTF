'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export function useScrollToBottom() {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') || scrollAreaRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const checkIfAtBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') || scrollAreaRef.current;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const threshold = 100; // pixels from bottom
      const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
      setIsAtBottom(atBottom);
    }
  }, []);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') || scrollAreaRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      checkIfAtBottom();
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom]);

  // Initial check
  useEffect(() => {
    checkIfAtBottom();
  }, [checkIfAtBottom]);

  return {
    isAtBottom,
    scrollToBottom,
    scrollAreaRef,
  };
}
