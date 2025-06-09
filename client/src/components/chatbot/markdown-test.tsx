'use client';

import { EnhancedMarkdown } from './enhanced-markdown-simple';

const testMarkdown = `# Enhanced Markdown Test

This is a test of the enhanced markdown component with proper code rendering.

## Python Code Example

Here's a Python function to find the sum of two numbers:

\`\`\`python
def find_sum(a, b):
    """
    Calculate the sum of two numbers
    
    Args:
        a (int): First number
        b (int): Second number
    
    Returns:
        int: Sum of a and b
    """
    sum_result = a + b
    print(f"The sum of {a} and {b} is {sum_result}")
    return sum_result

# Example usage
numbers = [208541, 3]
result = find_sum(numbers[0], numbers[1])
print(f"Final result: {result}")
\`\`\`

## JavaScript Example

\`\`\`javascript
function findSum(a, b) {
    const sum = a + b;
    console.log(\`The sum of \${a} and \${b} is \${sum}\`);
    return sum;
}

// Usage
const result = findSum(208541, 3);
console.log(\`Result: \${result}\`);
\`\`\`

## Inline Code

You can also use inline code like \`console.log("Hello World")\` or \`print("Hello")\`.

## Features

- **Syntax Highlighting**: Full syntax highlighting for multiple languages
- **Copy Functionality**: Click the copy button to copy code blocks
- **Download**: Download code snippets with proper file extensions
- **Click-to-Copy**: Click inline code to copy instantly

Try hovering over the code blocks to see the copy and download buttons!`;

export function MarkdownTest() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Enhanced Markdown Test</h1>
        <EnhancedMarkdown content={testMarkdown} />
      </div>
    </div>
  );
}