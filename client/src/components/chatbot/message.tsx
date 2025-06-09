import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Edit, 
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ArtifactViewer from "./artifact-viewer";
import TypingText from "./typing-text";
import { useToast } from "@/hooks/use-toast";

// Helper function to check if a language is executable
const isExecutableLanguage = (language: string): boolean => {
  const executableLanguages = ['python', 'javascript', 'java', 'cpp', 'c', 'bash', 'shell'];
  return executableLanguages.includes(language.toLowerCase());
};

// Mock code execution function
const executeCode = async (code: string): Promise<string> => {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simulate different outputs based on code content
  if (code.includes('find_max')) {
    return `The list of numbers: [42, 17, 89, 3, 56, 91, 23, 67, 8, 45]
The maximum number is: 91`;
  }

  if (code.includes('print') || code.includes('console.log')) {
    return 'Hello, World!\nCode executed successfully.';
  }

  if (code.includes('def ') || code.includes('function ')) {
    return 'Function defined successfully.\nCode executed without errors.';
  }

  if (code.includes('import ') || code.includes('require(')) {
    return 'Dependencies imported successfully.\nCode executed without errors.';
  }

  // Default output
  return 'Code executed successfully.\nProcess finished with exit code 0.';
};

interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

interface ChatProvider {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

interface MessageProps {
  message: ChatMessage;
  provider: ChatProvider;
  onCopy: (content: string) => void;
  onEdit?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  index: number;
  enableTyping?: boolean;
}

export default function Message({
  message,
  provider,
  onCopy,
  onEdit,
  onRegenerate,
  index,
  enableTyping = false
}: MessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const { toast } = useToast();

  // Enable typing animation when enableTyping prop changes
  useEffect(() => {
    if (enableTyping && message.role === 'assistant') {
      setShowTyping(true);
    }
  }, [enableTyping, message.role]);

  // Extract code blocks and artifacts from message content
  const parseMessageContent = (content: string) => {
    const parts: Array<{ type: 'text' | 'artifact'; content: string; title?: string; language?: string }> = [];
    
    // Look for code blocks with titles (artifacts)
    const artifactRegex = /```(\w+)?\s*(?:\/\/\s*(.+?)\n)?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = artifactRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({ type: 'text', content: textContent });
        }
      }

      const language = match[1] || 'text';
      const title = match[2] || `${language.charAt(0).toUpperCase() + language.slice(1)} Code`;
      const code = match[3].trim();

      // Check if this should be an artifact (make it more lenient)
      if (match[2] || code.split('\n').length > 2 || code.length > 50 || isExecutableLanguage(language)) {
        parts.push({
          type: 'artifact',
          content: code,
          title,
          language
        });
      } else {
        // Keep as regular code block
        parts.push({
          type: 'text',
          content: `\`\`\`${language}\n${code}\n\`\`\``
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex).trim();
      if (remainingContent) {
        parts.push({ type: 'text', content: remainingContent });
      }
    }

    // If no artifacts found, return the whole content as text
    if (parts.length === 0) {
      parts.push({ type: 'text', content });
    }

    return parts;
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith('Error:')) {
      return (
        <div className="bg-red-900/20 border border-red-500 rounded-md p-3 text-red-400">
          <div className="flex items-center mb-2">
            <span className="font-medium">API Error</span>
          </div>
          <p>{content.substring(7)}</p>
        </div>
      );
    }

    const parts = parseMessageContent(content);
    
    return (
      <div className="space-y-4">
        {parts.map((part, partIndex) => (
          <div key={partIndex}>
            {part.type === 'text' ? (
              <div className="prose prose-invert max-w-none">
                {showTyping && partIndex === 0 ? (
                  <div className="typing-container">
                    <TypingText
                      text={part.content}
                      speed={15}
                      onComplete={() => setShowTyping(false)}
                      className="whitespace-pre-wrap"
                    />
                  </div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Headings
                      h1: ({children}) => <h1 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground border-b border-border pb-1">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
                      h4: ({children}) => <h4 className="text-sm font-semibold mt-3 mb-1 text-foreground">{children}</h4>,
                      
                      // Paragraphs
                      p: ({children}) => <p className="mb-3 leading-7 text-foreground">{children}</p>,
                      
                      // Lists
                      ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-foreground leading-6">{children}</li>,
                      
                      // Links
                      a: ({href, children}) => (
                        <a 
                          href={href} 
                          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      
                      // Emphasis
                      strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({children}) => <em className="italic text-foreground">{children}</em>,
                      
                      // Blockquotes
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/30 rounded-r-lg">
                          <div className="text-foreground/90 italic">{children}</div>
                        </blockquote>
                      ),
                      
                      // Tables
                      table: ({children}) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full border-collapse border border-border rounded-lg">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({children}) => <thead className="bg-muted/50">{children}</thead>,
                      th: ({children}) => (
                        <th className="border border-border px-3 py-2 text-left font-semibold text-foreground text-sm">
                          {children}
                        </th>
                      ),
                      td: ({children}) => (
                        <td className="border border-border px-3 py-2 text-foreground text-sm">
                          {children}
                        </td>
                      ),
                      
                      // Code blocks
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="code-block">
                            <div className="code-block-header">
                              <span className="text-xs font-medium text-muted-foreground">
                                {match[1].toUpperCase()}
                              </span>
                              <div className="code-block-actions">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-background/50"
                                  onClick={() => onCopy(String(children).replace(/\n$/, ''))}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="code-block-content">
                              <pre>
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <code className="bg-muted/60 px-1.5 py-0.5 rounded text-foreground font-mono text-sm" {...props}>
                            {children}
                          </code>
                        );
                      },
                      
                      // Horizontal rule
                      hr: () => <hr className="my-6 border-border" />,
                    }}
                  >
                    {part.content}
                  </ReactMarkdown>
                )}
              </div>
            ) : (
              <ArtifactViewer
                title={part.title!}
                content={part.content}
                language={part.language!}
                type="code"
                canExecute={isExecutableLanguage(part.language!)}
                onExecute={executeCode}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    toast({
      title: "Feedback recorded",
      description: `Thank you for your ${type} feedback!`,
    });
  };

  return (
    <motion.div
      className={`message-container ${message.role === 'user' ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {message.role === 'user' ? (
        /* User Message */
        <div className="bg-primary text-primary-foreground rounded-3xl px-4 py-3 shadow-sm">
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      ) : (
        /* Assistant Message */
        <div className="w-full">
          {/* Assistant Header */}
          <div className="flex items-center mb-2 px-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-3 border border-primary/20">
              <span dangerouslySetInnerHTML={{ __html: provider.icon }} className="text-primary text-xs" />
            </div>
            <span className="text-sm font-medium text-foreground/80">
              {provider.name}
            </span>
            {message.isStreaming && (
              <div className="ml-auto flex items-center space-x-1">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
          </div>
          
          {/* Assistant Content */}
          <div className="bg-transparent">
            <div className="text-[15px] leading-relaxed text-foreground">
              {showTyping && index === 0 ? (
                <div className="typing-container">
                  <TypingText
                    text={message.content}
                    speed={15}
                    onComplete={() => setShowTyping(false)}
                    className="whitespace-pre-wrap"
                  />
                </div>
              ) : (
                renderMessageContent(message.content)
              )}
            </div>
          </div>
          
          {/* Message Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="message-actions bg-background/95 backdrop-blur-sm rounded-lg shadow-sm border border-border flex items-center space-x-1 px-2 py-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-green-600 hover:bg-green-50/10"
                  onClick={() => handleFeedback('positive')}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Good</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-red-600 hover:bg-red-50/10"
                  onClick={() => handleFeedback('negative')}
                >
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Bad</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  onClick={() => onCopy(message.content)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Copy</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48" side="bottom" sideOffset={5}>
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(message.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit message
                      </DropdownMenuItem>
                    )}
                    {onRegenerate && (
                      <DropdownMenuItem onClick={() => onRegenerate(message.id)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate response
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
