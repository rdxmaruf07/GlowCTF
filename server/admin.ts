import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { initializeAIClients } from "./services/chatbot";

// Add type definitions for Express
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: string;
    }
  }
}

// Middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
}

export function setupAdminRoutes(app: Express) {
  // Get all API keys
  app.get("/api/admin/api-keys", isAdmin, async (req, res, next) => {
    try {
      const apiKeys = await storage.getAllChatbotKeys();
      
      // Remove full key values for security, just show the first and last few characters
      const maskedKeys = apiKeys.map(key => {
        const originalKey = key.apiKey;
        let maskedKey = originalKey;
        
        if (originalKey && originalKey.length > 8) {
          maskedKey = originalKey.substring(0, 4) + "..." + originalKey.substring(originalKey.length - 4);
        }
        
        return {
          ...key,
          apiKey: maskedKey
        };
      });
      
      res.json(maskedKeys);
    } catch (error) {
      next(error);
    }
  });
  
  // Update API key
  app.put("/api/admin/api-keys", isAdmin, async (req, res, next) => {
    try {
      const { provider, key, isActive } = req.body;
      
      if (!provider || !key) {
        return res.status(400).json({ message: "Provider and key are required" });
      }
      
      // Check if the key for this provider already exists
      const existingKey = await storage.getChatbotKeyByProvider(provider);
      
      let result;
      
      if (existingKey) {
        // Update existing key
        result = await storage.updateChatbotKey(existingKey.id, {
          apiKey: key,
          isActive: isActive ?? true
        });
      } else {
        // Create new key
        if (!req.user || !req.user.id) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        result = await storage.saveChatbotKey({
          userId: req.user.id,
          provider,
          apiKey: key,
          isActive: isActive ?? true
        });
      }
      
      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  });
  
  // Delete API key
  app.delete("/api/admin/api-keys/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      await storage.deleteChatbotKey(id);
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
}