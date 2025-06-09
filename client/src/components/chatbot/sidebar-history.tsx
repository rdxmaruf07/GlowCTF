'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { isToday, isYesterday, subWeeks, subMonths } from 'date-fns';
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SidebarHistoryItem } from './sidebar-history-item';
import { useToast } from '@/hooks/use-toast';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  role: string;
  score: number;
  avatarUrl: string | null;
  createdAt: Date | null;
  isBanned: boolean;
  lastActive: Date | null;
}

interface SidebarHistoryProps {
  user: User | null | undefined;
  onSelectChat: (chatId: string) => void;
  currentChatId: string;
}

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);
      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
};

export function SidebarHistory({ user, onSelectChat, currentChatId }: SidebarHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch chat history
  const { data: chats = [], isLoading } = useQuery<Chat[]>({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/chatbot/history');
      return res.json();
    },
    enabled: !!user,
  });

  // Delete chat mutation
  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => {
      const res = await apiRequest('DELETE', `/api/chatbot/chat/${chatId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
      toast({
        title: 'Chat deleted',
        description: 'Chat has been deleted successfully.',
      });
      setShowDeleteDialog(false);
      
      // If the deleted chat was the current one, trigger new chat
      if (deleteId === currentChatId) {
        // This would need to be handled by the parent component
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete chat.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (chatId: string) => {
    setDeleteId(chatId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteChat.mutate(deleteId);
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Login to save and revisit previous chats!
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="space-y-2 p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              Today
            </div>
            {[44, 32, 28, 64, 52].map((width, index) => (
              <Skeleton
                key={index}
                className="h-8 rounded-md"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (chats.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your conversations will appear here once you start chatting!
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupedChats = groupChatsByDate(chats);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <AnimatePresence mode="popLayout">
              {groupedChats.today.length > 0 && (
                <motion.div
                  key="today"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                    Today
                  </div>
                  {groupedChats.today.map((chat) => (
                    <SidebarHistoryItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === currentChatId}
                      onSelect={() => onSelectChat(chat.id)}
                      onDelete={() => handleDelete(chat.id)}
                    />
                  ))}
                </motion.div>
              )}

              {groupedChats.yesterday.length > 0 && (
                <motion.div
                  key="yesterday"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1 mt-4">
                    Yesterday
                  </div>
                  {groupedChats.yesterday.map((chat) => (
                    <SidebarHistoryItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === currentChatId}
                      onSelect={() => onSelectChat(chat.id)}
                      onDelete={() => handleDelete(chat.id)}
                    />
                  ))}
                </motion.div>
              )}

              {groupedChats.lastWeek.length > 0 && (
                <motion.div
                  key="lastWeek"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1 mt-4">
                    Last 7 days
                  </div>
                  {groupedChats.lastWeek.map((chat) => (
                    <SidebarHistoryItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === currentChatId}
                      onSelect={() => onSelectChat(chat.id)}
                      onDelete={() => handleDelete(chat.id)}
                    />
                  ))}
                </motion.div>
              )}

              {groupedChats.lastMonth.length > 0 && (
                <motion.div
                  key="lastMonth"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1 mt-4">
                    Last 30 days
                  </div>
                  {groupedChats.lastMonth.map((chat) => (
                    <SidebarHistoryItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === currentChatId}
                      onSelect={() => onSelectChat(chat.id)}
                      onDelete={() => handleDelete(chat.id)}
                    />
                  ))}
                </motion.div>
              )}

              {groupedChats.older.length > 0 && (
                <motion.div
                  key="older"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1 mt-4">
                    Older
                  </div>
                  {groupedChats.older.map((chat) => (
                    <SidebarHistoryItem
                      key={chat.id}
                      chat={chat}
                      isActive={chat.id === currentChatId}
                      onSelect={() => onSelectChat(chat.id)}
                      onDelete={() => handleDelete(chat.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your chat
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
