import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "../storage";

// We will create dynamic instances of these clients based on the keys in the database
let openai: OpenAI;
let anthropic: Anthropic;

// Function to initialize the AI clients with API keys from the database
export async function initializeAIClients() {
  try {
    // Get OpenAI key
    const openaiKey = await storage.getChatbotKeyByProvider("openai");
    if (openaiKey && openaiKey.isActive) {
      openai = new OpenAI({ apiKey: openaiKey.apiKey });
      console.log("OpenAI client initialized with key from database");
    } else {
      // Fallback to environment variable
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log("OpenAI client initialized with key from environment variable");
    }

    // Get Anthropic key
    const anthropicKey = await storage.getChatbotKeyByProvider("anthropic");
    if (anthropicKey && anthropicKey.isActive) {
      anthropic = new Anthropic({ apiKey: anthropicKey.apiKey });
      console.log("Anthropic client initialized with key from database");
    } else {
      // Fallback to environment variable
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      console.log("Anthropic client initialized with key from environment variable");
    }
  } catch (error) {
    console.error("Error initializing AI clients:", error);
    
    // Initialize with environment variables as fallback
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
}

// Function to generate OpenAI completions
export async function generateOpenAICompletion(messages: any[]): Promise<CompletionResult> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
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
  } catch (error: any) {
    console.error("Error generating OpenAI completion:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

// Function to generate Anthropic completions
export async function generateAnthropicCompletion(messages: any[]): Promise<CompletionResult> {
  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const completion = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
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
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}