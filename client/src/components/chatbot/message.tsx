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
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <pre className="bg-muted rounded-md p-4 overflow-x-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-secondary/50 px-1 py-0.5 rounded text-primary font-mono text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
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
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`group relative max-w-[85%] ${
        message.role === 'user'
          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
          : 'bg-card border border-border rounded-2xl rounded-bl-md'
      } ${message.role === 'user' ? 'px-4 py-3' : 'p-0'}`}>
        
        {/* Assistant message header */}
        {message.role !== 'user' && (
          <div className="flex items-center px-4 pt-4 pb-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <span dangerouslySetInnerHTML={{ __html: provider.icon }} className="text-primary text-xs" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {provider.name}
            </span>
          </div>
        )}
        
        {/* Message content */}
        <div className={`${message.role === 'user' ? '' : 'px-4 pb-4'}`}>
          {message.role === 'user' ? (
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            renderMessageContent(message.content)
          )}
        </div>

        {/* Message actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className={`absolute ${message.role === 'user' ? 'left-0 top-0 -translate-x-full' : 'right-0 top-0 translate-x-full'} flex items-center space-x-1 px-2`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {message.role === 'assistant' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-green-500"
                    onClick={() => handleFeedback('positive')}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-500"
                    onClick={() => handleFeedback('negative')}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => onCopy(message.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(message.id)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {message.role === 'assistant' && onRegenerate && (
                    <DropdownMenuItem onClick={() => onRegenerate(message.id)}>
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Regenerate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
