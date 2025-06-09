# 🧠 Google Gemini Setup

Google Gemini is our recommended AI provider for GlowCTF, offering excellent performance, generous free tier, and advanced reasoning capabilities perfect for CTF assistance.

## 🎯 Why Google Gemini?

- ✅ **Generous free tier** (15 requests/minute, 1500 requests/day)
- ✅ **Advanced reasoning** capabilities
- ✅ **Multimodal support** (text, images, code)
- ✅ **Fast response times**
- ✅ **Excellent code understanding**
- ✅ **Built-in safety features**
- ✅ **Easy integration**

## 📋 Prerequisites

- Google account
- GlowCTF project ready for AI integration

## 🚀 Step-by-Step Setup

### **Step 1: Access Google AI Studio**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Accept the terms of service

### **Step 2: Create API Key**

1. Click **"Create API Key"**
2. Choose **"Create API key in new project"** (recommended)
3. Your API key will be generated
4. **Copy and save** the API key securely

⚠�� **Important**: Keep your API key secure and never commit it to version control!

### **Step 3: Configure Environment Variables**

Add your Gemini API key to your deployment platform:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Model configuration
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=1000
```

### **Step 4: Test API Connection**

Create a test script to verify your setup:

```typescript
// scripts/test-gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = "Hello! Can you help me with CTF challenges?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('✅ Gemini API test successful!');
    console.log('Response:', response.text());
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
  }
}

testGemini();
```

Run the test:

```bash
npx tsx scripts/test-gemini.ts
```

## 🔧 Integration with GlowCTF

### **Chatbot Service Configuration**

Update your chatbot service to use Gemini:

```typescript
// server/services/chatbot.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiChatbot {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = this.buildPrompt(prompt, context);
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response');
    }
  }

  private buildPrompt(userPrompt: string, context?: string): string {
    const systemPrompt = `
You are a helpful AI assistant for a Capture The Flag (CTF) platform called GlowCTF. 
Your role is to provide hints, guidance, and educational support to users solving cybersecurity challenges.

Guidelines:
- Provide helpful hints without giving away complete solutions
- Encourage learning and understanding of cybersecurity concepts
- Be supportive and educational
- If asked for flags directly, guide users to find them themselves
- Focus on teaching methodology and approach
- Keep responses concise but informative

${context ? `Context: ${context}` : ''}

User Question: ${userPrompt}

Response:`;

    return systemPrompt;
  }
}
```

### **API Route Implementation**

Create an API route for chatbot interactions:

```typescript
// server/routes/chatbot.ts
import { Router } from 'express';
import { GeminiChatbot } from '../services/chatbot';

const router = Router();
const chatbot = new GeminiChatbot();

router.post('/completion', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatbot.generateResponse(message, context);

    res.json({
      response,
      timestamp: new Date().toISOString(),
      provider: 'gemini'
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;
```

### **Frontend Integration**

Update your React components to use the Gemini-powered chatbot:

```typescript
// components/chatbot/enhanced-chat.tsx
import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function EnhancedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: getRelevantContext() // Add challenge context if available
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevantContext = () => {
    // Add logic to get current challenge context
    // This could include challenge description, category, difficulty, etc.
    return '';
  };

  // Rest of component implementation...
}
```

## 🎛️ Advanced Configuration

### **Model Selection**

Choose the appropriate Gemini model for your needs:

```typescript
// Different models for different use cases
const models = {
  // For general chat and hints
  chat: 'gemini-pro',
  
  // For image analysis (if needed for challenges)
  vision: 'gemini-pro-vision',
  
  // For code analysis and generation
  code: 'gemini-pro'
};

// Configure model based on request type
const getModel = (type: 'chat' | 'vision' | 'code') => {
  return genAI.getGenerativeModel({ model: models[type] });
};
```

### **Context-Aware Responses**

Enhance responses with challenge context:

```typescript
// Enhanced prompt building with challenge context
private buildContextualPrompt(
  userPrompt: string, 
  challengeContext?: {
    title: string;
    category: string;
    difficulty: string;
    description: string;
  }
): string {
  let contextInfo = '';
  
  if (challengeContext) {
    contextInfo = `
Current Challenge Context:
- Title: ${challengeContext.title}
- Category: ${challengeContext.category}
- Difficulty: ${challengeContext.difficulty}
- Description: ${challengeContext.description}
`;
  }

  return `
You are a helpful AI assistant for GlowCTF, a Capture The Flag platform.
${contextInfo}

Guidelines for CTF assistance:
- Provide educational hints that guide learning
- Never give direct answers or flags
- Encourage proper methodology and thinking
- Explain concepts when helpful
- Be supportive and encouraging

User Question: ${userPrompt}

Helpful Response:`;
}
```

### **Rate Limiting and Error Handling**

Implement proper rate limiting and error handling:

```typescript
// Rate limiting for Gemini API
import rateLimit from 'express-rate-limit';

const geminiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute (within free tier)
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to chatbot routes
router.use('/completion', geminiRateLimit);

// Enhanced error handling
export class GeminiChatbot {
  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // Check for safety blocks
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
      }
      
      return response.text();
    } catch (error) {
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message.includes('safety')) {
        throw new Error('Content filtered for safety. Please rephrase your question.');
      } else {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate response. Please try again.');
      }
    }
  }
}
```

## 📊 Usage Monitoring

### **Track API Usage**

Monitor your Gemini API usage:

```typescript
// Usage tracking middleware
export const trackGeminiUsage = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const usage = {
      timestamp: new Date().toISOString(),
      endpoint: req.path,
      duration,
      status: res.statusCode,
      userId: req.user?.id,
    };
    
    // Log usage for monitoring
    console.log('Gemini API Usage:', usage);
    
    // Store in database for analytics (optional)
    // await logApiUsage(usage);
  });
  
  next();
};
```

### **Usage Analytics**

Create a dashboard to monitor API usage:

```typescript
// Analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    const analytics = {
      totalRequests: await getTotalRequests(),
      requestsToday: await getRequestsToday(),
      averageResponseTime: await getAverageResponseTime(),
      errorRate: await getErrorRate(),
      quotaUsage: await getQuotaUsage(),
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
```

## 💰 Pricing and Limits

### **Free Tier Limits**
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**
- **Rate limits apply**

### **Paid Tier**
- **Higher rate limits**
- **Pay-per-use pricing**
- **Priority support**
- **Advanced features**

### **Optimization Tips**

1. **Cache responses** for common questions
2. **Implement rate limiting** to stay within quotas
3. **Use shorter prompts** when possible
4. **Batch requests** if applicable
5. **Monitor usage** regularly

## 🚨 Troubleshooting

### **Common Issues**

1. **API Key Invalid**
   ```bash
   # Verify API key format
   echo $GEMINI_API_KEY
   # Should start with "AI..." and be about 40 characters
   ```

2. **Quota Exceeded**
   ```typescript
   // Implement graceful degradation
   if (error.message.includes('quota')) {
     return 'I apologize, but I\'m currently at capacity. Please try again in a few minutes.';
   }
   ```

3. **Content Blocked**
   ```typescript
   // Handle safety filters
   if (response.promptFeedback?.blockReason) {
     return 'I cannot provide assistance with that type of content. Please rephrase your question.';
   }
   ```

4. **Network Timeouts**
   ```typescript
   // Add timeout handling
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000);
   
   try {
     const result = await model.generateContent(prompt, {
       signal: controller.signal
     });
     clearTimeout(timeoutId);
     return result.response.text();
   } catch (error) {
     if (error.name === 'AbortError') {
       throw new Error('Request timed out');
     }
     throw error;
   }
   ```

## 🔗 Useful Links

- [Google AI Studio](https://makersuite.google.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI JavaScript SDK](https://github.com/google/generative-ai-js)
- [Gemini API Pricing](https://ai.google.dev/pricing)

## ✅ Setup Checklist

- [ ] Google account created
- [ ] Google AI Studio accessed
- [ ] API key generated and secured
- [ ] Environment variables configured
- [ ] API connection tested
- [ ] Chatbot service implemented
- [ ] Frontend integration completed
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Usage monitoring set up
- [ ] Safety settings configured
- [ ] Testing completed

---

**Your Google Gemini AI is ready for GlowCTF! 🧠**

Next steps:
- [Deploy your application](../deployment/)
- [Set up additional AI providers](./groq.md)
- [Configure monitoring](../configuration/monitoring.md)