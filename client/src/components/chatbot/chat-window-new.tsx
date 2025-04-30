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
