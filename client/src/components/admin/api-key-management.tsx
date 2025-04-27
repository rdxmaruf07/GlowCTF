import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Key, Trash, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface APIKey {
  id: number;
  provider: string;
  key: string;
  isActive: boolean;
  createdAt: string;
}

export default function APIKeyManagement() {
  const { toast } = useToast();
  const [openAIKey, setOpenAIKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openAIActive, setOpenAIActive] = useState(true);
  const [anthropicActive, setAnthropicActive] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["/api/admin/api-keys"],
    retry: false,
  });

  // Set form values when API keys are loaded
  useEffect(() => {
    if (apiKeys) {
      const openAIKeyData = apiKeys.find((key: APIKey) => key.provider === "openai");
      const anthropicKeyData = apiKeys.find((key: APIKey) => key.provider === "anthropic");
      
      if (openAIKeyData) {
        setOpenAIKey(openAIKeyData.key);
        setOpenAIActive(openAIKeyData.isActive);
      }
      
      if (anthropicKeyData) {
        setAnthropicKey(anthropicKeyData.key);
        setAnthropicActive(anthropicKeyData.isActive);
      }
    }
  }, [apiKeys]);

  // Update API key mutation
  const updateKeyMutation = useMutation({
    mutationFn: async (data: { provider: string; key: string; isActive: boolean }) => {
      const res = await apiRequest("PUT", "/api/admin/api-keys", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Updated",
        description: "The API key has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating API Key",
        description: error.message || "Failed to update API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/api-keys/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been successfully removed.",
      });
      setConfirmDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting API Key",
        description: error.message || "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const handleSaveOpenAI = () => {
    if (!openAIKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an OpenAI API key.",
        variant: "destructive",
      });
      return;
    }
    
    updateKeyMutation.mutate({
      provider: "openai",
      key: openAIKey,
      isActive: openAIActive,
    });
  };

  const handleSaveAnthropic = () => {
    if (!anthropicKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an Anthropic API key.",
        variant: "destructive",
      });
      return;
    }
    
    updateKeyMutation.mutate({
      provider: "anthropic",
      key: anthropicKey,
      isActive: anthropicActive,
    });
  };

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteKeyMutation.mutate(confirmDeleteId);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl">AI Provider API Keys</CardTitle>
        <CardDescription>Manage API keys for AI chatbot providers</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-6 bg-yellow-900/20 border-yellow-600">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            API keys are sensitive credentials. Make sure to use environment variables in production.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="openai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
          </TabsList>
          
          {/* OpenAI Tab */}
          <TabsContent value="openai" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  className="shrink-0"
                  onClick={handleSaveOpenAI}
                  disabled={updateKeyMutation.isPending}
                >
                  {updateKeyMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="openai-active" 
                checked={openAIActive}
                onCheckedChange={setOpenAIActive}
              />
              <Label htmlFor="openai-active">Enable OpenAI (GPT)</Label>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">API Key Information</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>OpenAI API keys start with <code className="bg-muted p-1 rounded text-xs">sk-</code></span>
                </li>
                <li className="flex items-center text-sm">
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI dashboard</a></span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          {/* Anthropic Tab */}
          <TabsContent value="anthropic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anthropic-key">Anthropic API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="anthropic-key"
                  type="password"
                  placeholder="sk_ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  className="shrink-0"
                  onClick={handleSaveAnthropic}
                  disabled={updateKeyMutation.isPending}
                >
                  {updateKeyMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="anthropic-active" 
                checked={anthropicActive}
                onCheckedChange={setAnthropicActive}
              />
              <Label htmlFor="anthropic-active">Enable Anthropic (Claude)</Label>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">API Key Information</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Anthropic API keys start with <code className="bg-muted p-1 rounded text-xs">sk_ant-</code></span>
                </li>
                <li className="flex items-center text-sm">
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Get your API key from <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic console</a></span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteKeyMutation.isPending}
            >
              {deleteKeyMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}