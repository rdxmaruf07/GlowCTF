'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BrainIcon, 
  SettingsIcon,
  ShareIcon,
  MoreHorizontalIcon 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: 'private' | 'public';
  isReadonly: boolean;
}

export function ChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: ChatHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleShare = () => {
    // Copy chat URL to clipboard
    const url = `${window.location.origin}/chat/${chatId}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleExport = () => {
    // Export chat functionality
    console.log('Export chat:', chatId);
  };

  return (
    <motion.div
      className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm shrink-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center space-x-2">
          <BrainIcon className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">AI Assistant</h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Model Selector */}
        <Select value={selectedModelId} disabled={isReadonly}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI GPT-4</SelectItem>
            <SelectItem value="anthropic">Claude 3.5</SelectItem>
            <SelectItem value="gemini">Gemini Pro</SelectItem>
            <SelectItem value="groq">Groq Llama</SelectItem>
            <SelectItem value="aiml">AI/ML API</SelectItem>
            <SelectItem value="openrouter">OpenRouter</SelectItem>
            <SelectItem value="together">Together.ai</SelectItem>
          </SelectContent>
        </Select>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <ShareIcon className="h-4 w-4 mr-2" />
              Share Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              Export Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
