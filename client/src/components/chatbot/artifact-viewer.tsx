import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Play,
  FileText,
  Square,
  RotateCcw,
  X
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useToast } from "@/hooks/use-toast";

interface ArtifactViewerProps {
  title: string;
  content: string;
  language: string;
  type?: 'code' | 'document' | 'data';
  canExecute?: boolean;
  onExecute?: (code: string) => Promise<string>;
}

export default function ArtifactViewer({
  title,
  content,
  language,
  type = 'code',
  canExecute = false,
  onExecute
}: ArtifactViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);
  const [typingOutput, setTypingOutput] = useState<string>('');
  const { toast } = useToast();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Typing animation effect
  const typeText = (text: string, speed: number = 100) => {
    setTypingOutput('');
    let index = 0;

    const typeChar = () => {
      if (index < text.length) {
        setTypingOutput(prev => prev + text[index]);
        index++;
        typingTimeoutRef.current = setTimeout(typeChar, speed);
      }
    };

    typeChar();
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    });
  };

  const handleExecute = async () => {
    console.log('Execute clicked:', { canExecute, onExecute: !!onExecute, language });

    setIsExecuting(true);
    setShowOutput(true);
    setTypingOutput('');

    try {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let output: string;
      if (onExecute) {
        output = await onExecute(content);
      } else {
        // Default simulation for common languages
        output = simulateExecution(language, content);
      }

      setExecutionOutput(output);
      typeText(output, 20); // Type at 20ms per character

      toast({
        title: "Code executed",
        description: "Code has been executed successfully.",
      });
    } catch (error) {
      const errorOutput = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      setExecutionOutput(errorOutput);
      typeText(errorOutput, 20);

      toast({
        title: "Execution failed",
        description: "An error occurred while executing the code.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateExecution = (lang: string, code: string): string => {
    switch (lang.toLowerCase()) {
      case 'python':
        if (code.includes('find_max')) {
          return `$ python find_max.py
The list of numbers: [42, 17, 89, 3, 56, 91, 23, 67, 8, 45]
The maximum number is: 91

Process finished with exit code 0`;
        }
        if (code.includes('print')) {
          return `$ python script.py
Hello, World!

Process finished with exit code 0`;
        }
        return `$ python script.py
Code executed successfully.

Process finished with exit code 0`;

      case 'javascript':
        if (code.includes('console.log')) {
          return `$ node script.js
Hello, World!
undefined

Process finished with exit code 0`;
        }
        return `$ node script.js
Code executed successfully.
undefined

Process finished with exit code 0`;

      case 'java':
        return `$ javac Main.java
$ java Main
Hello, World!

Process finished with exit code 0`;

      case 'cpp':
      case 'c++':
        return `$ g++ -o program main.cpp
$ ./program
Hello, World!

Process finished with exit code 0`;

      case 'c':
        return `$ gcc -o program main.c
$ ./program
Hello, World!

Process finished with exit code 0`;

      default:
        return `$ Running ${lang} code...
Code executed successfully.

Process finished with exit code 0`;
    }
  };

  const handleDownload = () => {
    const extension = getFileExtension(language);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `${title} has been downloaded.`,
    });
  };

  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      sql: 'sql',
      bash: 'sh',
      shell: 'sh',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      markdown: 'md'
    };
    return extensions[lang.toLowerCase()] || 'txt';
  };

  const getLanguageIcon = () => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'data':
        return <FileText className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      className="border border-border rounded-lg overflow-hidden bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-2">
          {getLanguageIcon()}
          <span className="font-medium text-sm">{title}</span>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            {language}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {canExecute && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-500 hover:text-green-400"
              onClick={handleExecute}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <Square className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`relative ${isExpanded ? 'max-h-none' : 'max-h-96'} overflow-auto`}>
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'hsl(var(--card))',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            color: 'hsl(var(--muted-foreground))',
            fontSize: '0.75rem',
            paddingRight: '1rem',
            minWidth: '2.5rem'
          }}
        >
          {content}
        </SyntaxHighlighter>
        
        {!isExpanded && content.split('\n').length > 15 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent flex items-end justify-center pb-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-xs"
            >
              Show more
            </Button>
          </div>
        )}
      </div>

      {/* Execution Output */}
      <AnimatePresence>
        {showOutput && (
          <motion.div
            className="border-t border-border bg-muted/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Output</span>
                {isExecuting && (
                  <span className="text-xs text-muted-foreground">Running...</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowOutput(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="relative p-4 font-mono text-sm execution-terminal min-h-[100px] max-h-[300px] overflow-auto">
              {isExecuting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Executing code...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap relative z-10">
                  {typingOutput}
                  {typingOutput.length < executionOutput.length && (
                    <span className="typing-cursor">|</span>
                  )}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
