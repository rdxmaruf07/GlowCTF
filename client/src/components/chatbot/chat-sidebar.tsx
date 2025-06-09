import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PlusIcon, 
  MessageSquareIcon, 
  SearchIcon, 
  SettingsIcon,
  TrashIcon,
  EditIcon,
  MoreHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
  className?: string;
  chatHistory?: any[];
  historyLoading?: boolean;
}

export default function ChatSidebar({
  isCollapsed = false,
  onToggleCollapse,
  onNewChat,
  onSelectChat,
  currentChatId,
  className,
  chatHistory = [],
  historyLoading = false
}: ChatSidebarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Convert chat history to chat sessions format
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const sessions = chatHistory.map((chat: any) => ({
        id: chat.id.toString(),
        title: chat.title || "Untitled Chat",
        lastMessage: chat.messages && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].content.substring(0, 100) + "..."
          : "No messages",
        timestamp: new Date(chat.createdAt),
        messageCount: chat.messages ? chat.messages.length : 0
      }));
      setChatSessions(sessions);
    } else {
      setChatSessions([]);
    }
  }, [chatHistory]);

  const filteredChats = chatSessions.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
  };

  const handleRenameChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement rename functionality
    console.log("Rename chat:", chatId);
  };

  return (
    <motion.div
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-80",
        className
      )}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 320 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <MessageSquareIcon className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-white">Chat History</h2>
          </motion.div>
        )}
        
        <div className="flex items-center space-x-1">
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="text-muted-foreground hover:text-primary"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-muted-foreground hover:text-primary"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <motion.div
          className="p-4 border-b border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </motion.div>
      )}

      {/* New Chat Button (when collapsed) */}
      {isCollapsed && (
        <div className="p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="w-full text-muted-foreground hover:text-primary"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {historyLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                {!isCollapsed ? (
                  <>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </>
                ) : (
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                )}
              </div>
            ))
          ) : (
            <AnimatePresence>
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group relative rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-secondary/50",
                    currentChatId === chat.id && "bg-primary/10 border border-primary/20",
                    isCollapsed && "p-2"
                  )}
                  onClick={() => onSelectChat?.(chat.id)}
                >
                  {isCollapsed ? (
                    // Collapsed view - just an icon
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageSquareIcon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  ) : (
                    // Expanded view
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                            {chat.title}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {chat.lastMessage}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(chat.timestamp)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {chat.messageCount} messages
                            </span>
                          </div>
                        </div>

                        {/* Chat Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontalIcon className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleRenameChat(chat.id, e)}>
                                <EditIcon className="mr-2 h-3 w-3" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <TrashIcon className="mr-2 h-3 w-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!historyLoading && filteredChats.length === 0 && !isCollapsed && (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MessageSquareIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No chats found" : "No chat history yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Start a new conversation to see it here"}
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          className="p-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground truncate">
                {user?.username || "User"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
