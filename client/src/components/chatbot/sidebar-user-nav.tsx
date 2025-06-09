'use client';

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserIcon, 
  LogOutIcon, 
  SettingsIcon,
  ChevronUpIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';

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

interface SidebarUserNavProps {
  user: User;
}

export function SidebarUserNav({ user }: SidebarUserNavProps) {
  const [, setLocation] = useLocation();
  const { logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfile = () => {
    setLocation('/profile');
    setIsOpen(false);
  };

  const handleSettings = () => {
    setLocation('/settings');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-auto p-2 hover:bg-accent"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.username} />
              <AvatarFallback className="text-xs">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium truncate">
                {user.username}
              </div>
              {user.email && (
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              )}
            </div>
          </div>
          <ChevronUpIcon className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56"
        side="top"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.username}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfile}>
          <UserIcon className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSettings}>
          <SettingsIcon className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOutIcon className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
