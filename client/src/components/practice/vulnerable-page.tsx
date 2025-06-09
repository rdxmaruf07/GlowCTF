import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ChevronRight, HelpCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { getDifficultyColor } from "@/lib/utils";

interface Vulnerability {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  category: string;
  icon: string;
}

interface VulnerablePageProps {
  vulnerability: Vulnerability;
  onBack: () => void;
}

// Content specific to each vulnerability type
const vulnerabilityContent: Record<string, {
  task: string;
  hint: string;
  solution: string;
  vulnerable_app: React.ReactNode;
}> = {
  "sql-injection": {
    task: "The login form below is vulnerable to SQL injection. Your goal is to bypass the authentication without knowing the correct credentials.",
    hint: "Try using SQL comments with '--' or quotation marks to manipulate the query. What happens if you enter `admin'--` as the username?",
    solution: "Username: admin'-- \nPassword: (anything or empty)\n\nThis works because the SQL query looks like: SELECT * FROM users WHERE username='admin'--' AND password='anything' \nThe -- makes the rest of the query a comment, so it only checks if username='admin'",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>Please login to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sqli-username">Username</Label>
              <Input id="sqli-username" placeholder="Username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqli-password">Password</Label>
              <Input id="sqli-password" type="password" placeholder="Password" />
            </div>
            <div className="code-comment">
              {/* Vulnerable code (visible for learning) */}
              <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                <code>{`
// Vulnerable code (DO NOT USE IN PRODUCTION!)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // SQL INJECTION VULNERABILITY HERE! 
  const query = \`SELECT * FROM users 
                  WHERE username='\${username}' 
                  AND password='\${password}'\`;
                  
  db.query(query, (err, results) => {
    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});
                `}</code>
              </pre>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              const usernameInput = document.getElementById('sqli-username') as HTMLInputElement;
              const username = usernameInput?.value || '';
              
              if (username.toLowerCase().includes("'--") || 
                  username.toLowerCase().includes("' or '1'='1") ||
                  username.toLowerCase().includes("\" or \"1\"=\"1")) {
                alert("SQL Injection successful! You've bypassed authentication!");
              } else {
                alert("Login failed. Invalid credentials.");
              }
            }}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    )
  },
  "xss": {
    task: "The comment section below is vulnerable to Cross-Site Scripting (XSS). Your goal is to inject a script that executes an alert.",
    hint: "Try adding HTML tags or script tags in your comment. What happens if you enter <script>alert('XSS')</script> as your comment?",
    solution: "Comment: <script>alert('XSS')</script>\n\nThis works because the application directly inserts the user input into the DOM without sanitizing it, allowing JavaScript execution.",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Comment Section</CardTitle>
          <CardDescription>Share your thoughts below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <div className="bg-card p-3 rounded-md">
              <div className="font-medium">John</div>
              <div className="text-sm text-muted-foreground">Great article! Thanks for sharing.</div>
            </div>
            <div className="bg-card p-3 rounded-md">
              <div className="font-medium">Alice</div>
              <div className="text-sm text-muted-foreground">I learned a lot from this!</div>
            </div>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xss-name">Your Name</Label>
              <Input id="xss-name" placeholder="Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xss-comment">Your Comment</Label>
              <Textarea id="xss-comment" placeholder="Enter your comment here..." />
            </div>
            <div className="code-comment">
              <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                <code>{`
// Vulnerable code (DO NOT USE IN PRODUCTION!)
function addComment() {
  const name = document.getElementById('name').value;
  const comment = document.getElementById('comment').value;
  
  // XSS VULNERABILITY HERE!
  document.getElementById('comments').innerHTML += \`
    <div class="comment">
      <div class="name">\${name}</div>
      <div class="text">\${comment}</div>
    </div>
  \`;
}
                `}</code>
              </pre>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              const commentInput = document.getElementById('xss-comment') as HTMLTextAreaElement;
              const nameInput = document.getElementById('xss-name') as HTMLInputElement;
              const comment = commentInput?.value || '';
              const name = nameInput?.value || 'Anonymous';
              
              try {
                // This is intentionally vulnerable for demonstration
                // Simulating what happens when comment is injected unsafely
                if (comment.toLowerCase().includes('<script>')) {
                  alert("XSS detected! In a real vulnerable app, your script would execute!");
                } else if (comment.toLowerCase().includes('onerror') || 
                           comment.toLowerCase().includes('onclick') ||
                           comment.toLowerCase().includes('javascript:')) {
                  alert("Event handler XSS detected! In a real vulnerable app, your script would execute!");
                } else {
                  alert("Comment posted successfully!");
                }
              } catch (err) {
                console.error("Error in XSS demo:", err);
              }
            }}
          >
            Post Comment
          </Button>
        </CardFooter>
      </Card>
    )
  },
  "file-upload": {
    task: "The file upload system below is vulnerable to file type bypass. Your goal is to upload a file that could potentially execute code on the server.",
    hint: "Try uploading a file with a double extension or modifying the Content-Type header. What happens if you upload 'harmless.jpg.php'?",
    solution: "Upload a file named 'exploit.jpg.php' or rename a .php file to .jpg and then modify the request to change it back to .php\n\nThis works because the application only checks the extension string without properly validating the actual file type and content.",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Profile Picture Upload</CardTitle>
          <CardDescription>Upload a profile picture (JPG or PNG only)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select Image</Label>
              <Input id="file-upload" type="file" accept=".jpg,.jpeg,.png" />
              <p className="text-xs text-muted-foreground">Maximum file size: 2MB</p>
            </div>
            <div className="code-comment">
              <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                <code>{`
// Vulnerable code (DO NOT USE IN PRODUCTION!)
app.post('/upload', (req, res) => {
  const file = req.files.upload;
  const filename = file.name;
  
  // FILE UPLOAD VULNERABILITY HERE!
  // Only checks if the filename ENDS with .jpg, .jpeg, or .png
  // Does not validate actual file type!
  if(filename.endsWith('.jpg') || 
     filename.endsWith('.jpeg') || 
     filename.endsWith('.png')) {
       
    const uploadPath = __dirname + '/uploads/' + filename;
    file.mv(uploadPath);
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid file type' });
  }
});
                `}</code>
              </pre>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              const fileInput = document.getElementById('file-upload') as HTMLInputElement;
              const file = fileInput?.files?.[0];
              
              if (!file) {
                alert("Please select a file first.");
                return;
              }
              
              const fileName = file.name.toLowerCase();
              
              if (fileName.includes(".php") || 
                  fileName.includes(".jsp") || 
                  fileName.includes(".asp") || 
                  fileName.includes(".exe") ||
                  fileName.match(/\.(jpg|jpeg|png)\.(php|asp|aspx|jsp|exe)$/i)) {
                alert("Potential file upload vulnerability exploited! In a real vulnerable app, your malicious file would be uploaded!");
              } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
                alert("File uploaded successfully!");
              } else {
                alert("Invalid file type. Only JPG and PNG allowed.");
              }
            }}
          >
            Upload File
          </Button>
        </CardFooter>
      </Card>
    )
  },
  "command-injection": {
    task: "The ping tool below is vulnerable to command injection. Your goal is to execute additional commands on the server.",
    hint: "Try adding command separators like ; or && after a valid IP. What happens if you enter '127.0.0.1; ls' or '127.0.0.1 && cat /etc/passwd'?",
    solution: "Input: 127.0.0.1; ls\nOr: 127.0.0.1 && cat /etc/passwd\n\nThis works because the application directly passes user input to a command execution function without proper sanitization.",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Network Ping Tool</CardTitle>
          <CardDescription>Enter an IP address to ping</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cmd-ip">IP Address</Label>
              <Input id="cmd-ip" placeholder="e.g. 127.0.0.1" />
            </div>
            <div className="code-comment">
              <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                <code>{`
// Vulnerable code (DO NOT USE IN PRODUCTION!)
app.post('/ping', (req, res) => {
  const ip = req.body.ip;
  
  // COMMAND INJECTION VULNERABILITY HERE!
  // User input is directly passed to exec without sanitization
  exec('ping -c 4 ' + ip, (error, stdout, stderr) => {
    res.send(stdout);
  });
});
                `}</code>
              </pre>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button 
            onClick={() => {
              const ipInput = document.getElementById('cmd-ip') as HTMLInputElement;
              const ip = ipInput?.value || '';
              
              if (!ip) {
                alert("Please enter an IP address.");
                return;
              }
              
              if (ip.includes(";") || 
                  ip.includes("&&") || 
                  ip.includes("||") ||
                  ip.includes("|") ||
                  ip.includes("`")) {
                alert("Command injection detected! In a real vulnerable app, your additional commands would execute on the server!");
              } else {
                alert("Ping executed successfully on " + ip);
              }
            }}
            className="mb-3"
          >
            Execute Ping
          </Button>
          
          <div className="w-full bg-black rounded p-2 text-sm font-mono text-green-400 min-h-20">
            {/* Simulated ping output */}
            <p>ping results will appear here...</p>
          </div>
        </CardFooter>
      </Card>
    )
  },
  "open-redirect": {
    task: "The redirect link below is vulnerable to open redirect. Your goal is to make it redirect to an arbitrary external website.",
    hint: "Try modifying the 'url' parameter to point to a different domain. Can you make it redirect to 'https://evil.com'?",
    solution: "Click the link and modify the URL parameter in the address bar to:\n?url=https://evil.com\n\nThis works because the application doesn't validate that the redirect URL belongs to the same domain.",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Resource Center</CardTitle>
          <CardDescription>Click on a resource to view it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="bg-card p-3 rounded-md flex justify-between items-center">
              <div>
                <div className="font-medium">Cybersecurity Guide</div>
                <div className="text-sm text-muted-foreground">Learn about basic security concepts</div>
              </div>
              <a 
                href="#" 
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set('url', '/resources/guide');
                  alert("In a vulnerable app, you would be redirected to: " + url.searchParams.get('url') + "\n\nTry changing the 'url' parameter to 'https://evil.com'");
                }}
              >
                View <ChevronRight className="inline h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-card p-3 rounded-md flex justify-between items-center">
              <div>
                <div className="font-medium">Security Tools</div>
                <div className="text-sm text-muted-foreground">Recommended security tools</div>
              </div>
              <a 
                href="#" 
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set('url', '/resources/tools');
                  alert("In a vulnerable app, you would be redirected to: " + url.searchParams.get('url') + "\n\nTry changing the 'url' parameter to 'https://evil.com'");
                }}
              >
                View <ChevronRight className="inline h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="code-comment mt-4">
            <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
              <code>{`
// Vulnerable code (DO NOT USE IN PRODUCTION!)
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  
  // OPEN REDIRECT VULNERABILITY HERE!
  // No validation of the redirect URL
  // Allows redirecting to any external domain
  if(url) {
    res.redirect(url);
  } else {
    res.redirect('/');
  }
});
              `}</code>
            </pre>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <HelpCircle className="inline h-4 w-4 mr-1" />
            In this example, try modifying the URL parameter in your browser's address bar after clicking a link.
          </div>
        </CardFooter>
      </Card>
    )
  },
  "buffer-overflow": {
    task: "The C program below is vulnerable to buffer overflow. Your goal is to identify how to overflow the buffer and gain control of the program execution.",
    hint: "Look at the size of the buffer and how the input is handled. What happens if you input more characters than the buffer can hold?",
    solution: "Input a string longer than 64 characters to overflow the buffer.\n\nThis works because the program uses gets() which doesn't check the bounds of the input, allowing you to write beyond the allocated buffer and potentially overwrite the return address on the stack.",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Buffer Overflow Simulator</CardTitle>
          <CardDescription>Analyze the vulnerable C code and test inputs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="code-comment">
              <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                <code>{`
// Vulnerable C code (DO NOT USE IN PRODUCTION!)
#include <stdio.h>
#include <string.h>

void vulnerable_function() {
  char buffer[64]; // Only 64 bytes allocated
  
  // BUFFER OVERFLOW VULNERABILITY HERE!
  // gets() doesn't check bounds - can write beyond buffer
  gets(buffer);
  
  printf("You entered: %s\\n", buffer);
}

int main() {
  printf("Enter your name: ");
  vulnerable_function();
  return 0;
}
                `}</code>
              </pre>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buffer-input">Input String</Label>
              <Textarea 
                id="buffer-input" 
                placeholder="Enter a string to test..." 
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Try entering different length strings to see what happens</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button 
            onClick={() => {
              const inputElement = document.getElementById('buffer-input') as HTMLTextAreaElement;
              const input = inputElement?.value || '';
              
              if (!input) {
                alert("Please enter a string to test.");
                return;
              }
              
              if (input.length > 64) {
                alert("Buffer overflow detected! You've entered " + input.length + " characters, which exceeds the 64-byte buffer.\n\nIn a real vulnerable program, this could allow you to overwrite the return address and hijack program execution!");
              } else {
                alert("Input processed normally. Your input is within the buffer size limits.");
              }
            }}
            className="mb-3"
          >
            Execute Program
          </Button>
          
          <div className="w-full bg-black rounded p-2 text-sm font-mono text-green-400 min-h-20">
            <p>Program output will appear here...</p>
          </div>
        </CardFooter>
      </Card>
    )
  },
  "race-condition": {
    task: "The application below has a race condition vulnerability in its transaction processing. Your goal is to exploit the timing issue to double-spend credits.",
    hint: "Try making multiple quick transactions. What happens if you click 'Transfer Credits' multiple times very quickly?",
    solution: "Click the 'Transfer Credits' button multiple times in rapid succession.\n\nThis works because the application doesn't properly lock the account balance during the transaction process, allowing multiple transactions to read the same initial balance before any of them complete.",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Credit Transfer System</CardTitle>
          <CardDescription>Transfer credits between accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-card rounded-md">
              <div>
                <div className="text-sm text-muted-foreground">Your Account Balance:</div>
                <div className="font-medium text-xl">100 Credits</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Friend's Account:</div>
                <div className="font-medium">user123</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Transfer Amount</Label>
              <Input 
                id="transfer-amount" 
                type="number" 
                defaultValue="20"
                min="1"
                max="100"
              />
            </div>
            
            <div className="code-comment">
              <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                <code>{`
// Vulnerable code (DO NOT USE IN PRODUCTION!)
app.post('/transfer', async (req, res) => {
  const { amount, toAccount } = req.body;
  const userId = req.user.id;
  
  // RACE CONDITION VULNERABILITY HERE!
  // No transaction or locking mechanism
  
  // 1. Get current balance
  const account = await db.accounts.findOne({ userId });
  const currentBalance = account.balance;
  
  // 2. Check if enough balance
  if (currentBalance >= amount) {
    // Artificial delay that makes race condition more likely
    await sleep(1000);
    
    // 3. Update balance
    await db.accounts.update(
      { userId }, 
      { balance: currentBalance - amount }
    );
    
    // 4. Add to recipient's account
    await db.accounts.update(
      { userId: toAccount }, 
      { $inc: { balance: amount } }
    );
    
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Insufficient funds' });
  }
});
                `}</code>
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button 
            id="transfer-button"
            onClick={(e) => {
              const button = e.currentTarget;
              const amountInput = document.getElementById('transfer-amount') as HTMLInputElement;
              const amount = parseInt(amountInput?.value || '0');
              
              if (amount <= 0) {
                alert("Please enter a valid amount.");
                return;
              }
              
              // Disable button temporarily to simulate processing
              button.disabled = true;
              
              // Get the current timestamp to identify rapid clicks
              const now = new Date().getTime();
              const lastClick = parseInt(button.getAttribute('data-last-click') || '0');
              
              // If clicked within 1 second of last click, it's potentially a race condition exploit
              if (now - lastClick < 1000 && lastClick > 0) {
                setTimeout(() => {
                  alert("Race condition vulnerability exploited! In a real vulnerable app, you could transfer more credits than your balance allows!");
                  button.disabled = false;
                }, 500);
              } else {
                setTimeout(() => {
                  alert("Transfer completed successfully!");
                  button.disabled = false;
                }, 500);
              }
              
              // Store this click timestamp
              button.setAttribute('data-last-click', now.toString());
            }}
            className="mb-3"
          >
            Transfer Credits
          </Button>
          
          <div className="w-full bg-black rounded p-2 text-sm font-mono text-green-400 min-h-20">
            <p>Transaction log will appear here...</p>
          </div>
        </CardFooter>
      </Card>
    )
  },
  "cryptography": {
    task: "The encryption system below uses a weak implementation of a substitution cipher. Your goal is to decrypt the message without knowing the key.",
    hint: "Analyze the frequency of characters in the ciphertext. In English, 'E' is the most common letter. Can you use frequency analysis to break the cipher?",
    solution: "Use frequency analysis to identify the most common characters in the ciphertext and map them to common English letters (E, T, A, O, I, N).\n\nThis works because simple substitution ciphers preserve the frequency patterns of the original text, making them vulnerable to statistical analysis.",
    vulnerable_app: (
      <Card className="border border-red-900/50 bg-background/50">
        <CardHeader>
          <CardTitle className="text-xl">Substitution Cipher</CardTitle>
          <CardDescription>Analyze and break the encrypted message</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-card rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Encrypted Message:</div>
              <div className="font-mono text-sm break-all">
                Xqj dsm vjacp xqnw hjwwpbj. Xqj cjd nw: WJHZANXD_KNAWX
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="decryption-attempt">Your Decryption Attempt</Label>
              <Textarea 
                id="decryption-attempt" 
                placeholder="Enter your decrypted message..." 
                className="font-mono"
              />
            </div>
            
            <div className="code-comment">
              <pre className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                <code>{`
// Vulnerable encryption code (DO NOT USE IN PRODUCTION!)
function encrypt(plaintext, key) {
  // WEAK CRYPTOGRAPHY VULNERABILITY HERE!
  // Simple substitution cipher - easily broken with frequency analysis
  
  let ciphertext = '';
  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i];
    if (char.match(/[a-z]/i)) {
      const code = plaintext.charCodeAt(i);
      // Determine if character is uppercase or lowercase
      const isUpperCase = code >= 65 && code <= 90;
      // Apply substitution based on key
      const offset = isUpperCase ? 65 : 97;
      const keyIndex = (code - offset) % 26;
      const encryptedChar = key[keyIndex];
      ciphertext += isUpperCase ? 
                    encryptedChar.toUpperCase() : 
                    encryptedChar.toLowerCase();
    } else {
      // Non-alphabetic characters remain unchanged
      ciphertext += char;
    }
  }
  return ciphertext;
}
                `}</code>
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              const decryptionInput = document.getElementById('decryption-attempt') as HTMLTextAreaElement;
              const attempt = decryptionInput?.value?.toLowerCase() || '';
              const solution = "you can crack this message. the key is: security_first".toLowerCase();
              
              // Check if the attempt is close to the solution
              let correctChars = 0;
              const minLength = Math.min(attempt.length, solution.length);
              
              for (let i = 0; i < minLength; i++) {
                if (attempt[i] === solution[i]) {
                  correctChars++;
                }
              }
              
              const accuracy = minLength > 0 ? (correctChars / minLength) * 100 : 0;
              
              if (accuracy > 80) {
                alert("Great job! You've successfully decrypted the message!");
              } else if (accuracy > 50) {
                alert("You're on the right track! Keep analyzing the patterns.");
              } else {
                alert("Try again. Hint: Look for patterns in letter frequency.");
              }
            }}
          >
            Check Decryption
          </Button>
        </CardFooter>
      </Card>
    )
  }
};

// Note: Using Label from @/components/ui/label instead of this custom component

export default function VulnerablePage({ vulnerability, onBack }: VulnerablePageProps) {
  const [activeTab, setActiveTab] = useState<string>("environment");
  const [showSolution, setShowSolution] = useState<boolean>(false);
  
  const content = vulnerabilityContent[vulnerability.id] || {
    task: "No specific task available for this vulnerability.",
    hint: "No hint available.",
    solution: "No solution available.",
    vulnerable_app: <div>No practice environment available.</div>
  };
  
  const difficultyColor = getDifficultyColor(vulnerability.difficulty);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-orbitron text-xl font-medium text-white">
          {vulnerability.name}
        </h2>
        <Badge className={`${difficultyColor.bgColor} ${difficultyColor.textColor}`}>
          {vulnerability.difficulty.charAt(0).toUpperCase() + vulnerability.difficulty.slice(1)}
        </Badge>
        <Badge variant="outline">{vulnerability.category}</Badge>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>About this Vulnerability</CardTitle>
          <CardDescription>{vulnerability.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-primary/10 border-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
              <AlertDescription>
                <strong>Task:</strong> {content.task}
              </AlertDescription>
            </Alert>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="environment">Practice Environment</TabsTrigger>
                <TabsTrigger value="resources">Hints &amp; Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="environment" className="p-4 border rounded-md mt-2">
                {content.vulnerable_app}
              </TabsContent>
              
              <TabsContent value="resources" className="space-y-4 p-4 border rounded-md mt-2">
                <div>
                  <h3 className="font-medium text-lg mb-2">Hint</h3>
                  <div className="p-3 bg-card rounded-md">
                    <p>{content.hint}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Solution</h3>
                  {showSolution ? (
                    <div className="p-3 bg-card rounded-md">
                      <pre className="whitespace-pre-wrap font-mono text-sm">{content.solution}</pre>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSolution(true)}
                    >
                      Reveal Solution
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Additional Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="#" 
                        onClick={(e) => e.preventDefault()}
                        className="text-primary hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M18 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"></path><path d="m2 8 10 5 10-5"></path></svg>
                        OWASP Guide on {vulnerability.name}
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#" 
                        onClick={(e) => e.preventDefault()}
                        className="text-primary hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 5c-7.2 0-9 1.8-9 9s1.8 9 9 9 9-1.8 9-9-1.8-9-9-9z"></path><path d="M12 5v9l5 3"></path></svg>
                        History of {vulnerability.name} Attacks
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#" 
                        onClick={(e) => e.preventDefault()}
                        className="text-primary hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Prevention Techniques
                      </a>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
