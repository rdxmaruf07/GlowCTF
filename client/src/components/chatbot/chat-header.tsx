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
      className="flex items-center justify-center px-4 py-3 border-b border-border"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Select value={selectedModelId} disabled={isReadonly}>
        <SelectTrigger className="w-48 h-8 text-sm">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gemini">Gemini</SelectItem>
          <SelectItem value="groq">Groq</SelectItem>
          <SelectItem value="xai">xAI (Grok)</SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  );
}
