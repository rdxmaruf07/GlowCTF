'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowUpIcon,
  PaperclipIcon,
  StopCircle,
  ArrowDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (input: string) => void;
  status: 'ready' | 'submitted' | 'loading';
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: (attachments: Attachment[] | ((prev: Attachment[]) => Attachment[])) => void;
  messages: Array<UIMessage>;
  setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
  append: (message: { role: 'user' | 'assistant'; content: string }) => void;
  handleSubmit: (formData?: FormData) => void;
  selectedVisibilityType: 'private' | 'public';
  className?: string;
}

export function MultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  selectedVisibilityType,
  className,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '60px';
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const submitForm = useCallback(() => {
    if (!input.trim() || status !== 'ready') return;
    
    handleSubmit();
    resetHeight();
    
    // Focus back to textarea after submission
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [input, status, handleSubmit]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (status !== 'ready') {
        toast({
          title: 'Please wait',
          description: 'Please wait for the model to finish its response!',
          variant: 'destructive',
        });
      } else {
        submitForm();
      }
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      setUploadQueue(files.map(file => file.name));

      try {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            return {
              url: data.url,
              name: data.pathname,
              contentType: data.contentType,
            };
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
          }
        });

        const uploadedAttachments = await Promise.all(uploadPromises);
        setAttachments(prev => [...prev, ...uploadedAttachments]);
        
        toast({
          title: 'Files uploaded',
          description: `${files.length} file(s) uploaded successfully.`,
        });
      } catch (error: any) {
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload files.',
          variant: 'destructive',
        });
      } finally {
        setUploadQueue([]);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [setAttachments, toast]
  );

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('relative', className)}>
      {/* Attachments Preview */}
      <AnimatePresence>
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex flex-wrap gap-2"
          >
            {attachments.map((attachment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
              >
                <span className="text-sm truncate max-w-32">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  ×
                </Button>
              </motion.div>
            ))}
            
            {uploadQueue.map((filename, index) => (
              <motion.div
                key={`uploading-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg"
              >
                <span className="text-sm text-muted-foreground truncate max-w-32">
                  {filename}
                </span>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          className="min-h-[60px] max-h-[200px] resize-none pr-20 pl-12"
          disabled={status !== 'ready'}
        />

        {/* File Upload Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 bottom-2 h-8 w-8"
          onClick={() => fileInputRef.current?.click()}
          disabled={status !== 'ready'}
        >
          <PaperclipIcon className="h-4 w-4" />
        </Button>

        {/* Submit/Stop Button */}
        <div className="absolute right-2 bottom-2">
          {status === 'submitted' ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={stop}
              className="h-8 w-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={submitForm}
              disabled={!input.trim() || uploadQueue.length > 0}
              className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.txt,.md,.json,.csv"
        />
      </div>
    </div>
  );
}
