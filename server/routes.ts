import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupAdminRoutes } from "./admin";
import { storage } from "./mysql-storage";
import axios from "axios";
import { insertChallengeSchema } from "@shared/mysql-schema";
import { 
  generateGeminiCompletion,
  generateGroqCompletion,
  generateXaiCompletion,
  initializeAIClients,
  verifyApiKey
} from "./services/chatbot";
import { setupChallengeRoutes } from "./routes/challenge-routes";
import { setupContestRoutes } from "./routes/contest-routes";
import { setupLandingRoutes } from "./routes/landing-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Railway
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Set up authentication routes
  setupAuth(app);
  
  // Set up admin routes
  setupAdminRoutes(app);
  
  // Initialize AI clients with keys from database
  await initializeAIClients();
  
  // Set up challenge and contest routes
  setupChallengeRoutes(app);
  setupContestRoutes(app);
  
  // Set up landing page routes
  setupLandingRoutes(app);
  
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
      const { provider, key } = req.body;
      
      // Validate provider
      const validProviders = ["gemini", "groq", "xai"];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ message: "Invalid provider" });
      }
      
      // Basic API key validation
      if (!key || typeof key !== 'string' || key.trim().length < 10) {
        return res.status(400).json({ message: "Invalid API key format" });
      }
      
      // Provider-specific validation
      
      // Verify the API key with the provider
      try {
        const verification = await verifyApiKey(provider, key);
        if (!verification.valid) {
          return res.status(400).json({ message: verification.message || "Invalid API key" });
        }
      } catch (verificationError) {
        console.error("Error verifying API key:", verificationError);
        // Continue with saving the key even if verification fails
        // This allows users to add keys even if the API is temporarily unavailable
      }
      
      // Check if key already exists for this provider and user
      const existingKeys = await storage.getUserChatbotKeys(req.user.id);
      const existingKey = existingKeys.find(k => k.provider === provider);
      
      let chatbotKey;
      
      if (existingKey) {
        // Update existing key
        chatbotKey = await storage.updateChatbotKey(existingKey.id, {
          apiKey: key,
          isActive: true
        });
      } else {
        // Create new key
        chatbotKey = await storage.saveChatbotKey({
          userId: req.user.id,
          provider,
          apiKey: key,
          isActive: true
        });
      }
      
      // Reinitialize AI clients to use the new key
      await initializeAIClients();
      
      res.status(201).json({ 
        id: chatbotKey.id,
        provider: chatbotKey.provider,
        createdAt: chatbotKey.createdAt
      });
    } catch (error) {
      console.error("Error saving API key:", error);
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
        apiKey: key.apiKey.substring(0, 8) + "...",
        isActive: key.isActive,
        createdAt: key.createdAt
      }));

      res.status(200).json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.delete("/api/chatbot/keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const keyId = parseInt(req.params.id);

      // Verify the key belongs to the user
      const keys = await storage.getUserChatbotKeys(req.user.id);
      const keyToDelete = keys.find(k => k.id === keyId);

      if (!keyToDelete) {
        return res.status(404).json({ message: "API key not found" });
      }

      await storage.deleteChatbotKey(keyId);

      // Reinitialize AI clients after deleting a key
      await initializeAIClients();

      res.status(200).json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
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

  // User milestones endpoint
  app.get("/api/users/:id/milestones", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get the user's completed challenges
      const completedChallenges = await storage.getUserCompletedChallenges(userId);
      
      // Get the user's badges
      const userBadges = await storage.getUserBadges(userId);
      const userBadgeIds = userBadges.map(badge => badge.id);
      
      // Get all badges to check which ones are not yet earned
      const allBadges = await storage.getAllBadges();
      
      // Get user's total score
      const user = await storage.getUser(userId);
      const userScore = user?.score || 0;
      
      // Get category-specific challenges completed
      const challengesByCategory: Record<string, number> = {};
      const challengesByDifficulty: Record<string, number> = {};
      
      completedChallenges.forEach(challenge => {
        // Count by category
        if (!challengesByCategory[challenge.category]) {
          challengesByCategory[challenge.category] = 0;
        }
        challengesByCategory[challenge.category]++;
        
        // Count by difficulty
        if (!challengesByDifficulty[challenge.difficulty]) {
          challengesByDifficulty[challenge.difficulty] = 0;
        }
        challengesByDifficulty[challenge.difficulty]++;
      });
      
      // Build milestone data
      const milestoneData = {
        achievements: [
          {
            id: "solve-1",
            name: "Beginner",
            description: "Solve your first challenge",
            progress: Math.min(completedChallenges.length, 1),
            total: 1,
            completed: completedChallenges.length >= 1,
            badgeId: allBadges.find(b => b.requirement === "solve-1")?.id
          },
          {
            id: "solve-5",
            name: "Apprentice",
            description: "Solve 5 challenges",
            progress: Math.min(completedChallenges.length, 5),
            total: 5,
            completed: completedChallenges.length >= 5,
            badgeId: allBadges.find(b => b.requirement === "solve-5")?.id
          },
          {
            id: "solve-10",
            name: "Journeyman",
            description: "Solve 10 challenges",
            progress: Math.min(completedChallenges.length, 10),
            total: 10,
            completed: completedChallenges.length >= 10,
            badgeId: allBadges.find(b => b.requirement === "solve-10")?.id
          },
          {
            id: "solve-25",
            name: "Expert",
            description: "Solve 25 challenges",
            progress: Math.min(completedChallenges.length, 25),
            total: 25,
            completed: completedChallenges.length >= 25,
            badgeId: allBadges.find(b => b.requirement === "solve-25")?.id
          },
          {
            id: "solve-50",
            name: "Master",
            description: "Solve 50 challenges",
            progress: Math.min(completedChallenges.length, 50),
            total: 50,
            completed: completedChallenges.length >= 50,
            badgeId: allBadges.find(b => b.requirement === "solve-50")?.id
          },
          {
            id: "solve-100",
            name: "Grandmaster",
            description: "Solve 100 challenges",
            progress: Math.min(completedChallenges.length, 100),
            total: 100,
            completed: completedChallenges.length >= 100,
            badgeId: allBadges.find(b => b.requirement === "solve-100")?.id
          }
        ],
        categories: Object.entries(challengesByCategory).flatMap(([category, count]) => {
          const categoryMilestones = [];
          
          // Category-3 milestone
          categoryMilestones.push({
            id: `category-${category}-3`,
            name: `${category} Novice`,
            description: `Solve 3 ${category} challenges`,
            progress: Math.min(count, 3),
            total: 3,
            completed: count >= 3,
            badgeId: allBadges.find(b => b.requirement === `category-${category}-3`)?.id
          });
          
          // Category-5 milestone
          categoryMilestones.push({
            id: `category-${category}-5`,
            name: `${category} Expert`,
            description: `Solve 5 ${category} challenges`,
            progress: Math.min(count, 5),
            total: 5,
            completed: count >= 5,
            badgeId: allBadges.find(b => b.requirement === `category-${category}-5`)?.id
          });
          
          // Category-10 milestone
          categoryMilestones.push({
            id: `category-${category}-10`,
            name: `${category} Master`,
            description: `Solve 10 ${category} challenges`,
            progress: Math.min(count, 10),
            total: 10,
            completed: count >= 10,
            badgeId: allBadges.find(b => b.requirement === `category-${category}-10`)?.id
          });
          
          return categoryMilestones;
        }),
        difficulty: Object.entries(challengesByDifficulty).flatMap(([difficulty, count]) => {
          const difficultyMilestones = [];
          const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
          
          // Difficulty-3 milestone
          difficultyMilestones.push({
            id: `difficulty-${difficulty}-3`,
            name: `${difficultyName} Solver`,
            description: `Solve 3 ${difficulty} challenges`,
            progress: Math.min(count, 3),
            total: 3,
            completed: count >= 3,
            badgeId: allBadges.find(b => b.requirement === `difficulty-${difficulty}-3`)?.id
          });
          
          // Difficulty-5 milestone
          difficultyMilestones.push({
            id: `difficulty-${difficulty}-5`,
            name: `${difficultyName} Expert`,
            description: `Solve 5 ${difficulty} challenges`,
            progress: Math.min(count, 5),
            total: 5,
            completed: count >= 5,
            badgeId: allBadges.find(b => b.requirement === `difficulty-${difficulty}-5`)?.id
          });
          
          // Difficulty-10 milestone
          difficultyMilestones.push({
            id: `difficulty-${difficulty}-10`,
            name: `${difficultyName} Master`,
            description: `Solve 10 ${difficulty} challenges`,
            progress: Math.min(count, 10),
            total: 10,
            completed: count >= 10,
            badgeId: allBadges.find(b => b.requirement === `difficulty-${difficulty}-10`)?.id
          });
          
          return difficultyMilestones;
        }),
        points: [
          {
            id: "score-1000",
            name: "Point Hunter",
            description: "Earn 1,000 points",
            progress: Math.min(userScore, 1000),
            total: 1000,
            completed: userScore >= 1000,
            badgeId: allBadges.find(b => b.requirement === "score-1000")?.id
          },
          {
            id: "score-5000",
            name: "Point Collector",
            description: "Earn 5,000 points",
            progress: Math.min(userScore, 5000),
            total: 5000,
            completed: userScore >= 5000,
            badgeId: allBadges.find(b => b.requirement === "score-5000")?.id
          },
          {
            id: "score-10000",
            name: "Point Master",
            description: "Earn 10,000 points",
            progress: Math.min(userScore, 10000),
            total: 10000,
            completed: userScore >= 10000,
            badgeId: allBadges.find(b => b.requirement === "score-10000")?.id
          },
          {
            id: "score-25000",
            name: "Point Legend",
            description: "Earn 25,000 points",
            progress: Math.min(userScore, 25000),
            total: 25000,
            completed: userScore >= 25000,
            badgeId: allBadges.find(b => b.requirement === "score-25000")?.id
          },
          {
            id: "score-50000",
            name: "Point God",
            description: "Earn 50,000 points",
            progress: Math.min(userScore, 50000),
            total: 50000,
            completed: userScore >= 50000,
            badgeId: allBadges.find(b => b.requirement === "score-50000")?.id
          }
        ]
      };
      
      res.status(200).json(milestoneData);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestone data" });
    }
  });

  // User profile endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get the user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return sensitive information
      const safeUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        score: user.score,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      };
      
      res.status(200).json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

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
  
  // Update user avatar
  app.patch("/api/users/:id/avatar", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Only allow users to update their own avatar (or admins)
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const { avatarUrl } = req.body;
      
      if (!avatarUrl) {
        return res.status(400).json({ message: "Avatar URL is required" });
      }
      
      const updatedUser = await storage.updateUserAvatar(parseInt(req.params.id), avatarUrl);
      
      res.status(200).json({ 
        success: true, 
        avatarUrl: updatedUser.avatarUrl 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });
  
  // Direct AI chat completion endpoints - no user API keys required
  app.post("/api/chatbot/completion", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { provider, messages, stream } = req.body;
      
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Invalid messages data" });
      }
      
      // If streaming is requested, set up SSE
      if (stream === true) {
        // Set headers for Server-Sent Events
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        if (provider === "gemini") {
          await generateGeminiCompletion(messages, res);
          return;
        } else if (provider === "groq") {
          await generateGroqCompletion(messages, res);
          return;
        } else if (provider === "xai") {
          await generateXaiCompletion(messages, res);
          return;
        }
      }
      
      // Non-streaming path
      let result;
      
      switch (provider) {
        case "gemini":
          result = await generateGeminiCompletion(messages);
          break;
        case "groq":
          result = await generateGroqCompletion(messages);
          break;
        case "xai":
          result = await generateXaiCompletion(messages);
          break;
        default:
          return res.status(400).json({ message: "Invalid or unsupported provider" });
      }
      
      if (!result.success) {
        // Return a more specific error message with a 400 status code
        return res.status(400).json({ message: result.error || "Failed to generate completion" });
      }
      
      // Only save successful chat history
      await storage.saveChatHistory({
        userId: req.user.id,
        provider,
        messages: [...messages, result.message],
        title: messages[0].content.substring(0, 50) + "..."
      });
      
      // If we're in streaming mode but didn't use the streaming function, end the stream
      if (stream) {
        // Clean up the response text
        const cleanedContent = result.message.content.trim();
        
        // Simulate word-by-word streaming
        const words = cleanedContent.split(' ');
        let streamedContent = '';
        
        for (const word of words) {
          streamedContent += word + ' ';
          res.write(`data: ${JSON.stringify({ content: word + ' ', fullContent: streamedContent })}\n\n`);
          // Small delay to simulate typing
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } else {
        // Regular JSON response
        res.status(200).json({
          message: result.message,
          usage: result.usage
        });
      }
    } catch (error) {
      console.error("Error in chat completion:", error);
      res.status(500).json({ message: "Failed to generate completion. Please check your API key and try again." });
    }
  });

  // ... (rest of the file remains unchanged)

  const httpServer = createServer(app);
  return httpServer;
}
