'use client';

import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu,
  useSidebar 
} from '@/components/ui/sidebar';
import { SidebarHistory } from './sidebar-history';
import { SidebarUserNav } from './sidebar-user-nav';
import { 
  PlusIcon, 
  MessageSquareIcon,
  SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface AppSidebarProps {
  user: User | undefined;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId: string;
  onOpenSettings: () => void;
}

export function AppSidebar({
  user,
  onNewChat,
  onSelectChat,
  currentChatId,
  onOpenSettings
}: AppSidebarProps) {
  const { setOpenMobile } = useSidebar();

  const handleNewChat = () => {
    setOpenMobile(false);
    onNewChat();
  };

  const handleSelectChat = (chatId: string) => {
    setOpenMobile(false);
    onSelectChat(chatId);
  };

  return (
    <Sidebar className="chatbot-sidebar">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareIcon className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">AI Chat</span>
        </div>

        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-hidden">
        <SidebarHistory 
          user={user}
          onSelectChat={handleSelectChat}
          currentChatId={currentChatId}
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <div className="flex flex-col gap-2 p-2">
            <Button
              variant="ghost"
              onClick={onOpenSettings}
              className="w-full justify-start gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Button>
            
            {user && (
              <SidebarUserNav user={user} />
            )}
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
