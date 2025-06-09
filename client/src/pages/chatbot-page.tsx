'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ChatbotLayout from "@/components/layout/chatbot-layout";
import AnimatedPage from "@/components/ui/animated-page";
import { EnhancedChat } from "@/components/chatbot/enhanced-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Sparkles,
} from "lucide-react";
import { generateUUID } from "@/lib/utils";

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
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [newApiKey, setNewApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChatId] = useState<string>(() => generateUUID());

  // Fetch API keys
  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<ChatbotKey[]>({
    queryKey: ["/api/chatbot/keys"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/chatbot/keys");
      return response.json();
    },
  });

  // Add API key mutation
  const addKeyMutation = useMutation({
    mutationFn: async (data: { provider: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/chatbot/keys", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
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

  return (
    <ChatbotLayout>
      <AnimatedPage>
        <div className="flex flex-col h-full bg-background">
          {/* Simple Header */}
          <motion.div 
            className="flex items-center justify-between p-4 border-b border-border bg-background"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">GlowCTF AI Assistant</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedProvider === 'gemini' ? 'bg-blue-500' :
                    selectedProvider === 'groq' ? 'bg-orange-500' :
                    selectedProvider === 'xai' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="capitalize">{selectedProvider}</span>
                  <span className="text-green-500">● Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="xai">xAI</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </motion.div>

          {/* Chat Area */}
          <div className="flex-1 min-h-0">
            <EnhancedChat
              id={currentChatId}
              initialChatModel={selectedProvider}
              session={{ user }}
            />
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Chatbot Settings
              </DialogTitle>
              <DialogDescription>
                Manage your AI provider API keys
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Add New API Key */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Add API Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Gemini</SelectItem>
                        <SelectItem value="groq">Groq</SelectItem>
                        <SelectItem value="xai">xAI (Grok)</SelectItem>
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
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-border rounded-lg">
                    <KeyIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No API keys configured</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add an API key to start using the AI chatbot
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            key.provider === 'gemini' ? 'bg-blue-500' :
                            key.provider === 'groq' ? 'bg-orange-500' :
                            key.provider === 'xai' ? 'bg-purple-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="font-medium capitalize">{key.provider}</p>
                            <p className="text-sm text-muted-foreground">
                              {key.apiKey.substring(0, 8)}...
                            </p>
                          </div>
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
    </ChatbotLayout>
  );
}