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
  SettingsIcon,
  ChevronDownIcon,
  Sparkles,
  HistoryIcon,
  BrainIcon
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from '@/lib/utils';

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

interface AppSidebarProps {
  user: User | null | undefined;
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
    <Sidebar className="w-72 border-r border-border bg-background/95 backdrop-blur-sm">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <BrainIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">GlowCTF AI</h2>
            <p className="text-xs text-muted-foreground">CTF Assistant</p>
          </div>
        </div>
        
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 rounded-lg"
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-hidden p-2">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="w-full text-left p-3 flex items-center justify-between hover:bg-accent/50 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Chats</span>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <SidebarHistory
              user={user}
              onSelectChat={handleSelectChat}
              currentChatId={currentChatId}
            />
          </CollapsibleContent>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={onOpenSettings}
              className="w-full justify-start gap-2 hover:bg-accent/50 rounded-lg"
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Button>
            
            {user && (
              <div className="mt-2">
                <SidebarUserNav user={user} />
              </div>
            )}
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
