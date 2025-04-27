import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

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

  const httpServer = createServer(app);
  return httpServer;
}
