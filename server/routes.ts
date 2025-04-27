import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import axios from "axios";
import { insertChallengeSchema } from "@shared/schema";
import { generateOpenAICompletion, generateAnthropicCompletion } from "./services/chatbot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Challenges endpoints
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      res.status(200).json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challenge = await storage.getChallengeById(parseInt(req.params.id));
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.status(200).json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenge" });
    }
  });

  app.post("/api/challenges", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const challenge = await storage.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  app.post("/api/challenges/submit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { flag, startTime } = req.body;
    const challengeId = parseInt(req.params.id);
    
    try {
      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      if (challenge.flag === flag) {
        // Calculate time to solve
        const timeToSolve = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
        
        // Calculate bonus points (faster solve = more points, max 50% bonus)
        const basePoints = challenge.points;
        let bonusPoints = 0;
        
        if (timeToSolve && timeToSolve < 300) { // Under 5 minutes
          bonusPoints = Math.floor(basePoints * 0.5);
        } else if (timeToSolve && timeToSolve < 600) { // Under 10 minutes
          bonusPoints = Math.floor(basePoints * 0.25);
        } else if (timeToSolve && timeToSolve < 1800) { // Under 30 minutes
          bonusPoints = Math.floor(basePoints * 0.1);
        }
        
        const totalPoints = basePoints + bonusPoints;
        
        // Record completion
        const completedChallenge = await storage.completeChallenge({
          userId: req.user.id,
          challengeId: challengeId,
          timeToSolve: timeToSolve || null,
          pointsAwarded: totalPoints
        });
        
        // Update user score
        await storage.updateUserScore(req.user.id, totalPoints);
        
        // Check for new badges
        const newBadges = await storage.checkAndAwardBadges(req.user.id, challengeId);
        
        res.status(200).json({ 
          success: true, 
          points: totalPoints, 
          basePoints, 
          bonusPoints,
          newBadges: newBadges.length > 0 ? newBadges : null
        });
      } else {
        res.status(200).json({ success: false, message: "Incorrect flag" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process submission" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // User badges endpoints
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.status(200).json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/users/:id/badges", async (req, res) => {
    try {
      const userBadges = await storage.getUserBadges(parseInt(req.params.id));
      res.status(200).json(userBadges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Chatbot API keys endpoints
  app.post("/api/chatbot/keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { provider, apiKey } = req.body;
      const chatbotKey = await storage.saveChatbotKey({
        userId: req.user.id,
        provider,
        apiKey
      });
      
      res.status(201).json({ 
        id: chatbotKey.id,
        provider: chatbotKey.provider,
        createdAt: chatbotKey.createdAt
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save API key" });
    }
  });

  app.get("/api/chatbot/keys", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const keys = await storage.getUserChatbotKeys(req.user.id);
      // Return only provider names, not the actual keys
      const providers = keys.map(key => ({
        id: key.id,
        provider: key.provider,
        createdAt: key.createdAt
      }));
      
      res.status(200).json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  // Chat history endpoints
  app.post("/api/chatbot/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { provider, messages, title } = req.body;
      const chatHistory = await storage.saveChatHistory({
        userId: req.user.id,
        provider,
        messages,
        title
      });
      
      res.status(201).json(chatHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to save chat history" });
    }
  });

  app.get("/api/chatbot/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const history = await storage.getUserChatHistory(req.user.id);
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // User profile endpoints
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userStats = await storage.getUserStats(parseInt(req.params.id));
      res.status(200).json(userStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/users/:id/completed-challenges", async (req, res) => {
    try {
      const completedChallenges = await storage.getUserCompletedChallenges(parseInt(req.params.id));
      res.status(200).json(completedChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed challenges" });
    }
  });
  
  // Direct AI chat completion endpoints - no user API keys required
  app.post("/api/chatbot/completion", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { provider, messages } = req.body;
      
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Invalid messages data" });
      }
      
      let result;
      
      if (provider === "openai") {
        result = await generateOpenAICompletion(messages);
      } else if (provider === "anthropic") {
        result = await generateAnthropicCompletion(messages);
      } else {
        return res.status(400).json({ message: "Invalid provider" });
      }
      
      if (!result.success) {
        return res.status(500).json({ message: result.error || "Failed to generate completion" });
      }
      
      // Save chat history
      await storage.saveChatHistory({
        userId: req.user.id,
        provider,
        messages: [...messages, result.message],
        title: messages[0].content.substring(0, 50) + "..."
      });
      
      res.status(200).json({
        message: result.message,
        usage: result.usage
      });
    } catch (error) {
      console.error("Error in chat completion:", error);
      res.status(500).json({ message: "Failed to generate completion" });
    }
  });

  // PicoCTF integration
  app.get("/api/picoctf/challenges", async (req, res) => {
    try {
      // We'll use a mock response for now as direct PicoCTF API access requires authentication
      // In a production environment, you would integrate with the actual PicoCTF API
      const picoCTFChallenges = [
        {
          id: "pico1",
          title: "Obedient Cat",
          category: "General Skills",
          difficulty: "easy",
          description: "This file has a flag in plain sight (aka 'in-the-clear'). Download flag.",
          points: 100,
          hints: ["Any hints about how to solve this challenge would be included here."],
          files: [{ name: "flag", url: "https://mercury.picoctf.net/static/0e428b2db9788d31189329bed089ce98/flag" }]
        },
        {
          id: "pico2",
          title: "Mod 26",
          category: "Cryptography",
          difficulty: "easy",
          description: "Cryptography can be easy, do you know what ROT13 is?",
          points: 150,
          hints: ["This can be solved online if you don't want to do it by hand!"],
          flag_format: "cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_MAZyqFQj}"
        },
        {
          id: "pico3",
          title: "Python Wrangling",
          category: "General Skills",
          difficulty: "easy",
          description: "Python scripts are invoked with `python3 script.py` and help can be output with `python3 script.py -h`.",
          points: 200,
          hints: ["Get the Python script access to read the password, then use the script to decode it."],
          files: [
            { name: "ende.py", url: "https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/ende.py" },
            { name: "flag.txt.en", url: "https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/flag.txt.en" },
            { name: "pw.txt", url: "https://mercury.picoctf.net/static/325a52d249be0bd3811421eacd2c877a/pw.txt" }
          ]
        },
        {
          id: "pico4",
          title: "Wave a flag",
          category: "General Skills",
          difficulty: "easy",
          description: "Can you invoke help flags for a command-line program?",
          points: 200,
          hints: ["This program will only work in the webshell or another Linux computer.", "To get the file accessible in your shell, enter the following in the Terminal prompt: `wget https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm`", "Run this program by entering the following in the Terminal prompt: `./warm`, but you'll first have to make it executable with `chmod +x warm`", "The chmod +x command allows the program to be executed."],
          files: [{ name: "warm", url: "https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm" }]
        },
        {
          id: "pico5",
          title: "Information",
          category: "Forensics",
          difficulty: "medium",
          description: "Files can always be changed in a secret way. Can you find the flag?",
          points: 300,
          hints: ["Look at the details of the file", "Make sure to submit the flag as picoCTF{XXXXX}"],
          files: [{ name: "cat.jpg", url: "https://mercury.picoctf.net/static/a614a27d4cb251d04c7d2f3f3f76a965/cat.jpg" }]
        }
      ];
      
      res.status(200).json(picoCTFChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch PicoCTF challenges" });
    }
  });
  
  app.post("/api/picoctf/import", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const { challenges } = req.body;
      
      if (!Array.isArray(challenges) || challenges.length === 0) {
        return res.status(400).json({ message: "Invalid challenges data" });
      }
      
      const importedChallenges = [];
      
      for (const picoChallenge of challenges) {
        // Convert PicoCTF challenge format to our format
        const challengeData = {
          title: picoChallenge.title,
          description: picoChallenge.description,
          difficulty: picoChallenge.difficulty,
          category: picoChallenge.category,
          points: picoChallenge.points,
          flag: picoChallenge.flag || `flag{${picoChallenge.id}_placeholder}`, // In real implementation, admin would add correct flags
          imageUrl: picoChallenge.files && picoChallenge.files.length > 0 ? 
            picoChallenge.files[0].url : 
            "https://images.unsplash.com/photo-1557853197-aefb550b6fdc"
        };
        
        try {
          // Validate with our schema
          const parsedData = insertChallengeSchema.parse(challengeData);
          const importedChallenge = await storage.createChallenge(parsedData);
          importedChallenges.push(importedChallenge);
        } catch (parseError) {
          console.error(`Failed to import challenge ${picoChallenge.title}:`, parseError);
          // Continue with next challenge even if one fails
        }
      }
      
      res.status(200).json({ 
        success: true, 
        count: importedChallenges.length,
        challenges: importedChallenges
      });
    } catch (error) {
      console.error("Failed to import PicoCTF challenges:", error);
      res.status(500).json({ message: "Failed to import PicoCTF challenges" });
    }
  });

  app.post("/api/picoctf/submit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { flag, startTime } = req.body;
    const challengeId = req.params.id;
    
    try {
      // Find the challenge by its PicoCTF ID from our database
      const existingChallenges = await storage.getAllChallenges();
      const challenge = existingChallenges.find(c => c.title.includes(challengeId) || c.description.includes(challengeId));
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Verify the flag
      if (challenge.flag === flag) {
        // Calculate time to solve
        const timeToSolve = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
        
        // Calculate bonus points (faster solve = more points, max 50% bonus)
        const basePoints = challenge.points;
        let bonusPoints = 0;
        
        if (timeToSolve && timeToSolve < 300) { // Under 5 minutes
          bonusPoints = Math.floor(basePoints * 0.5);
        } else if (timeToSolve && timeToSolve < 600) { // Under 10 minutes
          bonusPoints = Math.floor(basePoints * 0.25);
        } else if (timeToSolve && timeToSolve < 1800) { // Under 30 minutes
          bonusPoints = Math.floor(basePoints * 0.1);
        }
        
        const totalPoints = basePoints + bonusPoints;
        
        // Record completion
        const completedChallenge = await storage.completeChallenge({
          userId: req.user.id,
          challengeId: challenge.id,
          timeToSolve: timeToSolve || null,
          pointsAwarded: totalPoints
        });
        
        // Update user score
        await storage.updateUserScore(req.user.id, totalPoints);
        
        // Check for new badges
        const newBadges = await storage.checkAndAwardBadges(req.user.id, challenge.id);
        
        res.status(200).json({ 
          success: true, 
          points: totalPoints, 
          basePoints, 
          bonusPoints,
          newBadges: newBadges.length > 0 ? newBadges : null
        });
      } else {
        res.status(200).json({ success: false, message: "Incorrect flag" });
      }
    } catch (error) {
      console.error("Failed to process PicoCTF submission:", error);
      res.status(500).json({ message: "Failed to process submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
