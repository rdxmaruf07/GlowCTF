import type { Express } from "express";
import { storage } from "../mysql-storage";

export function setupLandingRoutes(app: Express) {
  // Landing page specific API endpoints
  
  // Get landing page statistics
  app.get("/api/landing/stats", async (req, res) => {
    try {
      const stats = await storage.getLandingStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching landing stats:", error);
      res.status(500).json({ message: "Failed to fetch landing statistics" });
    }
  });

  // Get recent activity for landing page
  app.get("/api/landing/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity(10); // Get last 10 activities
      res.status(200).json(activity);
    } catch (error) {
      console.error("Error fetching landing activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Get featured challenges for landing page
  app.get("/api/landing/challenges", async (req, res) => {
    try {
      const challenges = await storage.getFeaturedChallenges(6); // Get 6 featured challenges
      res.status(200).json(challenges);
    } catch (error) {
      console.error("Error fetching landing challenges:", error);
      res.status(500).json({ message: "Failed to fetch featured challenges" });
    }
  });

  // Get top users for landing page leaderboard
  app.get("/api/landing/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getTopUsers(10); // Get top 10 users
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Error fetching landing leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get global activity data for the map
  app.get("/api/landing/global-activity", async (req, res) => {
    try {
      const globalActivity = await storage.getGlobalActivity();
      res.status(200).json(globalActivity);
    } catch (error) {
      console.error("Error fetching global activity:", error);
      res.status(500).json({ message: "Failed to fetch global activity" });
    }
  });

  console.log("Landing routes setup completed");
}