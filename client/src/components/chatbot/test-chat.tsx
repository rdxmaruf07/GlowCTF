import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpIcon, Loader2 } from 'lucide-react';

export function TestChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    console.log('Submitting message:', input);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setInput('');
      setIsLoading(false);
      console.log('Message sent successfully');
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Chat Button Test</h2>
      <div className="relative">
        <Textarea
          placeholder="Type a message..."
          className="min-h-[60px] max-h-[200px] resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-16 text-sm focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        <Button
          size="icon"
          className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
          disabled={!input.trim() || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Current input: "{input}"</p>
        <p>Button disabled: {(!input.trim() || isLoading).toString()}</p>
        <p>Loading: {isLoading.toString()}</p>
      </div>
    </div>
  );
}