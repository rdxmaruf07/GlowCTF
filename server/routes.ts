import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupAdminRoutes } from "./admin";
import { storage } from "./mysql-storage";
import axios from "axios";
import { insertChallengeSchema } from "@shared/mysql-schema";
import { 
  generateOpenAICompletion, 
  generateAnthropicCompletion,
  generateGeminiCompletion,
  generateAIMLCompletion,
  generateOpenRouterCompletion,
  generateTogetherCompletion,
  generateGroqCompletion,
  initializeAIClients,
  verifyApiKey
} from "./services/chatbot";
import { setupChallengeRoutes } from "./routes/challenge-routes";
import { setupContestRoutes } from "./routes/contest-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up admin routes
  setupAdminRoutes(app);
  
  // Initialize AI clients with keys from database
  await initializeAIClients();
  
  // Set up challenge and contest routes
  setupChallengeRoutes(app);
  setupContestRoutes(app);
  
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
      const validProviders = ["openai", "anthropic", "gemini", "aiml", "openrouter", "together", "groq"];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({ message: "Invalid provider" });
      }
      
      // Basic API key validation
      if (!key || typeof key !== 'string' || key.trim().length < 10) {
        return res.status(400).json({ message: "Invalid API key format" });
      }
      
      // Provider-specific validation
      if (provider === "openai" && !key.startsWith("sk-")) {
        return res.status(400).json({ message: "Invalid OpenAI API key format. Keys should start with 'sk-'" });
      }
      
      if (provider === "anthropic" && !key.startsWith("sk-ant-")) {
        return res.status(400).json({ message: "Invalid Anthropic API key format. Keys should start with 'sk-ant-'" });
      }
      
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
        
        // Only OpenAI supports streaming for now
        if (provider === "openai") {
          // This function will handle the streaming response
          await generateOpenAICompletion(messages, res);
          
          // The response is handled by the streaming function
          // We don't need to save chat history here as it's done in the client
          return;
        } else {
          // For other providers, we'll simulate streaming with a message
          res.write(`data: ${JSON.stringify({ content: "Streaming is only supported for OpenAI. Using regular response instead." })}\n\n`);
        }
      }
      
      // Non-streaming path
      let result;
      
      switch (provider) {
        case "openai":
          result = await generateOpenAICompletion(messages);
          break;
        case "anthropic":
          result = await generateAnthropicCompletion(messages);
          break;
        case "gemini":
          result = await generateGeminiCompletion(messages);
          break;
        case "aiml":
          result = await generateAIMLCompletion(messages);
          break;
        case "openrouter":
          result = await generateOpenRouterCompletion(messages);
          break;
        case "together":
          result = await generateTogetherCompletion(messages);
          break;
        case "groq":
          result = await generateGroqCompletion(messages);
          // The generateGroqCompletion function now returns an error message about the package being unavailable
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

  // TryHackMe integration
  app.get("/api/tryhackme/challenges", async (req, res) => {
    try {
      // We'll use a mock response for now as direct TryHackMe API access requires authentication
      // In a production environment, you would integrate with the actual TryHackMe API
      const tryHackMeChallenges = [
        // Easy Challenges
        {
          id: "thm1",
          title: "Basic Pentesting",
          category: "Penetration Testing",
          difficulty: "easy",
          description: "This room is aimed at complete beginners. Learn the basic workflow of pentesting.",
          points: 200,
          hints: ["Start with reconnaissance", "Look for open ports", "Check for weak credentials"],
          roomUrl: "https://tryhackme.com/room/basicpentestingjt"
        },
        {
          id: "thm2",
          title: "OWASP Top 10",
          category: "Web",
          difficulty: "easy",
          description: "Learn about the OWASP Top 10 vulnerabilities in web applications.",
          points: 250,
          hints: ["Focus on understanding each vulnerability type", "Try to exploit each vulnerability"],
          roomUrl: "https://tryhackme.com/room/owasptop10"
        },
        {
          id: "thm3",
          title: "Vulnversity",
          category: "Web",
          difficulty: "easy",
          description: "Learn about active recon, web app attacks and privilege escalation.",
          points: 200,
          hints: ["Use nmap for initial scanning", "Look for upload vulnerabilities"],
          roomUrl: "https://tryhackme.com/room/vulnversity"
        },
        {
          id: "thm4",
          title: "Blue",
          category: "Exploitation",
          difficulty: "easy",
          description: "Deploy & hack into a Windows machine, exploiting EternalBlue.",
          points: 250,
          hints: ["Research MS17-010", "Use Metasploit for exploitation"],
          roomUrl: "https://tryhackme.com/room/blue"
        },
        {
          id: "thm5",
          title: "Introductory Networking",
          category: "Networking",
          difficulty: "easy",
          description: "An introduction to networking theory and basic networking tools.",
          points: 150,
          hints: ["Learn the OSI model", "Understand basic networking commands"],
          roomUrl: "https://tryhackme.com/room/introtonetworking"
        },
        
        // Medium Challenges
        {
          id: "thm6",
          title: "Mr Robot CTF",
          category: "Web",
          difficulty: "medium",
          description: "Based on the Mr. Robot show, can you root this box?",
          points: 350,
          hints: ["Look for hidden directories", "Check for CMS vulnerabilities"],
          roomUrl: "https://tryhackme.com/room/mrrobot"
        },
        {
          id: "thm7",
          title: "Game Zone",
          category: "Web",
          difficulty: "medium",
          description: "Learn about SQL injection, directory traversal and privilege escalation.",
          points: 300,
          hints: ["Try SQL injection on the login form", "Look for ways to escalate privileges"],
          roomUrl: "https://tryhackme.com/room/gamezone"
        },
        {
          id: "thm8",
          title: "Pickle Rick",
          category: "Web",
          difficulty: "medium",
          description: "A Rick and Morty CTF. Help Rick find the ingredients he needs.",
          points: 300,
          hints: ["Check the page source", "Look for command execution vulnerabilities"],
          roomUrl: "https://tryhackme.com/room/picklerick"
        },
        {
          id: "thm9",
          title: "RootMe",
          category: "Web",
          difficulty: "medium",
          description: "A ctf for beginners, can you root me?",
          points: 350,
          hints: ["Look for file upload vulnerabilities", "Find SUID binaries for privilege escalation"],
          roomUrl: "https://tryhackme.com/room/rrootme"
        },
        {
          id: "thm10",
          title: "Metasploit",
          category: "Exploitation",
          difficulty: "medium",
          description: "Learn to use Metasploit, a powerful penetration testing framework.",
          points: 300,
          hints: ["Learn the basic Metasploit commands", "Understand how to use exploits and payloads"],
          roomUrl: "https://tryhackme.com/room/rpmetasploit"
        },
        
        // Hard Challenges
        {
          id: "thm11",
          title: "HackPark",
          category: "Windows",
          difficulty: "hard",
          description: "Bruteforce a website login, use Windows Privilege Escalation techniques.",
          points: 450,
          hints: ["Use Hydra for brute forcing", "Look for scheduled tasks for privilege escalation"],
          roomUrl: "https://tryhackme.com/room/hackpark"
        },
        {
          id: "thm12",
          title: "Steel Mountain",
          category: "Windows",
          difficulty: "hard",
          description: "Hack into a Mr. Robot themed Windows machine.",
          points: 450,
          hints: ["Enumerate running services", "Look for unquoted service paths"],
          roomUrl: "https://tryhackme.com/room/steelmountain"
        },
        {
          id: "thm13",
          title: "Alfred",
          category: "Windows",
          difficulty: "hard",
          description: "Exploit Jenkins to gain an initial shell, then escalate privileges.",
          points: 500,
          hints: ["Look for default credentials", "Use PowerShell for privilege escalation"],
          roomUrl: "https://tryhackme.com/room/alfred"
        },
        {
          id: "thm14",
          title: "Skynet",
          category: "Linux",
          difficulty: "hard",
          description: "A vulnerable Terminator themed Linux machine.",
          points: 500,
          hints: ["Enumerate SMB shares", "Look for vulnerable CMS installations"],
          roomUrl: "https://tryhackme.com/room/skynet"
        },
        {
          id: "thm15",
          title: "Daily Bugle",
          category: "Web",
          difficulty: "hard",
          description: "Compromise a Joomla CMS account, practice SQL injection, and gain root access.",
          points: 550,
          hints: ["Research Joomla vulnerabilities", "Look for database credentials"],
          roomUrl: "https://tryhackme.com/room/dailybugle"
        }
      ];
      
      res.status(200).json(tryHackMeChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch TryHackMe challenges" });
    }
  });
  
  app.post("/api/tryhackme/import", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const { challenges } = req.body;
      
      if (!Array.isArray(challenges) || challenges.length === 0) {
        return res.status(400).json({ message: "Invalid challenges data" });
      }
      
      const importedChallenges = [];
      
      for (const thmChallenge of challenges) {
        // Convert TryHackMe challenge format to our format
        const challengeData = {
          title: thmChallenge.title,
          description: thmChallenge.description,
          difficulty: thmChallenge.difficulty,
          category: thmChallenge.category,
          points: thmChallenge.points,
          flag: thmChallenge.flag || `flag{${thmChallenge.id}_placeholder}`, // In real implementation, admin would add correct flags
          imageUrl: thmChallenge.imageUrl || "https://images.unsplash.com/photo-1563089145-599997674d42"
        };
        
        try {
          // Validate with our schema
          const parsedData = insertChallengeSchema.parse(challengeData);
          const importedChallenge = await storage.createChallenge(parsedData);
          importedChallenges.push(importedChallenge);
        } catch (parseError) {
          console.error(`Failed to import challenge ${thmChallenge.title}:`, parseError);
          // Continue with next challenge even if one fails
        }
      }
      
      res.status(200).json({ 
        success: true, 
        count: importedChallenges.length,
        challenges: importedChallenges
      });
    } catch (error) {
      console.error("Failed to import TryHackMe challenges:", error);
      res.status(500).json({ message: "Failed to import TryHackMe challenges" });
    }
  });
  
  app.post("/api/tryhackme/submit/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { flag, startTime, solution } = req.body;
    const challengeId = req.params.id;
    
    try {
      // Find the challenge by its TryHackMe ID from our database
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
        
        // Save solution if provided
        if (solution) {
          // In a real implementation, you would save the solution to a database or file
          // For now, we'll just log it
          console.log(`User ${req.user.id} submitted solution for challenge ${challenge.id}:`, solution);
          
          // Save to flag.txt file (this would be implemented differently in production)
          // This is just a placeholder for the concept
          const flagData = {
            userId: req.user.id,
            username: req.user.username,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            flag: flag,
            solution: solution,
            timestamp: new Date().toISOString()
          };
          
          // In a real implementation, you would save this to a file or database
          console.log("Flag data to be saved:", flagData);
        }
        
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
      console.error("Failed to process TryHackMe submission:", error);
      res.status(500).json({ message: "Failed to process submission" });
    }
  });

  // Platform CTF integration
  app.get("/api/platformctf/challenges", async (req, res) => {
    try {
      // Mock response for Platform CTF challenges
      const platformCTFChallenges = [
        // Easy Challenges
        {
          id: "platformctf1",
          title: "Buffer Overflow Basics",
          category: "Binary Exploitation",
          difficulty: "easy",
          description: "This challenge introduces the concept of buffer overflows. Exploit the vulnerability to get the flag.",
          points: 150,
          hints: ["Look for unbounded input functions", "What happens when you write beyond the buffer's capacity?"],
          flag_format: "flag{buffer_overflow_101}"
        },
        {
          id: "platformctf2",
          title: "Format String Vulnerability",
          category: "Binary Exploitation",
          difficulty: "easy",
          description: "Learn about format string vulnerabilities and how they can be exploited to leak memory.",
          points: 200,
          hints: ["printf() without proper formatting can be dangerous", "Try using format specifiers like %x or %p"],
          flag_format: "flag{format_strings_are_dangerous}"
        },
        {
          id: "platformctf3",
          title: "Basic Reversing",
          category: "Reverse Engineering",
          difficulty: "easy",
          description: "Analyze the assembly code to find the correct input that will give you the flag.",
          points: 175,
          hints: ["Use a disassembler like Ghidra or IDA Pro", "Look for comparison operations"],
          files: [{ name: "challenge.bin", url: "https://example.com/files/challenge.bin" }],
          flag_format: "flag{reversing_is_fun}"
        },
        {
          id: "platformctf4",
          title: "Patching Binary",
          category: "Reverse Engineering",
          difficulty: "easy",
          description: "Modify the binary to bypass the authentication check and get the flag.",
          points: 225,
          hints: ["Look for conditional jumps that check authentication", "You can use a hex editor to modify the binary"],
          files: [{ name: "auth.bin", url: "https://example.com/files/auth.bin" }],
          flag_format: "flag{binary_patching_success}"
        },
        {
          id: "platformctf5",
          title: "Simple Shellcode",
          category: "Binary Exploitation",
          difficulty: "easy",
          description: "Write a simple shellcode to execute /bin/sh and get the flag.",
          points: 250,
          hints: ["Look up shellcode examples online", "Remember to handle null bytes"],
          files: [{ name: "shellcode.c", url: "https://example.com/files/shellcode.c" }],
          flag_format: "flag{shellcode_execution_success}"
        },
        
        // Medium Challenges
        {
          id: "platformctf6",
          title: "Return-Oriented Programming",
          category: "Binary Exploitation",
          difficulty: "medium",
          description: "Use ROP techniques to bypass non-executable stack protection and get the flag.",
          points: 350,
          hints: ["Identify useful gadgets in the binary", "Chain them together to execute your payload"],
          files: [{ name: "rop_challenge.bin", url: "https://example.com/files/rop_challenge.bin" }],
          flag_format: "flag{rop_chain_success}"
        },
        {
          id: "platformctf7",
          title: "Heap Exploitation",
          category: "Binary Exploitation",
          difficulty: "medium",
          description: "Exploit heap vulnerabilities like use-after-free or double-free to get the flag.",
          points: 400,
          hints: ["Look for memory management bugs", "Understand how the heap allocator works"],
          files: [{ name: "heap_challenge.c", url: "https://example.com/files/heap_challenge.c" }],
          flag_format: "flag{heap_exploitation_success}"
        },
        {
          id: "platformctf8",
          title: "Anti-Debugging Techniques",
          category: "Reverse Engineering",
          difficulty: "medium",
          description: "Bypass anti-debugging techniques to analyze the binary and find the flag.",
          points: 375,
          hints: ["Look for ptrace calls or timing checks", "You might need to patch the binary"],
          files: [{ name: "anti_debug.bin", url: "https://example.com/files/anti_debug.bin" }],
          flag_format: "flag{anti_debugging_bypassed}"
        },
        {
          id: "platformctf9",
          title: "Custom Encryption Algorithm",
          category: "Cryptography",
          difficulty: "medium",
          description: "Reverse engineer a custom encryption algorithm and decrypt the flag.",
          points: 325,
          hints: ["Break down the algorithm step by step", "Look for weaknesses in the implementation"],
          files: [{ name: "encrypt.py", url: "https://example.com/files/encrypt.py" }],
          flag_format: "flag{custom_crypto_broken}"
        },
        {
          id: "platformctf10",
          title: "Kernel Module Analysis",
          category: "Reverse Engineering",
          difficulty: "medium",
          description: "Analyze a Linux kernel module to find vulnerabilities and extract the flag.",
          points: 425,
          hints: ["Look for improper IOCTL handlers", "Check for missing input validation"],
          files: [{ name: "kernel_mod.ko", url: "https://example.com/files/kernel_mod.ko" }],
          flag_format: "flag{kernel_vulnerability_found}"
        },
        
        // Hard Challenges
        {
          id: "platformctf11",
          title: "Advanced Exploitation",
          category: "Binary Exploitation",
          difficulty: "hard",
          description: "Combine multiple exploitation techniques to bypass all protections and get the flag.",
          points: 500,
          hints: ["You'll need to bypass ASLR, NX, and stack canaries", "Look for information leaks"],
          files: [{ name: "advanced_exploit.bin", url: "https://example.com/files/advanced_exploit.bin" }],
          flag_format: "flag{advanced_exploitation_master}"
        },
        {
          id: "platformctf12",
          title: "VM Escape",
          category: "Binary Exploitation",
          difficulty: "hard",
          description: "Escape from a virtual machine to access the host system and find the flag.",
          points: 550,
          hints: ["Look for vulnerabilities in the VM's implementation", "Focus on the interface between guest and host"],
          files: [{ name: "vm.zip", url: "https://example.com/files/vm.zip" }],
          flag_format: "flag{vm_escape_success}"
        },
        {
          id: "platformctf13",
          title: "Obfuscated Code Analysis",
          category: "Reverse Engineering",
          difficulty: "hard",
          description: "Analyze heavily obfuscated code to understand its functionality and find the flag.",
          points: 475,
          hints: ["Look for patterns in the obfuscation", "Try to simplify the code step by step"],
          files: [{ name: "obfuscated.js", url: "https://example.com/files/obfuscated.js" }],
          flag_format: "flag{obfuscation_defeated}"
        },
        {
          id: "platformctf14",
          title: "Side-Channel Attack",
          category: "Cryptography",
          difficulty: "hard",
          description: "Exploit timing or power analysis side-channels to extract the encryption key and decrypt the flag.",
          points: 525,
          hints: ["Measure execution time for different inputs", "Look for patterns in the timing differences"],
          files: [{ name: "side_channel.py", url: "https://example.com/files/side_channel.py" }],
          flag_format: "flag{side_channel_attack_success}"
        },
        {
          id: "platformctf15",
          title: "Custom CPU Architecture",
          category: "Reverse Engineering",
          difficulty: "hard",
          description: "Reverse engineer a custom CPU architecture and emulator to understand the program and find the flag.",
          points: 600,
          hints: ["First understand the instruction set", "Then analyze the program logic"],
          files: [{ name: "custom_cpu.zip", url: "https://example.com/files/custom_cpu.zip" }],
          flag_format: "flag{custom_architecture_mastered}"
        }
      ];
      
      res.status(200).json(platformCTFChallenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Platform CTF challenges" });
    }
  });
  
  app.post("/api/platformctf/submit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { challengeId, flag, startTime, solution } = req.body;
    
    try {
      // Find the challenge by its Platform CTF ID from our database
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
        
        // Save solution if provided
        if (solution) {
          // In a real implementation, you would save the solution to a database or file
          // For now, we'll just log it
          console.log(`User ${req.user.id} submitted solution for challenge ${challenge.id}:`, solution);
          
          // Save to CTF.txt file (this would be implemented differently in production)
          // This is just a placeholder for the concept
          const flagData = {
            userId: req.user.id,
            username: req.user.username,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            flag: flag,
            solution: solution,
            timestamp: new Date().toISOString()
          };
          
          // In a real implementation, you would save this to a file or database
          console.log("Flag data to be saved:", flagData);
        }
        
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
      console.error("Failed to process Platform CTF submission:", error);
      res.status(500).json({ message: "Failed to process submission" });
    }
  });

  // PicoCTF integration
  app.get("/api/picoctf/challenges", async (req, res) => {
    try {
      // We'll use a mock response for now as direct PicoCTF API access requires authentication
      // In a production environment, you would integrate with the actual PicoCTF API
      const picoCTFChallenges = [
        // Easy Challenges
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
          title: "Nice netcat...",
          category: "General Skills",
          difficulty: "easy",
          description: "There is a nice program that you can talk to by using this command in a shell: $ nc mercury.picoctf.net 43239, but it doesn't speak English...",
          points: 150,
          hints: ["You can practice using netcat with this picoGym problem: https://play.picoctf.org/practice/challenge/34", "You can practice reading and writing ASCII with this picoGym problem: https://play.picoctf.org/practice/challenge/22"]
        },
        {
          id: "pico6",
          title: "Static ain't always noise",
          category: "General Skills",
          difficulty: "easy",
          description: "Can you look at the data in this binary: static? This BASH script might help!",
          points: 150,
          hints: ["Any strings in the binary?"],
          files: [
            { name: "static", url: "https://mercury.picoctf.net/static/bc72945175d643626d6ea9a689672dbd/static" },
            { name: "ltdis.sh", url: "https://mercury.picoctf.net/static/bc72945175d643626d6ea9a689672dbd/ltdis.sh" }
          ]
        },
        
        // Medium Challenges
        {
          id: "pico7",
          title: "Information",
          category: "Forensics",
          difficulty: "medium",
          description: "Files can always be changed in a secret way. Can you find the flag?",
          points: 300,
          hints: ["Look at the details of the file", "Make sure to submit the flag as picoCTF{XXXXX}"],
          files: [{ name: "cat.jpg", url: "https://mercury.picoctf.net/static/a614a27d4cb251d04c7d2f3f3f76a965/cat.jpg" }]
        },
        {
          id: "pico8",
          title: "Transformation",
          category: "Reverse Engineering",
          difficulty: "medium",
          description: "I wonder what this really is... enc ''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])",
          points: 300,
          hints: ["You may find some decoders online"],
          files: [{ name: "enc", url: "https://mercury.picoctf.net/static/77a2b202236aa741e988581e78d277a6/enc" }]
        },
        {
          id: "pico9",
          title: "Stonks",
          category: "Binary Exploitation",
          difficulty: "medium",
          description: "I decided to try something noone else has before. I made a bot to automatically trade stonks for me using AI and machine learning. I wouldn't believe you if you told me it's unsecure!",
          points: 350,
          hints: ["Okay, maybe I'd believe you if you find my API key"],
          files: [
            { name: "vuln.c", url: "https://mercury.picoctf.net/static/e4d297ce964e4f54225786fe7b153b4b/vuln.c" },
            { name: "Makefile", url: "https://mercury.picoctf.net/static/e4d297ce964e4f54225786fe7b153b4b/Makefile" }
          ]
        },
        {
          id: "pico10",
          title: "Mind your Ps and Qs",
          category: "Cryptography",
          difficulty: "medium",
          description: "In RSA, a small e value can be problematic, but what about N? Can you decrypt this?",
          points: 400,
          hints: ["Bits are expensive, I used only a little bit over 100 to save money"],
          files: [{ name: "values", url: "https://mercury.picoctf.net/static/b9ddda080c56fb421bf30409bec3460c/values" }]
        },
        {
          id: "pico11",
          title: "Cookies",
          category: "Web Exploitation",
          difficulty: "medium",
          description: "Who doesn't love cookies? Try to figure out the best one.",
          points: 300,
          hints: ["Apply your browser developer tools"]
        },
        
        // Hard Challenges
        {
          id: "pico12",
          title: "Wireshark doo dooo do doo...",
          category: "Forensics",
          difficulty: "hard",
          description: "Can you find the flag? shark1.pcapng.",
          points: 450,
          hints: ["All these protocols, so little time"],
          files: [{ name: "shark1.pcapng", url: "https://mercury.picoctf.net/static/81c7862241faf4a48bd64a858392c92b/shark1.pcapng" }]
        },
        {
          id: "pico13",
          title: "Scrambled: RSA",
          category: "Cryptography",
          difficulty: "hard",
          description: "Hmmm I wonder if you have a big enough brain to decrypt this?",
          points: 500,
          hints: ["RSA encryption is based on the difficulty of factoring large numbers", "The decryption is based on Euler's Theorem"],
          files: [{ name: "scrambled.py", url: "https://mercury.picoctf.net/static/3cfdd6592d2b0cd30041f22b3d8c1d84/scrambled.py" }]
        },
        {
          id: "pico14",
          title: "Some Assembly Required 2",
          category: "Web Exploitation",
          difficulty: "hard",
          description: "There is some assembly required. Can you get the flag?",
          points: 550,
          hints: ["Analyze the WebAssembly code"]
        },
        {
          id: "pico15",
          title: "Reverse Engineering: ARMssembly 3",
          category: "Reverse Engineering",
          difficulty: "hard",
          description: "What integer does this program print with argument 4189673334? File: chall_3.S",
          points: 500,
          hints: ["Shifts are useful in ARM assembly"],
          files: [{ name: "chall_3.S", url: "https://mercury.picoctf.net/static/e7b2d6ff8e55b64ddd2c7c361709e2a9/chall_3.S" }]
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
