import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Key } from "lucide-react";

interface APIKey {
  provider: string;
  apiKey: string;
  isActive: boolean;
}

async function fetchApiKeys(): Promise<APIKey[]> {
  const res = await fetch("/api/chatbot/keys");
  if (!res.ok) {
    throw new Error("Failed to fetch API keys");
  }
  return res.json();
}

async function updateApiKey(data: { provider: string; key: string; isActive?: boolean }): Promise<APIKey> {
  const res = await fetch("/api/chatbot/keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: data.provider, key: data.key }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update API key");
  }
  return res.json();
}

export function ApiKeyManagement() {
  const queryClient = useQueryClient();
  const { data: apiKeys, isLoading } = useQuery<APIKey[]>({
    queryKey: ["/api/chatbot/keys"],
    queryFn: fetchApiKeys,
  });

  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [xaiKey, setXaiKey] = useState("");
  const [geminiActive, setGeminiActive] = useState(false);
  const [groqActive, setGroqActive] = useState(false);
  const [xaiActive, setXaiActive] = useState(false);

  useEffect(() => {
    if (apiKeys && Array.isArray(apiKeys)) {
      const geminiKeyData = apiKeys.find((key: APIKey) => key.provider === "gemini");
      const groqKeyData = apiKeys.find((key: APIKey) => key.provider === "groq");
      const xaiKeyData = apiKeys.find((key: APIKey) => key.provider === "xai");

      if (geminiKeyData) {
        setGeminiKey(geminiKeyData.apiKey);
        setGeminiActive(geminiKeyData.isActive);
      }
      if (groqKeyData) {
        setGroqKey(groqKeyData.apiKey);
        setGroqActive(groqKeyData.isActive);
      }
      if (xaiKeyData) {
        setXaiKey(xaiKeyData.apiKey);
        setXaiActive(xaiKeyData.isActive);
      }
    }
  }, [apiKeys]);

  const updateKeyMutation = useMutation({
    mutationFn: updateApiKey,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/keys"] });
      toast({
        title: "API Key Updated",
        description: `The ${data.provider} API key has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API key.",
        variant: "destructive",
      });
    },
  });

  const handleGeminiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKeyMutation.mutate({
      provider: "gemini",
      key: geminiKey,
      isActive: geminiActive,
    });
  };

  const handleGroqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKeyMutation.mutate({
      provider: "groq",
      key: groqKey,
      isActive: groqActive,
    });
  };

  const handleXaiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKeyMutation.mutate({
      provider: "xai",
      key: xaiKey,
      isActive: xaiActive,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
        <CardDescription>Manage your API keys for different AI providers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gemini" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
            <TabsTrigger value="groq">Groq</TabsTrigger>
            <TabsTrigger value="xai">xAI (Grok)</TabsTrigger>
          </TabsList>

          {/* Gemini Tab */}
          <TabsContent value="gemini" className="space-y-4">
            <form onSubmit={handleGeminiSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-key">Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="gemini-key"
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="gemini-active"
                  checked={geminiActive}
                  onCheckedChange={(checked) => {
                    setGeminiActive(checked);
                    const geminiKeyData = apiKeys?.find((key: APIKey) => key.provider === "gemini");
                    if (geminiKeyData) {
                      updateKeyMutation.mutate({ provider: geminiKeyData.provider, key: geminiKeyData.apiKey, isActive: checked });
                    }
                  }}
                />
                <Label htmlFor="gemini-active">
                  {geminiActive ? "Gemini Enabled" : "Gemini Disabled"}
                </Label>
              </div>
              <Button type="submit">Save Gemini Key</Button>
            </form>
            <div className="mt-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></span>
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* Groq Tab */}
          <TabsContent value="groq" className="space-y-4">
            <form onSubmit={handleGroqSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groq-key">Groq API Key</Label>
                <Input
                  id="groq-key"
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="Enter your Groq API key"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="groq-active"
                  checked={groqActive}
                  onCheckedChange={(checked) => {
                    setGroqActive(checked);
                    const groqKeyData = apiKeys?.find((key: APIKey) => key.provider === "groq");
                    if (groqKeyData) {
                      updateKeyMutation.mutate({ provider: groqKeyData.provider, key: groqKeyData.apiKey, isActive: checked });
                    }
                  }}
                />
                <Label htmlFor="groq-active">
                  {groqActive ? "Groq Enabled" : "Groq Disabled"}
                </Label>
              </div>
              <Button type="submit">Save Groq Key</Button>
            </form>
            <div className="mt-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Groq Console</a></span>
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* xAI Tab */}
          <TabsContent value="xai" className="space-y-4">
            <form onSubmit={handleXaiSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="xai-key">xAI (Grok) API Key</Label>
                <Input
                  id="xai-key"
                  type="password"
                  value={xaiKey}
                  onChange={(e) => setXaiKey(e.target.value)}
                  placeholder="Enter your xAI API key (starts with xai-)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="xai-active"
                  checked={xaiActive}
                  onCheckedChange={(checked) => {
                    setXaiActive(checked);
                    const xaiKeyData = apiKeys?.find((key: APIKey) => key.provider === "xai");
                    if (xaiKeyData) {
                      updateKeyMutation.mutate({ provider: xaiKeyData.provider, key: xaiKeyData.apiKey, isActive: checked });
                    }
                  }}
                />
                <Label htmlFor="xai-active">
                  {xaiActive ? "xAI (Grok) Enabled" : "xAI (Grok) Disabled"}
                </Label>
              </div>
              <Button type="submit">Save xAI Key</Button>
            </form>
            <div className="mt-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Get your API key from <a href="https://vercel.com/glowctf/~/ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel AI Dashboard</a></span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}