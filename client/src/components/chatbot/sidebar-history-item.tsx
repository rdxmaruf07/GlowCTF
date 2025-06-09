'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MessageSquareIcon, 
  MoreHorizontalIcon, 
  TrashIcon,
  EditIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface SidebarHistoryItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function SidebarHistoryItem({
  chat,
  isActive,
  onSelect,
  onDelete,
}: SidebarHistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // TODO: Implement title editing API call
    setIsEditing(false);
    console.log('Save edit:', editTitle);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(chat.title);
  };

  const formatTimestamp = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <SidebarMenuItem>
      <motion.div
        className={cn(
          'group relative flex items-center w-full',
          isActive && 'bg-accent'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {isEditing ? (
          <div className="flex-1 p-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              onBlur={handleSaveEdit}
              className="w-full bg-transparent border-none outline-none text-sm"
              autoFocus
            />
          </div>
        ) : (
          <SidebarMenuButton
            onClick={onSelect}
            isActive={isActive}
            className="flex-1 justify-start gap-2 px-2 py-2 h-auto min-h-[2rem]"
          >
            <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <div className="truncate text-sm font-medium">
                {chat.title || 'Untitled Chat'}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimestamp(chat.updatedAt)}
              </div>
            </div>
          </SidebarMenuButton>
        )}

        {/* Actions Menu */}
        {(isHovered || isActive) && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent-foreground/10"
                >
                  <MoreHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleEdit}>
                  <EditIcon className="h-3 w-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </motion.div>
    </SidebarMenuItem>
  );
}
