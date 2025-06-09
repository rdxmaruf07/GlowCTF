import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "../storage";
import { isAdmin } from "../middleware/auth";
import { challengeHostingService } from "../services/challenge-hosting-service";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'challenges');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types for CTF challenges
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/gif',
      'application/octet-stream'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only ZIP, text, PDF, and image files are allowed.'));
    }
  }
});

export function setupEnhancedChallengeRoutes(app: any) {
  
  // Enhanced challenge creation with file uploads
  app.post("/api/admin/challenges/enhanced", 
    isAdmin, 
    upload.array('attachments', 5), // Allow up to 5 files
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          title,
          description,
          difficulty,
          category,
          points,
          flag,
          imageUrl,
          author,
          hints,
          serviceUrl,
          dockerImage,
          flagFormat,
          maxAttempts,
          timeLimit,
          firstBloodBonus,
          tags
        } = req.body;

        // Validate required fields
        if (!title || !description || !difficulty || !category || !points || !flag) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Parse JSON fields
        let parsedHints = [];
        let parsedTags = [];
        
        try {
          if (hints) parsedHints = JSON.parse(hints);
          if (tags) parsedTags = JSON.parse(tags);
        } catch (error) {
          return res.status(400).json({ message: "Invalid JSON format for hints or tags" });
        }

        // Create challenge
        const challenge = await storage.createEnhancedChallenge({
          title,
          description,
          difficulty,
          category,
          points: parseInt(points),
          flag,
          imageUrl: imageUrl || null,
          author: author || null,
          hints: parsedHints.length > 0 ? JSON.stringify(parsedHints) : null,
          serviceUrl: serviceUrl || null,
          dockerImage: dockerImage || null,
          flagFormat: flagFormat || null,
          maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
          timeLimit: timeLimit ? parseInt(timeLimit) : null,
          firstBloodBonus: firstBloodBonus ? parseInt(firstBloodBonus) : 0,
          tags: parsedTags.length > 0 ? JSON.stringify(parsedTags) : null,
          isActive: true
        });

        // Handle file attachments
        const attachments = [];
        if (req.files && Array.isArray(req.files)) {
          for (const file of req.files) {
            const fileUrl = `/uploads/challenges/${file.filename}`;
            const attachment = await storage.addChallengeFile({
              challengeId: challenge.id,
              fileName: file.originalname,
              fileUrl,
              fileSize: file.size,
              fileType: file.mimetype
            });
            attachments.push(attachment);
          }
        }

        res.status(201).json({
          ...challenge,
          attachments
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Get challenge with enhanced details
  app.get("/api/challenges/:id/enhanced", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challengeId = parseInt(req.params.id);
      
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Get challenge files
      const files = await storage.getChallengeFiles(challengeId);
      
      // Get submission statistics
      const stats = await storage.getChallengeStats(challengeId);

      // Parse JSON fields
      const enhancedChallenge = {
        ...challenge,
        hints: challenge.hints ? JSON.parse(challenge.hints) : [],
        tags: challenge.tags ? JSON.parse(challenge.tags) : [],
        attachments: files,
        stats
      };

      res.json(enhancedChallenge);
    } catch (error) {
      next(error);
    }
  });

  // Enhanced flag submission with detailed tracking
  app.post("/api/challenges/:id/submit/enhanced", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to submit flags" });
      }

      const userId = req.user.id;
      const challengeId = parseInt(req.params.id);
      const { flag, startTime } = req.body;

      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      if (!flag) {
        return res.status(400).json({ message: "Flag is required" });
      }

      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Check if challenge is active
      if (!challenge.isActive) {
        return res.status(400).json({ message: "This challenge is currently inactive" });
      }

      // Check attempt limits
      if (challenge.maxAttempts && challenge.maxAttempts > 0) {
        const attemptCount = await storage.getUserAttemptCount(userId, challengeId);
        if (attemptCount >= challenge.maxAttempts) {
          return res.status(400).json({ 
            message: `Maximum attempts (${challenge.maxAttempts}) exceeded for this challenge` 
          });
        }
      }

      // Check if already completed
      const completedChallenges = await storage.getUserCompletedChallenges(userId);
      const alreadyCompleted = completedChallenges.some(c => c.id === challengeId);

      if (alreadyCompleted) {
        return res.status(400).json({ message: "You have already completed this challenge" });
      }

      // Validate flag format if specified
      let isValidFormat = true;
      if (challenge.flagFormat) {
        const regex = new RegExp(challenge.flagFormat);
        isValidFormat = regex.test(flag);
      }

      // Record the submission attempt
      await storage.recordFlagSubmission({
        userId,
        challengeId,
        submittedFlag: flag,
        isCorrect: false, // Will update if correct
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Check if flag is correct
      const isCorrect = flag === challenge.flag && isValidFormat;

      if (!isCorrect) {
        return res.status(200).json({ 
          success: false, 
          message: isValidFormat ? "Incorrect flag. Try again!" : "Flag format is invalid" 
        });
      }

      // Calculate scoring
      const timeToSolve = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
      const scoring = await storage.calculateChallengeScore(challenge, timeToSolve, userId);

      // Record completion
      await storage.completeChallenge({
        userId,
        challengeId,
        timeToSolve,
        pointsAwarded: scoring.totalPoints
      });

      // Update submission record
      await storage.updateFlagSubmission(userId, challengeId, flag, true);

      // Update user score
      await storage.updateUserScore(userId, scoring.totalPoints);

      // Check for badges
      const earnedBadges = await storage.checkAndAwardBadges(userId, challengeId);

      res.json({
        success: true,
        message: "Congratulations! Flag is correct.",
        ...scoring,
        newBadges: earnedBadges
      });

    } catch (error) {
      next(error);
    }
  });

  // Get challenge hints (with progressive unlock)
  app.get("/api/challenges/:id/hints", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view hints" });
      }

      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallengeById(challengeId);

      if (!challenge || !challenge.hints) {
        return res.json({ hints: [] });
      }

      const hints = JSON.parse(challenge.hints);
      const userProgress = await storage.getUserChallengeProgress(req.user.id, challengeId);

      // Progressive hint unlock based on attempts or time
      const unlockedHints = hints.slice(0, Math.min(hints.length, userProgress.attemptCount + 1));

      res.json({ hints: unlockedHints });
    } catch (error) {
      next(error);
    }
  });

  // Challenge hosting endpoints

  // Deploy a challenge container (admin only)
  app.post("/api/admin/challenges/:id/deploy", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challengeId = parseInt(req.params.id);

      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      const container = await challengeHostingService.deployChallenge(challengeId);

      res.json({
        success: true,
        message: "Challenge deployed successfully",
        container: {
          id: container.id,
          port: container.port,
          status: container.status,
          url: challengeHostingService.getChallengeUrl(challengeId)
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Stop a challenge container (admin only)
  app.post("/api/admin/challenges/:id/stop", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challengeId = parseInt(req.params.id);

      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      await challengeHostingService.stopChallenge(challengeId);

      res.json({
        success: true,
        message: "Challenge stopped successfully"
      });
    } catch (error) {
      next(error);
    }
  });

  // Get challenge access URL
  app.get("/api/challenges/:id/access", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to access challenges" });
      }

      const challengeId = parseInt(req.params.id);

      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      // Update last accessed time
      challengeHostingService.updateLastAccessed(challengeId);

      const url = challengeHostingService.getChallengeUrl(challengeId);

      if (!url) {
        // Try to deploy the challenge if it's not running
        try {
          const container = await challengeHostingService.deployChallenge(challengeId);
          const newUrl = challengeHostingService.getChallengeUrl(challengeId);

          res.json({
            success: true,
            url: newUrl,
            status: 'deployed',
            message: 'Challenge deployed and ready'
          });
        } catch (deployError) {
          res.status(500).json({
            success: false,
            message: 'Challenge is not available and could not be deployed'
          });
        }
      } else {
        res.json({
          success: true,
          url,
          status: 'running',
          message: 'Challenge is ready'
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // List all running challenges (admin only)
  app.get("/api/admin/challenges/running", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const runningChallenges = challengeHostingService.getRunningChallenges();

      const challengesWithDetails = await Promise.all(
        runningChallenges.map(async (container) => {
          const challenge = await storage.getChallengeById(container.challengeId);
          return {
            ...container,
            challenge: challenge ? {
              title: challenge.title,
              category: challenge.category,
              difficulty: challenge.difficulty
            } : null,
            url: challengeHostingService.getChallengeUrl(container.challengeId)
          };
        })
      );

      res.json({
        success: true,
        challenges: challengesWithDetails,
        count: challengesWithDetails.length
      });
    } catch (error) {
      next(error);
    }
  });

  // Build challenge Docker image (admin only)
  app.post("/api/admin/challenges/:id/build", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challengeId = parseInt(req.params.id);

      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      await challengeHostingService.buildChallengeImage(challengeId);

      res.json({
        success: true,
        message: "Challenge image built successfully"
      });
    } catch (error) {
      next(error);
    }
  });
}
