'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown = memo(function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Custom styling for code blocks
          pre: ({ children, ...props }) => (
            <pre
              {...props}
              className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-sm"
            >
              {children}
            </pre>
          ),
          // Custom styling for inline code
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            return (
              <code
                {...props}
                className={cn(
                  isInline
                    ? "bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                    : className
                )}
              >
                {children}
              </code>
            );
          },
          // Custom styling for tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table
                {...props}
                className="w-full border-collapse border border-border rounded-lg"
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th
              {...props}
              className="border border-border bg-muted/50 px-3 py-2 text-left font-medium"
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="border border-border px-3 py-2">
              {children}
            </td>
          ),
          // Custom styling for blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
            >
              {children}
            </blockquote>
          ),
          // Custom styling for lists
          ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc list-inside space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal list-inside space-y-1">
              {children}
            </ol>
          ),
          // Custom styling for headings
          h1: ({ children, ...props }) => (
            <h1 {...props} className="text-xl font-bold mb-3 mt-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} className="text-lg font-semibold mb-2 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-base font-medium mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          // Custom styling for paragraphs
          p: ({ children, ...props }) => (
            <p {...props} className="text-[15px] leading-6 mb-3 last:mb-0">
              {children}
            </p>
          ),
          // Custom styling for links
          a: ({ children, href, ...props }) => (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});