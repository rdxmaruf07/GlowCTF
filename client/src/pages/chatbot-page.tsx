import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import ChatWindow from "@/components/chatbot/chat-window";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { CHATBOT_PROVIDERS } from "@/lib/constants";

interface ChatProvider {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState("");
  const [selectedApiProvider, setSelectedApiProvider] = useState("");
  
  // Get user's API keys
  const { data: userApiKeys, isLoading: keysLoading } = useQuery({
    queryKey: ['/api/chatbot/keys'],
    enabled: !!user,
  });
  
  // Get chat history
  const { data: chatHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/chatbot/history'],
    enabled: !!user,
  });
  
  // Save API key mutation
  const saveApiKeyMutation = useMutation({
    mutationFn: async ({ provider, key }: { provider: string, key: string }) => {
      const res = await apiRequest("POST", "/api/chatbot/keys", { provider, key });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot/keys'] });
      toast({
        title: "API Key Saved",
        description: `Your ${selectedApiProvider} API key has been saved.`,
      });
      setNewApiKey("");
      setSelectedApiProvider("");
    },
    onError: (error) => {
      toast({
        title: "Failed to save API key",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Process providers with availability
  const providers: ChatProvider[] = CHATBOT_PROVIDERS.map(provider => {
    const isAvailable = userApiKeys?.some((key: any) => key.provider === provider.id);
    return {
      ...provider,
      available: isAvailable
    };
  });
  
  // Set the first available provider as selected by default
  useEffect(() => {
    if (providers.length && !selectedProvider) {
      const availableProvider = providers.find(p => p.available);
      if (availableProvider) {
        setSelectedProvider(availableProvider.id);
      } else if (providers.length) {
        setSelectedProvider(providers[0].id);
      }
    }
  }, [providers, selectedProvider]);
  
  // Handle API key submission
  const handleSaveApiKey = () => {
    if (!selectedApiProvider || !newApiKey.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a provider and enter an API key.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation for API key format
    const apiKeyValidation = validateApiKey(selectedApiProvider, newApiKey);
    if (!apiKeyValidation.valid) {
      toast({
        title: "Invalid API key format",
        description: apiKeyValidation.message,
        variant: "destructive",
      });
      return;
    }
    
    saveApiKeyMutation.mutate({
      provider: selectedApiProvider,
      key: newApiKey
    });
  };
  
  // Basic API key format validation
  const validateApiKey = (provider: string, key: string) => {
    // Remove any whitespace
    const trimmedKey = key.trim();
    
    switch (provider) {
      case "openai":
        if (!trimmedKey.startsWith("sk-") || trimmedKey.length < 20) {
          return { 
            valid: false, 
            message: "OpenAI API keys should start with 'sk-' and be at least 20 characters long." 
          };
        }
        break;
      case "anthropic":
        if (!trimmedKey.startsWith("sk-ant-") || trimmedKey.length < 20) {
          return { 
            valid: false, 
            message: "Anthropic API keys should start with 'sk-ant-' and be at least 20 characters long." 
          };
        }
        break;
      case "gemini":
        if (trimmedKey.length < 20) {
          return { 
            valid: false, 
            message: "Gemini API keys should be at least 20 characters long." 
          };
        }
        break;
      // Add validation for other providers as needed
    }
    
    return { valid: true, message: "" };
  };
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">AI Chatbot</h1>
            <p className="text-muted-foreground">Get help with your challenges using AI assistants.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Window - Now placed first and wider */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <ChatWindow
              provider={
                providers.find(p => p.id === selectedProvider) || 
                { id: "", name: "Select a provider", icon: "", available: false }
              }
              apiKeysAvailable={userApiKeys?.length > 0}
              chatHistory={chatHistory}
              historyLoading={historyLoading}
            />
          </div>
          
          {/* Chatbot Sidebar - Now placed second and narrower */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="bg-card rounded-lg p-5">
              {/* API Key Management - Moved to top */}
              <div className="p-4 border border-border rounded-md mb-6">
                <h3 className="font-medium text-white text-sm mb-3">API Keys</h3>
                <p className="text-muted-foreground text-xs mb-3">Add your API keys to use these assistants.</p>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
                      Manage API Keys
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Manage API Keys</DialogTitle>
                      <DialogDescription>
                        Add your AI provider API keys to use the assistants. Your keys are securely stored.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="provider" className="text-right">
                          Provider
                        </Label>
                        <select
                          id="provider"
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={selectedApiProvider}
                          onChange={(e) => setSelectedApiProvider(e.target.value)}
                        >
                          <option value="">Select a provider</option>
                          {CHATBOT_PROVIDERS.map(provider => (
                            <option key={provider.id} value={provider.id}>{provider.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apiKey" className="text-right">
                          API Key
                        </Label>
                        <Input
                          id="apiKey"
                          value={newApiKey}
                          onChange={(e) => setNewApiKey(e.target.value)}
                          className="col-span-3"
                          placeholder="Enter your API key"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleSaveApiKey} disabled={saveApiKeyMutation.isPending}>
                        {saveApiKeyMutation.isPending ? "Saving..." : "Save API Key"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <h3 className="font-medium text-white mb-4">Available Assistants</h3>
              
              {/* Chatbot Selection */}
              <div className="space-y-2 mb-6">
                {keysLoading ? (
                  <>
                    <Skeleton className="h-14 w-full rounded-md" />
                    <Skeleton className="h-14 w-full rounded-md" />
                    <Skeleton className="h-14 w-full rounded-md" />
                  </>
                ) : (
                  providers.map((provider) => (
                    <button
                      key={provider.id}
                      className={`w-full flex items-center p-3 rounded-md 
                        ${selectedProvider === provider.id 
                          ? 'bg-primary/10 border border-primary text-primary' 
                          : (provider.available 
                              ? 'hover:bg-secondary hover:text-primary transition' 
                              : 'text-muted-foreground hover:bg-secondary/50 transition cursor-not-allowed'
                            )
                        }`}
                      onClick={() => provider.available && setSelectedProvider(provider.id)}
                      disabled={!provider.available}
                    >
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center mr-3">
                        <span dangerouslySetInnerHTML={{ __html: provider.icon }} />
                      </div>
                      <span>{provider.name}</span>
                      {!provider.available && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                          No API Key
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
