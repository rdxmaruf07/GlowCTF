# GlowCTF Arena - AI Provider Integration

This document provides information about the AI provider integrations in the GlowCTF Arena platform.

## Supported AI Providers

The GlowCTF Arena platform now supports the following AI providers:

1. **OpenAI (GPT models)**
   - SDK: `openai` package
   - Default model: `gpt-4o`
   - Environment variable: `OPENAI_API_KEY`

2. **Anthropic (Claude models)**
   - SDK: `@anthropic-ai/sdk` package
   - Default model: `claude-3-opus-20240229`
   - Environment variable: `ANTHROPIC_API_KEY`

3. **Google Gemini**
   - SDK: `@google/generative-ai` package
   - Default model: `gemini-2.0-flash`
   - Environment variable: `GEMINI_API_KEY`

4. **Groq (Currently Unavailable)**
   - ~~SDK: `@groq/groq` package~~ (Package not available in npm registry)
   - Default model: `llama3-70b-8192`
   - Environment variable: `GROQ_API_KEY`

5. **Together AI**
   - Uses OpenAI SDK with custom base URL
   - Default model: `meta-llama/Llama-3-70b-chat-hf`
   - Environment variable: `TOGETHER_API_KEY`

6. **AIML API**
   - Uses OpenAI SDK with custom base URL
   - Default model: `gpt-4o`
   - Environment variable: `AIML_API_KEY`

7. **OpenRouter**
   - Uses OpenAI SDK with custom base URL
   - Default model: `openai/gpt-4o`
   - Environment variable: `OPENROUTER_API_KEY`

## Configuration

To use any of the AI providers, you need to:

1. **Obtain an API key** from the respective provider:
   - [OpenAI](https://platform.openai.com/)
   - [Anthropic](https://console.anthropic.com/)
   - [Google AI Studio](https://makersuite.google.com/)
   - [Groq](https://console.groq.com/)
   - [Together AI](https://www.together.ai/)
   - [AIML API](https://aimlapi.com/)
   - [OpenRouter](https://openrouter.ai/)

2. **Add the API key to the platform**:
   - Log in to the GlowCTF Arena platform
   - Navigate to the AI Chatbot page
   - Click on "Manage API Keys"
   - Select the provider
   - Enter your API key
   - Click "Save API Key"

Alternatively, you can set the API key as an environment variable:

```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
TOGETHER_API_KEY=your_together_api_key
AIML_API_KEY=your_aiml_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Usage

Once configured, you can use any of the AI assistants in the platform:

1. Navigate to the AI Chatbot page
2. Select the desired AI provider from the list of available assistants
3. Type your question or prompt in the chat input
4. The selected AI model will generate a response based on your input

## Implementation Details

The AI provider integrations are implemented in the `server/services/chatbot.ts` file. Each provider has:

1. A client initialization function in `initializeAIClients()`
2. A completion generation function (e.g., `generateOpenAICompletion()`)
3. An API key verification function in `verifyApiKey()`

The implementations follow the official SDK documentation for each provider:

### Groq Example (Currently Unavailable)

```javascript
// Note: This example is for reference only. The @groq/groq package is currently unavailable.
// import { Groq } from "@groq/groq";

// const client = new Groq({
//   apiKey: "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",
// });

// const chatCompletion = await client.chat.completions.create({
//   messages: [
//     {
//       role: "user",
//       content: "Explain the importance of fast language models",
//     }
//   ],
//   model: "llama3-70b-8192",
// });

// console.log(chatCompletion.choices[0].message.content);
```

### AIML API Example

```javascript
import openai from "openai";

// Base URL for AI/ML API
openai.api_base = "https://api.aimlapi.com/v1";
openai.api_key = "392a062d4ebb4d27b84c1732d33cea8e";

const completion = await openai.ChatCompletion.create({
  model: "gpt-4o",
  messages: [
    {"role": "system", "content": "You are a travel agent. Be descriptive and helpful."},
    {"role": "user", "content": "Tell me about San Francisco"},
  ],
  temperature: 0.7,
  max_tokens: 500,
});

const response = completion['choices'][0]['message']['content'];
console.log("AI:", response);
```

### Together AI Example

```javascript
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: "dd3f75400b99f81e6f200063cab9fd356bca694cb0ec309ef6ee88b2d6f05c84",
  baseURL: "https://api.together.xyz/v1"
});

const response = await client.chat.completions.create({
  model: "meta-llama/Llama-3-70b-chat-hf",
  messages: [
    {"role": "user", "content": "What are some fun things to do in New York?"}
  ]
});

console.log(response.choices[0].message.content);
```

### OpenRouter Example

```javascript
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://your-site-url.com",
    "X-Title": "YourSiteName"
  }
});

const completion = await client.chat.completions.create({
  model: "openai/gpt-4o",
  messages: [
    {
      role: "user",
      content: "What is the meaning of life?"
    }
  ],
  max_tokens: 500
});

console.log(completion.choices[0].message.content);
```

## Troubleshooting

If you encounter issues with the AI provider integrations:

1. **Verify API Key**: Ensure that your API key is valid and active
2. **Check Quota**: Verify that you have sufficient quota for the API
3. **Model Availability**: Ensure that the model you're trying to use is available
4. **Server Logs**: Check the server logs for any error messages
5. **Network Issues**: Verify that the server can connect to the provider's API

For specific error messages and their solutions, refer to the respective provider's documentation.