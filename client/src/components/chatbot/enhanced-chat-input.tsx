'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square, 
  Smile,
  Zap,
  Loader2,
  ArrowUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (message?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function EnhancedChatInput({
  input,
  setInput,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Message GlowCTF AI...",
  className
}: EnhancedChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload functionality
    console.log('File upload clicked');
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      // TODO: Stop recording and process audio
    } else {
      setIsRecording(true);
      // TODO: Start recording audio
    }
  };

  const suggestedPrompts = [
    "Explain this code",
    "Find vulnerabilities",
    "Optimize performance",
    "Add documentation"
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Suggested prompts when empty */}
      <AnimatePresence>
        {!input && !isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-0 right-0 z-10"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {suggestedPrompts.map((prompt, index) => (
                <motion.button
                  key={prompt}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setInput(prompt)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 border border-border rounded-full transition-colors"
                >
                  <Zap className="h-3 w-3 mr-1 inline" />
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container */}
      <motion.div
        className={cn(
          "relative flex items-end gap-2 p-3 bg-background border border-border rounded-2xl shadow-sm transition-all duration-200",
          isFocused && "border-primary/50 shadow-md",
          disabled && "opacity-50"
        )}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* File upload button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileUpload}
          disabled={disabled}
          className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-colors"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-sm leading-6 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
              "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            )}
            rows={1}
          />
          
          {/* Character count for long messages */}
          {input.length > 500 && (
            <div className="absolute -bottom-5 right-0 text-xs text-muted-foreground">
              {input.length}/2000
            </div>
          )}
        </div>

        {/* Voice recording button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVoiceRecord}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 h-8 w-8 p-0 transition-colors",
            isRecording 
              ? "text-red-500 hover:text-red-600" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          {isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Square className="h-4 w-4" />
            </motion.div>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading || disabled}
          size="sm"
          className={cn(
            "flex-shrink-0 h-8 w-8 p-0 rounded-full transition-all duration-200",
            input.trim() && !isLoading
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <motion.div
              animate={input.trim() ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ArrowUp className="h-4 w-4" />
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-0 right-0 flex items-center justify-center"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
              <span className="text-sm text-red-500 font-medium">Recording...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typing indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-8 left-4 text-xs text-muted-foreground"
        >
          AI is typing...
        </motion.div>
      )}
    </div>
  );
}