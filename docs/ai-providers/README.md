# 🤖 AI Providers Setup

GlowCTF supports multiple AI providers to power the intelligent chatbot assistant. This directory contains detailed setup guides for each supported provider.

## 🎯 Supported AI Providers

| Provider | Best For | Free Tier | Setup Difficulty | Recommended |
|----------|----------|-----------|------------------|-------------|
| **[Google Gemini](gemini.md)** | General CTF assistance | ✅ Generous | Easy | ⭐ **Primary** |
| **[Groq](groq.md)** | Fast inference | ✅ Good | Easy | ⭐ **Secondary** |
| **[xAI (Grok)](xai.md)** | Advanced reasoning | ❌ Paid only | Medium | **Optional** |

## 🚀 Quick Start

### **Recommended Setup**

For the best experience, we recommend setting up multiple providers:

1. **Primary**: [Google Gemini](gemini.md) - Best overall performance and free tier
2. **Fallback**: [Groq](groq.md) - Fast responses when Gemini is unavailable
3. **Premium**: [xAI (Grok)](xai.md) - Advanced capabilities for premium users

### **Minimum Setup**

At minimum, configure one AI provider:

```env
# Choose one of these
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
XAI_API_KEY=your_xai_api_key
```

## 🔧 Configuration

### **Environment Variables**

Add these to your deployment platform:

```env
# AI Provider Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
XAI_API_KEY=your_xai_api_key_here

# AI Settings (optional)
DEFAULT_AI_PROVIDER=gemini
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
AI_TIMEOUT=30000
```

### **Provider Priority**

Configure provider fallback order:

```typescript
// server/services/ai-manager.ts
export class AIManager {
  private providers = [
    { name: 'gemini', enabled: !!process.env.GEMINI_API_KEY },
    { name: 'groq', enabled: !!process.env.GROQ_API_KEY },
    { name: 'xai', enabled: !!process.env.XAI_API_KEY },
  ];

  async generateResponse(prompt: string, context?: string): Promise<string> {
    for (const provider of this.providers) {
      if (!provider.enabled) continue;
      
      try {
        return await this.callProvider(provider.name, prompt, context);
      } catch (error) {
        console.warn(`Provider ${provider.name} failed, trying next...`);
        continue;
      }
    }
    
    throw new Error('All AI providers are unavailable');
  }
}
```

## 📊 Provider Comparison

### **Performance Metrics**

| Provider | Response Time | Quality | Context Length | Rate Limits |
|----------|---------------|---------|----------------|-------------|
| **Gemini** | ~2-3s | Excellent | 30K tokens | 15/min free |
| **Groq** | ~0.5-1s | Very Good | 8K tokens | 30/min free |
| **xAI** | ~2-4s | Excellent | 128K tokens | Paid only |

### **Use Case Recommendations**

#### **Google Gemini** 🧠
- **Best for**: General CTF assistance, educational content
- **Strengths**: Excellent reasoning, safety features, free tier
- **Use when**: Primary chatbot interactions, hint generation

#### **Groq** 🚀
- **Best for**: Quick responses, real-time chat
- **Strengths**: Ultra-fast inference, good quality
- **Use when**: Speed is critical, high-volume requests

#### **xAI (Grok)** 🤖
- **Best for**: Complex problem solving, advanced analysis
- **Strengths**: Superior reasoning, large context window
- **Use when**: Premium features, complex challenges

## 🔄 Multi-Provider Setup

### **Load Balancing**

Distribute requests across providers:

```typescript
// server/services/load-balancer.ts
export class AILoadBalancer {
  private providerWeights = {
    gemini: 0.6,  // 60% of requests
    groq: 0.3,    // 30% of requests
    xai: 0.1      // 10% of requests (premium)
  };

  selectProvider(): string {
    const random = Math.random();
    let cumulative = 0;

    for (const [provider, weight] of Object.entries(this.providerWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return provider;
      }
    }

    return 'gemini'; // fallback
  }
}
```

### **Failover Strategy**

Implement automatic failover:

```typescript
// server/services/ai-failover.ts
export class AIFailover {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  async generateWithFailover(prompt: string): Promise<string> {
    const providers = ['gemini', 'groq', 'xai'];
    
    for (const provider of providers) {
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          return await this.callProvider(provider, prompt);
        } catch (error) {
          if (attempt === this.maxRetries) {
            console.error(`Provider ${provider} failed after ${this.maxRetries} attempts`);
            continue; // Try next provider
          }
          
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    throw new Error('All providers failed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 🛡️ Security Best Practices

### **API Key Management**

1. **Never commit API keys** to version control
2. **Use environment variables** for all keys
3. **Rotate keys regularly** (monthly recommended)
4. **Monitor usage** for unusual activity
5. **Set up alerts** for quota limits

### **Request Validation**

```typescript
// server/middleware/ai-security.ts
export const validateAIRequest = (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;

  // Input validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  // Length limits
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  // Content filtering
  if (containsInappropriateContent(message)) {
    return res.status(400).json({ error: 'Inappropriate content detected' });
  }

  next();
};
```

### **Rate Limiting**

```typescript
// server/middleware/ai-rate-limit.ts
import rateLimit from 'express-rate-limit';

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Too many AI requests, please slow down.',
});
```

## 📈 Monitoring and Analytics

### **Usage Tracking**

Track AI provider usage:

```typescript
// server/services/ai-analytics.ts
export class AIAnalytics {
  async logRequest(provider: string, prompt: string, response: string, duration: number) {
    const analytics = {
      provider,
      promptLength: prompt.length,
      responseLength: response.length,
      duration,
      timestamp: new Date(),
      userId: getCurrentUserId(),
    };

    // Store in database or analytics service
    await this.storeAnalytics(analytics);
  }

  async getUsageStats() {
    return {
      totalRequests: await this.getTotalRequests(),
      requestsByProvider: await this.getRequestsByProvider(),
      averageResponseTime: await this.getAverageResponseTime(),
      errorRate: await this.getErrorRate(),
    };
  }
}
```

### **Health Monitoring**

Monitor provider health:

```typescript
// server/services/ai-health.ts
export class AIHealthMonitor {
  async checkProviderHealth() {
    const providers = ['gemini', 'groq', 'xai'];
    const health = {};

    for (const provider of providers) {
      try {
        const start = Date.now();
        await this.testProvider(provider);
        const duration = Date.now() - start;
        
        health[provider] = {
          status: 'healthy',
          responseTime: duration,
          lastChecked: new Date(),
        };
      } catch (error) {
        health[provider] = {
          status: 'unhealthy',
          error: error.message,
          lastChecked: new Date(),
        };
      }
    }

    return health;
  }
}
```

## 💰 Cost Optimization

### **Usage Optimization**

1. **Cache common responses** to reduce API calls
2. **Implement request deduplication**
3. **Use shorter prompts** when possible
4. **Set appropriate timeouts**
5. **Monitor and alert** on usage spikes

### **Cost Tracking**

```typescript
// server/services/cost-tracker.ts
export class CostTracker {
  private costs = {
    gemini: { input: 0, output: 0 }, // Free tier
    groq: { input: 0, output: 0 },   // Free tier
    xai: { input: 0.0015, output: 0.002 }, // Per 1K tokens
  };

  calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
    const rates = this.costs[provider];
    return (inputTokens * rates.input + outputTokens * rates.output) / 1000;
  }

  async getDailyCost(): Promise<number> {
    // Calculate total cost for the day
    const usage = await this.getDailyUsage();
    return usage.reduce((total, request) => {
      return total + this.calculateCost(
        request.provider,
        request.inputTokens,
        request.outputTokens
      );
    }, 0);
  }
}
```

## 🚨 Troubleshooting

### **Common Issues**

1. **API Key Invalid**
   - Verify key format and permissions
   - Check if key is properly set in environment

2. **Rate Limit Exceeded**
   - Implement proper rate limiting
   - Consider upgrading to paid tier

3. **Provider Unavailable**
   - Implement failover to backup providers
   - Monitor provider status pages

4. **Poor Response Quality**
   - Adjust temperature and parameters
   - Improve prompt engineering

### **Debug Mode**

Enable debug logging:

```typescript
// Enable debug mode
process.env.AI_DEBUG = 'true';

// Debug logging
if (process.env.AI_DEBUG === 'true') {
  console.log('AI Request:', { provider, prompt, parameters });
  console.log('AI Response:', { response, duration, tokens });
}
```

## 🔗 Quick Links

- [Google Gemini Setup](gemini.md)
- [Groq Setup](groq.md)
- [xAI (Grok) Setup](xai.md)
- [Configuration Guide](../configuration/)
- [Deployment Guides](../deployment/)

## ✅ Setup Checklist

- [ ] Choose primary AI provider
- [ ] Set up API keys securely
- [ ] Configure environment variables
- [ ] Test API connections
- [ ] Implement failover strategy
- [ ] Set up rate limiting
- [ ] Configure monitoring
- [ ] Test chatbot functionality
- [ ] Optimize for cost and performance
- [ ] Set up alerts and notifications

---

**Your AI providers are ready to power GlowCTF! 🤖**

Choose your provider and follow the detailed setup guide to get started.