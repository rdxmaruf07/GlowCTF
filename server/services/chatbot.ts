import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import Groq from "groq-sdk";
import { storage } from "../mysql-storage";

let geminiAI: GoogleGenerativeAI;
let geminiModel: GenerativeModel;
let xaiApiKey: string | null = null;
let groq: Groq;

export async function initializeAIClients() {
  try {
    const geminiKey = await storage.getChatbotKeyByProvider("gemini");
    if (geminiKey && geminiKey.isActive) {
      geminiAI = new GoogleGenerativeAI(geminiKey.apiKey);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("Gemini client initialized with key from database");
    } else if (process.env.GEMINI_API_KEY) {
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log("Gemini client initialized with key from environment variable");
    } else {
      console.log("No Gemini API key available. Gemini features will be disabled.");
    }

    const xaiKey = await storage.getChatbotKeyByProvider("xai");
    if (xaiKey && xaiKey.isActive) {
      xaiApiKey = xaiKey.apiKey;
      console.log("xAI client initialized with key from database");
    } else {
      console.log("No xAI API key available. xAI features will be disabled.");
    }

    const groqKey = await storage.getChatbotKeyByProvider("groq");
    if (groqKey && groqKey.isActive) {
      groq = new Groq({ apiKey: groqKey.apiKey });
      console.log("Groq client initialized with key from database");
    } else if (process.env.GROQ_API_KEY) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log("Groq client initialized with key from environment variable");
    } else {
      console.log("No Groq API key available. Groq features will be disabled.");
    }
  } catch (error) {
    console.error("Error initializing AI clients:", error);
    if (process.env.GEMINI_API_KEY) {
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    if (process.env.GROQ_API_KEY) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
  }
}

export async function generateGeminiCompletion(messages: any[], res?: any): Promise<any> {
  try {
    if (!geminiAI || !geminiModel) {
      const geminiKey = await storage.getChatbotKeyByProvider("gemini");
      if (!geminiKey || !geminiKey.isActive) {
        return {
          success: false,
          error: "Gemini API key is not configured or inactive. Please add your API key in the settings.",
        };
      }
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

    const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
    if (!lastUserMessage) {
      return { success: false, error: "No user message found." };
    }
    const prompt = lastUserMessage.content;

    if (res) {
      const result = await geminiModel.generateContentStream(prompt);
      let fullContent = "";
      for await (const chunk of result.stream) {
        const content = chunk.text();
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content, fullContent })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      return {
        success: true,
        message: { role: "assistant", content: fullContent },
        streaming: true,
      };
    } else {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: { role: "assistant", content: text },
      };
    }
  } catch (error: any) {
    console.error("Error generating Gemini completion:", error);
    if (res) {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`);
      res.end();
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with Gemini API",
    };
  }
}

export async function generateGroqCompletion(messages: any[], res?: any): Promise<any> {
  try {
    if (!groq) {
      return {
        success: false,
        error: "Groq API key is not configured. Please add your API key in the settings.",
      };
    }

    if (res) {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages as any,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content, fullContent })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      return {
        success: true,
        message: { role: "assistant", content: fullContent },
        streaming: true,
      };
    } else {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages as any,
      });

      return {
        success: true,
        message: {
          role: response.choices[0].message.role,
          content: response.choices[0].message.content || "",
        },
        usage: response.usage,
      };
    }
  } catch (error: any) {
    console.error("Error generating Groq completion:", error);
    if (res) {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`);
      res.end();
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with Groq API",
    };
  }
}

export async function generateXaiCompletion(messages: any[], res?: any): Promise<any> {
  try {
    if (!xaiApiKey) {
      return {
        success: false,
        error: "xAI API key is not configured. Please add your API key in the settings.",
      };
    }

    const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
    if (!lastUserMessage) {
      return { success: false, error: "No user message found." };
    }
    const prompt = lastUserMessage.content;

    if (res) {
      // Use real streaming with Vercel AI SDK for fast, responsive output
      const result = await streamText({
        model: xai("grok-3-mini-fast"),
        prompt: prompt,
        apiKey: xaiApiKey
      });

      let fullContent = "";
      for await (const textPart of result.textStream) {
        fullContent += textPart;
        res.write(`data: ${JSON.stringify({ content: textPart, fullContent })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      return {
        success: true,
        message: { role: "assistant", content: fullContent },
        streaming: true,
      };
    } else {
      const { text } = await generateText({
        model: xai("grok-3-mini-fast"),
        prompt: prompt
      }, {
        apiKey: xaiApiKey
      });

      return {
        success: true,
        message: { role: "assistant", content: text },
      };
    }
  } catch (error: any) {
    console.error("Error generating xAI completion:", error);
    if (res) {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`);
      res.end();
    }
    return {
      success: false,
      error: error.message || "Unknown error occurred with xAI API",
    };
  }
}

export async function verifyApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; message?: string }> {
  try {
    switch (provider) {
      case "gemini": {
        try {
          const tempGeminiAI = new GoogleGenerativeAI(apiKey);
          const tempGeminiModel = tempGeminiAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
        try {
          const tempGroq = new Groq({ apiKey });
          await tempGroq.models.list();
          return { valid: true };
        } catch (error: any) {
          if (error.status === 401) {
            return { valid: false, message: "Invalid Groq API key" };
          } else {
            return { valid: false, message: error.message || "Error verifying Groq API key" };
          }
        }
      }
      
      case "xai": {
        try {
          // Test the xAI key with a simple generation
          const { text } = await generateText({
            model: xai("grok-3-mini-fast"),
            prompt: "Test"
          }, {
            apiKey
          });
          return { valid: true };
        } catch (error: any) {
          return { valid: false, message: error.message || "Invalid xAI API key" };
        }
      }
      default:
        return { valid: true };
    }
  } catch (error: any) {
    console.error(`Error verifying ${provider} API key:`, error);
    return { valid: false, message: `Error verifying ${provider} API key: ${error.message}` };
  }
}
