'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/app-layout";
import AnimatedPage from "@/components/ui/animated-page";
import { Chat } from "@/components/chatbot/chat";
import { AppSidebar } from "@/components/chatbot/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SettingsIcon,
  KeyIcon,
  BrainIcon,
} from "lucide-react";
import { generateUUID } from "@/lib/utils";
import { CHATBOT_PROVIDERS } from "@/lib/constants";

interface ChatbotKey {
  id: number;
  provider: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [newApiKey, setNewApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>(() => generateUUID());

  // Fetch API keys
  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<ChatbotKey[]>({
    queryKey: ["/api/chatbot/keys"],
    queryFn: () => apiRequest("/api/chatbot/keys"),
  });

  // Add API key mutation
  const addKeyMutation = useMutation({
    mutationFn: async (data: { provider: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/chatbot/keys", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/keys"] });
      setNewApiKey("");
      toast({
        title: "Success",
        description: "API key added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add API key",
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest("DELETE", `/api/chatbot/keys/${keyId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  const handleAddKey = () => {
    if (!newApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    addKeyMutation.mutate({
      provider: selectedProvider,
      apiKey: newApiKey.trim(),
    });
  };

  const handleNewChat = () => {
    setCurrentChatId(generateUUID());
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="chatbot-layout flex w-full">
          <SidebarProvider>
            <AppSidebar
              user={user}
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              currentChatId={currentChatId}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
            <SidebarInset className="chatbot-main">
              <Chat
                id={currentChatId}
                initialMessages={[]}
                initialChatModel={selectedProvider}
                initialVisibilityType="private"
                isReadonly={false}
                session={{ user }}
                autoResume={false}
              />
            </SidebarInset>
          </SidebarProvider>
        </div>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chatbot Settings</DialogTitle>
              <DialogDescription>
                Manage your AI provider API keys and settings
              </DialogDescription>
            </DialogHeader>

              <div className="space-y-6">
                {/* Add New API Key */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <KeyIcon className="h-5 w-5 mr-2" />
                    Add API Key
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="aiml">AI/ML API</SelectItem>
                          <SelectItem value="openrouter">OpenRouter</SelectItem>
                          <SelectItem value="together">Together.ai</SelectItem>
                          <SelectItem value="groq">Groq</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="Enter API key"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddKey}
                        disabled={addKeyMutation.isPending}
                        className="w-full"
                      >
                        {addKeyMutation.isPending ? "Adding..." : "Add Key"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Existing API Keys */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Existing API Keys</h3>
                  {keysLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : apiKeys.length === 0 ? (
                    <p className="text-muted-foreground">No API keys configured</p>
                  ) : (
                    <div className="space-y-2">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div>
                            <p className="font-medium capitalize">{key.provider}</p>
                            <p className="text-sm text-muted-foreground">
                              {key.apiKey.substring(0, 8)}...
                              {key.isActive ? " (Active)" : " (Inactive)"}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteKeyMutation.mutate(key.id)}
                            disabled={deleteKeyMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
          </DialogContent>
        </Dialog>
      </AnimatedPage>
    </AppLayout>
  );
}
