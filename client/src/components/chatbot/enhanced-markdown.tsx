'use client';

import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Download, Terminal, Code2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

interface EnhancedMarkdownProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

// Helper function to extract text content from React children
function extractTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (typeof children === 'number') {
    return String(children);
  }
  
  if (Array.isArray(children)) {
    return children.map(extractTextContent).join('');
  }
  
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as any;
    if (element.props && element.props.children) {
      return extractTextContent(element.props.children);
    }
  }
  
  return String(children || '');
}

function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const code = extractTextContent(children).replace(/\n$/, '');
  const lang = language || className?.replace('language-', '') || 'text';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Code copied',
        description: 'Code has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy code to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippet.${getFileExtension(lang)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      sql: 'sql',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      yaml: 'yml',
      xml: 'xml',
      bash: 'sh',
      shell: 'sh',
      powershell: 'ps1',
      dockerfile: 'dockerfile',
      markdown: 'md',
    };
    return extensions[language.toLowerCase()] || 'txt';
  };

  const getLanguageIcon = (language: string) => {
    if (['bash', 'shell', 'powershell', 'cmd'].includes(language.toLowerCase())) {
      return <Terminal className="h-3 w-3" />;
    }
    return <Code2 className="h-3 w-3" />;
  };

  return (
    <div className="relative group my-4">
      {/* Code block header */}
      <div className="flex items-center justify-between bg-muted/30 border border-border rounded-t-lg px-4 py-2">
        <div className="flex items-center gap-2">
          {getLanguageIcon(lang)}
          <Badge variant="secondary" className="text-xs font-mono">
            {lang}
          </Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2 text-xs"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Code content */}
      <pre className="bg-muted/50 border border-t-0 border-border rounded-b-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  
  const code = extractTextContent(children);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      // Silently fail for inline code
    }
  };

  return (
    <code 
      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono cursor-pointer hover:bg-muted/80 transition-colors relative group"
      onClick={handleCopy}
      title="Click to copy"
    >
      {children}
      {copied && (
        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
          Copied!
        </span>
      )}
    </code>
  );
}

export const EnhancedMarkdown = memo(function EnhancedMarkdown({ content, className }: EnhancedMarkdownProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Enhanced code blocks with copy functionality
          pre: ({ children, ...props }) => {
            // Extract the code element from children
            const codeElement = Array.isArray(children) ? children[0] : children;
            const className = (codeElement as any)?.props?.className || '';
            const language = className.replace('language-', '');
            
            return (
              <CodeBlock 
                className={className}
                language={language}
              >
                {(codeElement as any)?.props?.children || children}
              </CodeBlock>
            );
          },
          
          // Enhanced inline code with click-to-copy
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return <InlineCode>{children}</InlineCode>;
            }
            // For code blocks, just return the code element as-is
            // The pre component will handle the enhanced rendering
            return (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
          
          // Enhanced tables with better styling
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                {...props}
                className="w-full border-collapse border border-border rounded-lg shadow-sm"
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th
              {...props}
              className="border border-border bg-muted/50 px-4 py-3 text-left font-semibold text-sm"
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="border border-border px-4 py-3 text-sm">
              {children}
            </td>
          ),
          
          // Enhanced blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary/30 pl-4 py-2 my-4 italic text-muted-foreground bg-muted/20 rounded-r-lg"
            >
              {children}
            </blockquote>
          ),
          
          // Enhanced lists
          ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc list-inside space-y-2 my-3 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal list-inside space-y-2 my-3 pl-2">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="text-sm leading-6">
              {children}
            </li>
          ),
          
          // Enhanced headings with better spacing
          h1: ({ children, ...props }) => (
            <h1 {...props} className="text-xl font-bold mb-4 mt-6 first:mt-0 pb-2 border-b border-border">
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} className="text-lg font-semibold mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-base font-medium mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 {...props} className="text-sm font-medium mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),
          
          // Enhanced paragraphs
          p: ({ children, ...props }) => (
            <p {...props} className="text-[15px] leading-6 mb-4 last:mb-0">
              {children}
            </p>
          ),
          
          // Enhanced links
          a: ({ children, href, ...props }) => (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          
          // Enhanced horizontal rules
          hr: ({ ...props }) => (
            <hr {...props} className="my-6 border-border" />
          ),
          
          // Enhanced images
          img: ({ src, alt, ...props }) => (
            <img
              {...props}
              src={src}
              alt={alt}
              className="rounded-lg border border-border shadow-sm max-w-full h-auto my-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});