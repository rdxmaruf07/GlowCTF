import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
// Together.ai integration now uses OpenAI SDK with custom base URL instead of the "together" package
import { storage } from "../storage";
import axios from "axios";

// We will create dynamic instances of these clients based on the keys in the database
let openai: OpenAI;
let anthropic: Anthropic;
let geminiAI: GoogleGenerativeAI;
let geminiModel: GenerativeModel;
let together: OpenAI; // Now using OpenAI SDK for Together.ai integration
// For other providers, we'll use axios directly

// Function to initialize the AI clients with API keys from the database
export async function initializeAIClients() {
  try {
    // Get OpenAI key
    const openaiKey = await storage.getChatbotKeyByProvider("openai");
    if (openaiKey && openaiKey.isActive) {
      openai = new OpenAI({ apiKey: openaiKey.apiKey });
      console.log("OpenAI client initialized with key from database");
    } else if (process.env.OPENAI_API_KEY) {
      // Fallback to environment variable
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log("OpenAI client initialized with key from environment variable");
    } else {
      console.log("No OpenAI API key available. OpenAI features will be disabled.");
    }

    // Get Anthropic key
    const anthropicKey = await storage.getChatbotKeyByProvider("anthropic");
    if (anthropicKey && anthropicKey.isActive) {
      anthropic = new Anthropic({ apiKey: anthropicKey.apiKey });
      console.log("Anthropic client initialized with key from database");
    } else if (process.env.ANTHROPIC_API_KEY) {
      // Fallback to environment variable
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      console.log("Anthropic client initialized with key from environment variable");
    } else {
      console.log("No Anthropic API key available. Anthropic features will be disabled.");
    }

    // Get Gemini key
    const geminiKey = await storage.getChatbotKeyByProvider("gemini");
    if (geminiKey && geminiKey.isActive) {
      geminiAI = new GoogleGenerativeAI(geminiKey.apiKey);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("Gemini client initialized with key from database");
    } else if (process.env.GEMINI_API_KEY) {
      // Fallback to environment variable
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("Gemini client initialized with key from environment variable");
    } else {
      console.log("No Gemini API key available. Gemini features will be disabled.");
    }

    // Get Groq key
    const groqKey = await storage.getChatbotKeyByProvider("groq");
    if (groqKey && groqKey.isActive) {
      console.log("Groq API key found in database, but Groq SDK is not installed");
    } else if (process.env.GROQ_API_KEY) {
      // Fallback to environment variable
      console.log("Groq API key found in environment, but Groq SDK is not installed");
    } else {
      console.log("No Groq API key available. Groq features will be disabled.");
    }

    // Get Together.ai key
    const togetherKey = await storage.getChatbotKeyByProvider("together");
    if (togetherKey && togetherKey.isActive) {
      together = new OpenAI({ 
        apiKey: togetherKey.apiKey,
        baseURL: "https://api.together.xyz/v1"
      });
      console.log("Together.ai client initialized with key from database");
    } else if (process.env.TOGETHER_API_KEY) {
      // Fallback to environment variable
      together = new OpenAI({ 
        apiKey: process.env.TOGETHER_API_KEY,
        baseURL: "https://api.together.xyz/v1"
      });
      console.log("Together.ai client initialized with key from environment variable");
    } else {
      console.log("No Together.ai API key available. Together.ai features will be disabled.");
    }

    // AIML and OpenRouter will be initialized on demand using their respective functions
    console.log("AIML and OpenRouter will be initialized on demand");
  } catch (error) {
    console.error("Error initializing AI clients:", error);
    
    // Initialize with environment variables as fallback, but only if they exist
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    if (process.env.GROQ_API_KEY) {
      console.log("Groq API key found in environment, but Groq SDK is not installed");
    }
    if (process.env.TOGETHER_API_KEY) {
      together = new OpenAI({ 
        apiKey: process.env.TOGETHER_API_KEY,
        baseURL: "https://api.together.xyz/v1"
      });
    }
  }
}

export interface ChatMessage {
  role: string;
  content: string;
}

interface CompletionResult {
  success: boolean;
  message?: any;
  usage?: any;
  error?: string;
  streaming?: boolean;
}

// Function to generate OpenAI completions
export async function generateOpenAICompletion(messages: any[], res?: any): Promise<CompletionResult> {
  try {
    // Check if OpenAI client is initialized
    if (!openai) {
      return {
        success: false,
        error: "OpenAI API key is not configured. Please add your API key in the settings.",
      };
    }

    // If res is provided, use streaming mode
    if (res) {
      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        });

        let fullContent = "";
        
        // Stream the response word by word
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            // Send the chunk to the client
            res.write(`data: ${JSON.stringify({ content, fullContent })}\n\n`);
          }
        }
        
        // End the stream
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        
        return {
          success: true,
          message: {
            role: "assistant",
            content: fullContent,
          },
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
          streaming: true,
        };
      } catch (streamError: any) {
        console.error("Error in OpenAI stream:", streamError);
        res.write(`data: ${JSON.stringify({ error: streamError.message || "Stream error" })}\n\n`);
        res.end();
        throw streamError;
      }
    } else {
      // Non-streaming mode (fallback)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        success: true,
        message: {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content || "",
        },
        usage: completion.usage,
      };
    }
  } catch (error: any) {
    console.error("Error generating OpenAI completion:", error);
    
    // Check for specific error types
    if (error.code === 'invalid_api_key') {
      return {
        success: false,
        error: "Invalid OpenAI API key. Please check your API key and try again.",
      };
    } else if (error.code === 'insufficient_quota') {
      return {
        success: false,
        error: "You've exceeded your OpenAI API quota. Please check your billing details or use a different API key.",
      };
    } else if (error.code === 'rate_limit_exceeded') {
      return {
        success: false,
        error: "OpenAI API rate limit exceeded. Please try again later.",
      };
    }
    
    return {
      success: false,
      error: error.message || "Unknown error occurred with OpenAI API",
    };
  }
}

// Function to generate Anthropic completions
export async function generateAnthropicCompletion(messages: any[]): Promise<CompletionResult> {
  try {
    // Check if Anthropic client is initialized
    if (!anthropic) {
      return {
        success: false,
        error: "Anthropic API key is not configured. Please add your API key in the settings.",
      };
    }
    
    // Using the latest available Claude model (as of 2024)
    const completion = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      messages: messages.map(msg => ({
        role: msg.role as any,
        content: msg.content,
      })),
    });

    let textContent = "";
    try {
      const content = completion.content[0];
      if (content.type === "text") {
        textContent = content.text;
      } else {
        textContent = JSON.stringify(content);
      }
    } catch (err) {
      textContent = "Could not parse response content";
    }

    return {
      success: true,
      message: {
        role: "assistant",
        content: textContent,
      },
      usage: {
        prompt_tokens: completion.usage.input_tokens,
        completion_tokens: completion.usage.output_tokens,
        total_tokens: completion.usage.input_tokens + completion.usage.output_tokens,
      },
    };
  } catch (error: any) {
    console.error("Error generating Anthropic completion:", error);
    
    // Check for specific error types
    if (error.status === 401) {
      return {
        success: false,
        error: "Invalid Anthropic API key. Please check your API key and try again.",
      };
    } else if (error.status === 429) {
      return {
        success: false,
        error: "You've exceeded your Anthropic API rate limit. Please try again later.",
      };
    }
    
    return {
      success: false,
      error: error.message || "Unknown error occurred with Anthropic API",
    };
  }
}

// Function to generate Google Gemini completions
export async function generateGeminiCompletion(messages: any[]): Promise<CompletionResult> {
  try {
    // Check if Gemini client is initialized
    if (!geminiAI || !geminiModel) {
      // Try to initialize with API key from database
      const geminiKey = await storage.getChatbotKeyByProvider("gemini");
      if (!geminiKey || !geminiKey.isActive) {
        return {
          success: false,
          error: "Gemini API key is not configured or inactive. Please add your API key in the settings.",
        };
      }

      // Initialize Gemini client
      try {
        geminiAI = new GoogleGenerativeAI(geminiKey.apiKey);
        geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch (initError) {
        console.error("Error initializing Gemini client:", initError);
        return {
          success: false,
          error: "Failed to initialize Gemini client. Please check your API key.",
        };
      }
    }

    // Extract the user's message from the messages array
    // Gemini expects a simple string prompt or a formatted chat history
    let prompt = "";
    
    // If there's only one message, use it directly
    if (messages.length === 1) {
      prompt = messages[0].content;
    } else {
      // For multiple messages, format as a conversation
      // Get the last user message
      const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
      if (lastUserMessage) {
        prompt = lastUserMessage.content;
      } else {
        return {
          success: false,
          error: "No user message found in the conversation.",
        };
      }
    }

    try {
      // Generate content using the Gemini model
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        message: {
          role: "assistant",
          content: text,
        },
        usage: {
          // Gemini doesn't provide token usage in the same way as OpenAI
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    } catch (apiError: any) {
      console.error("Error generating Gemini completion:", apiError);
      
      // Handle specific error types
      if (apiError.message?.includes("API key")) {
        return {
          success: false,
          error: "Invalid Gemini API key. Please check your API key and try again.",
        };
      } else if (apiError.message?.includes("rate limit")) {
        return {
          success: false,
          error: "Gemini API rate limit exceeded. Please try again later.",
        };
      }
      
      return {
        success: false,
        error: apiError.message || "Unknown error occurred with Gemini API",
      };
    }
  } catch (error: any) {
    console.error("Error generating Gemini completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with Gemini API",
    };
  }
}

// Function to verify API key validity
export async function verifyApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; message?: string }> {
  try {
    switch (provider) {
      case "openai": {
        // Create a temporary OpenAI client with the provided key
        const tempClient = new OpenAI({ apiKey });
        
        // Make a simple API call to verify the key
        try {
          await tempClient.models.list({ limit: 1 });
          return { valid: true };
        } catch (error: any) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid OpenAI API key" };
          } else if (error.status === 429) {
            return { valid: false, message: "OpenAI API rate limit exceeded" };
          } else {
            return { valid: false, message: error.message || "Error verifying OpenAI API key" };
          }
        }
      }
      
      case "anthropic": {
        // Create a temporary Anthropic client with the provided key
        const tempClient = new Anthropic({ apiKey });
        
        // Make a simple API call to verify the key
        try {
          await tempClient.models.list();
          return { valid: true };
        } catch (error: any) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid Anthropic API key" };
          } else if (error.status === 429) {
            return { valid: false, message: "Anthropic API rate limit exceeded" };
          } else {
            return { valid: false, message: error.message || "Error verifying Anthropic API key" };
          }
        }
      }
      
      case "gemini": {
        // Verify Gemini API key with the SDK
        try {
          const tempGeminiAI = new GoogleGenerativeAI(apiKey);
          const tempGeminiModel = tempGeminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          
          // Make a simple API call to verify the key
          await tempGeminiModel.generateContent("Test");
          return { valid: true };
        } catch (error: any) {
          if (error.message?.includes("API key")) {
            return { valid: false, message: "Invalid Gemini API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying Gemini API key" };
          }
        }
      }
      
      case "groq": {
        // Verify Groq API key with the SDK
        try {
          return { valid: false, message: "Groq integration is currently unavailable. The @groq/groq package is not installed." };
        } catch (error: any) {
          return { valid: false, message: error.message || "Error verifying Groq API key" };
        }
      }
      
      case "together": {
        // Verify Together.ai API key with the OpenAI SDK
        try {
          const tempTogether = new OpenAI({ 
            apiKey,
            baseURL: "https://api.together.xyz/v1"
          });
          
          // Make a simple API call to verify the key
          await tempTogether.chat.completions.create({
            messages: [{ role: "user", content: "Test" }],
            model: "meta-llama/Llama-3-70b-chat-hf",
            max_tokens: 1
          });
          return { valid: true };
        } catch (error: any) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid Together.ai API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying Together.ai API key" };
          }
        }
      }
      
      case "aiml": {
        // Verify AIML API key with the OpenAI SDK
        try {
          const tempClient = new OpenAI({
            apiKey,
            baseURL: "https://api.aimlapi.com/v1",
          });
          
          // Make a simple API call to verify the key
          await tempClient.models.list({ limit: 1 });
          return { valid: true };
        } catch (error: any) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid AIML API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying AIML API key" };
          }
        }
      }
      
      case "openrouter": {
        // Verify OpenRouter API key with the OpenAI SDK
        try {
          const tempClient = new OpenAI({
            apiKey,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
              "HTTP-Referer": "https://glowctf.com",
              "X-Title": "GlowCTF Arena"
            }
          });
          
          // Make a simple API call to verify the key
          await tempClient.models.list({ limit: 1 });
          return { valid: true };
        } catch (error: any) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid OpenRouter API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying OpenRouter API key" };
          }
        }
      }
      
      default:
        // For providers without verification, assume key is valid
        return { valid: true };
    }
  } catch (error: any) {
    console.error(`Error verifying ${provider} API key:`, error);
    return { valid: false, message: `Error verifying ${provider} API key: ${error.message}` };
  }
}

// Function to generate AIML completions
export async function generateAIMLCompletion(messages: any[]): Promise<CompletionResult> {
  try {
    // Get AIML API key
    const aimlKey = await storage.getChatbotKeyByProvider("aiml");
    if (!aimlKey || !aimlKey.isActive) {
      return {
        success: false,
        error: "AIML API key is not configured or inactive. Please add your API key in the settings.",
      };
    }

    try {
      // Create a temporary OpenAI client with AIML base URL
      const aimlClient = new OpenAI({
        apiKey: aimlKey.apiKey,
        baseURL: "https://api.aimlapi.com/v1",
      });

      // Extract system and user messages
      let systemMessage = "You are a helpful assistant.";
      let userMessage = "";

      for (const message of messages) {
        if (message.role === "system") {
          systemMessage = message.content;
        } else if (message.role === "user") {
          // Use the last user message
          userMessage = message.content;
        }
      }

      // If no user message was found, use the last message regardless of role
      if (!userMessage && messages.length > 0) {
        userMessage = messages[messages.length - 1].content;
      }

      // Generate completion using the OpenAI SDK with AIML endpoint
      const completion = await aimlClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        success: true,
        message: {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content || "",
        },
        usage: completion.usage,
      };
    } catch (apiError: any) {
      console.error("Error generating AIML completion:", apiError);
      
      // Handle specific error types
      if (apiError.status === 401 || apiError.status === 403) {
        return {
          success: false,
          error: "Invalid AIML API key. Please check your API key and try again.",
        };
      } else if (apiError.status === 429) {
        return {
          success: false,
          error: "AIML API rate limit exceeded. Please try again later.",
        };
      } else if (apiError.message) {
        return {
          success: false,
          error: `AIML API error: ${apiError.message}`,
        };
      }
      
      throw apiError; // Re-throw for the outer catch block
    }
  } catch (error: any) {
    console.error("Error generating AIML completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with AIML API",
    };
  }
}

// Function to generate OpenRouter completions
export async function generateOpenRouterCompletion(messages: any[]): Promise<CompletionResult> {
  try {
    // Get OpenRouter API key
    const openRouterKey = await storage.getChatbotKeyByProvider("openrouter");
    if (!openRouterKey || !openRouterKey.isActive) {
      return {
        success: false,
        error: "OpenRouter API key is not configured or inactive. Please add your API key in the settings.",
      };
    }

    try {
      // Create a temporary OpenAI client with OpenRouter base URL
      const openRouterClient = new OpenAI({
        apiKey: openRouterKey.apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://glowctf.com", // Required by OpenRouter
          "X-Title": "GlowCTF Arena" // Required by OpenRouter
        }
      });

      // Generate completion using the OpenAI SDK with OpenRouter endpoint
      const completion = await openRouterClient.chat.completions.create({
        model: "openai/gpt-4o",
        messages: messages,
        max_tokens: 500, // Important: Lower token request as mentioned in the example
      });

      return {
        success: true,
        message: {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content || "",
        },
        usage: completion.usage,
      };
    } catch (apiError: any) {
      console.error("Error generating OpenRouter completion:", apiError);
      
      // Handle specific error types
      if (apiError.status === 401 || apiError.status === 403) {
        return {
          success: false,
          error: "Invalid OpenRouter API key. Please check your API key and try again.",
        };
      } else if (apiError.status === 429) {
        return {
          success: false,
          error: "OpenRouter API rate limit exceeded. Please try again later.",
        };
      } else if (apiError.message) {
        return {
          success: false,
          error: `OpenRouter API error: ${apiError.message}`,
        };
      }
      
      throw apiError; // Re-throw for the outer catch block
    }
  } catch (error: any) {
    console.error("Error generating OpenRouter completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with OpenRouter API",
    };
  }
}

// Function to generate Together.ai completions
export async function generateTogetherCompletion(messages: any[]): Promise<CompletionResult> {
  try {
    // Check if Together client is initialized
    if (!together) {
      // Try to initialize with API key from database
      const togetherKey = await storage.getChatbotKeyByProvider("together");
      if (!togetherKey || !togetherKey.isActive) {
        return {
          success: false,
          error: "Together.ai API key is not configured or inactive. Please add your API key in the settings.",
        };
      }

      // Initialize Together client
      try {
        together = new OpenAI({ 
          apiKey: togetherKey.apiKey,
          baseURL: "https://api.together.xyz/v1"
        });
      } catch (initError) {
        console.error("Error initializing Together client:", initError);
        return {
          success: false,
          error: "Failed to initialize Together client. Please check your API key.",
        };
      }
    }

    try {
      // Generate completion using the OpenAI SDK with Together.ai endpoint
      const response = await together.chat.completions.create({
        model: "meta-llama/Llama-3-70b-chat-hf",
        messages: messages,
      });

      return {
        success: true,
        message: {
          role: response.choices[0].message.role,
          content: response.choices[0].message.content || "",
        },
        usage: response.usage,
      };
    } catch (apiError: any) {
      console.error("Error generating Together.ai completion:", apiError);
      
      // Handle specific error types
      if (apiError.status === 401 || apiError.status === 403) {
        return {
          success: false,
          error: "Invalid Together.ai API key. Please check your API key and try again.",
        };
      } else if (apiError.status === 429) {
        return {
          success: false,
          error: "Together.ai API rate limit exceeded. Please try again later.",
        };
      } else if (apiError.message) {
        return {
          success: false,
          error: `Together.ai API error: ${apiError.message}`,
        };
      }
      
      throw apiError; // Re-throw for the outer catch block
    }
  } catch (error: any) {
    console.error("Error generating Together.ai completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with Together.ai API",
    };
  }
}

// Function to generate Groq completions
export async function generateGroqCompletion(messages: any[]): Promise<CompletionResult> {
  try {
    return {
      success: false,
      error: "Groq integration is currently unavailable. The @groq/groq package is not installed."
    };
  } catch (error: any) {
    console.error("Error generating Groq completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred with Groq API",
    };
  }
}